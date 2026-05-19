import mongoose from 'mongoose';
import Order from "./order.model.js";
import Dish from "../dishes/dish.model.js";
import Restaurant from "../restaurants/restaurant.model.js";
import Employee from "../employees/employee.model.js";
import Invoice from "../invoice/invoice.model.js";
import { generatePDFBuffer } from "../invoice/invoice.controller.js";
import { sendInvoiceEmail } from "../../helpers/email-service.js";
import InventoryItem from "../inventories/inventory.model.js";
import Promotion from "../promotions/promotions.model.js";
import { notificationService } from '../notifications/notification.service.js';
import Client from "../client/client.model.js";

const parseActiveFilter = (value) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
        return undefined;
    }

    if (value === true || value === 'true' || value === 'active') {
        return true;
    }

    if (value === false || value === 'false' || value === 'inactive') {
        return false;
    }

    return undefined;
};

const ORDER_NOTIFICATION_MAP = {
    CONFIRMADO: {
        type: 'PEDIDO_CONFIRMADO',
        title: 'Pedido confirmado',
        message: 'Tu pedido ha sido confirmado. Tiempo estimado de preparación: 30 minutos.',
    },
    EN_PREPARACION: {
        type: 'PEDIDO_EN_PREPARACION',
        title: 'Pedido en preparación',
        message: 'Tu pedido está siendo preparado. Tiempo estimado: 20 minutos.',
    },
    LISTO: {
        type: 'PEDIDO_LISTO',
        title: 'Pedido listo',
        message: 'Tu pedido está listo y será servido en tu mesa en breve.',
    },
    ENTREGADO: {
        type: 'PEDIDO_ENTREGADO',
        title: 'Pedido entregado',
        message: '¡Tu pedido ha sido entregado! Buen provecho.',
    },
    CANCELADO: {
        type: 'PEDIDO_CANCELADO',
        title: 'Pedido cancelado',
        message: 'Tu pedido ha sido cancelado.',
    },
};

/**
 * Crea una orden única compatible con selección de ID o envío de objeto manual.
 */
export const createOrder = async (req, res) => {
    try {
        const { 
            restaurantId, 
            items, 
            addressId, 
            deliveryAddress, 
            deliveryType = 'DOMICILIO', 
            paymentMethod, 
            promotion 
        } = req.body;

        const client = req.user; // Ya sincronizado por el middleware syncClient
        const stockDeductions = [];

        if (!client) {
            return res.status(404).json({ success: false, message: "Cliente no encontrado" });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurante no encontrado" });
        }

        // --- Lógica de Promoción ---
        let activePromo = null;
        if (promotion) {
            const basicFilter = mongoose.Types.ObjectId.isValid(promotion) 
                ? { _id: promotion } 
                : { title: promotion };
            
            const promo = await Promotion.findOne(basicFilter);

            if (!promo) throw new Error("La promoción no es válida o no existe");
            if (promo.restaurant.toString() !== restaurantId.toString()) throw new Error("Esta promoción no aplica a este restaurante");
            if (promo.scope === 'EVENTOS') throw new Error("Esta promoción es exclusiva para eventos y no aplica a pedidos");
            if (!promo.isActive || promo.status !== 'APPROVED') throw new Error("La promoción no se encuentra activa");
            
            const now = new Date();
            if (now < promo.startDate || now > promo.endDate) throw new Error("La promoción ha expirado o aún no ha comenzado");
            
            activePromo = promo;

            if (activePromo.isOneTimeUse) {
                const alreadyUsed = await Order.findOne({ 
                    client: client._id, 
                    promotion: activePromo._id,
                    status: { $ne: 'CANCELADO' }
                });
                if (alreadyUsed) throw new Error("Ya has utilizado esta promoción anteriormente");
            }
        }

        // --- Hidratación de Items y Validación de Stock ---
        let totalOrder = 0;
        let promoAppliedCount = 0;

        const hydratedItems = await Promise.all(items.map(async (item) => {
            const dish = await Dish.findOne({
                _id: item.dishId,
                restaurant: restaurantId,
                isActive: true
            }).populate('ingredients.inventoryItem');

            if (!dish) {
                throw new Error(`El plato ${item.dishId} no está disponible en este restaurante`);
            }
            let subtotal = dish.price * item.quantity;

            for (const ingredient of dish.ingredients) {
                const totalNeeded = ingredient.quantityUsed * item.quantity;
                
                // --- Null Safety Check ---
                if (!ingredient.inventoryItem) {
                    throw new Error(`El ingrediente para el plato "${dish.name}" ya no existe en el inventario.`);
                }

                const currentStock = ingredient.inventoryItem.quantity || 0;

                if (currentStock < totalNeeded) {
                    throw new Error(`No hay suficiente stock de "${ingredient.inventoryItem.name}" para preparar ${item.quantity} unidades de ${dish.name}`);
                }

                stockDeductions.push({
                    inventoryItemId: ingredient.inventoryItem._id,
                    amountToDeduct: totalNeeded
                });
            }

            if (activePromo) {
                const isApplicable = activePromo.dishesApplicables.length === 0 || 
                                    activePromo.dishesApplicables.some(id => id.toString() === dish._id.toString());
                
                if (isApplicable) {
                    subtotal -= subtotal * (activePromo.discountPercentage / 100);
                    promoAppliedCount++;
                }
            }

            totalOrder += subtotal;

            return {
                productId: dish._id,
                name: dish.name,
                price: dish.price,
                quantity: item.quantity,
                subtotal: subtotal
            };
        }));

        if (activePromo && promoAppliedCount === 0 && activePromo.dishesApplicables.length > 0) {
            throw new Error("La promoción no es aplicable a ninguno de los platos seleccionados");
        }

        // --- Descontar Stock ---
        if (stockDeductions.length > 0) {
            const bulkOps = stockDeductions.map(d => ({
                updateOne: {
                    filter: { _id: d.inventoryItemId },
                    update: { $inc: { quantity: -d.amountToDeduct } }
                }
            }));
            await InventoryItem.bulkWrite(bulkOps);
        }

        // --- Lógica de Dirección ---
        const finalDeliveryType = deliveryType === 'RECOGER' ? 'RECOGER' : 'DOMICILIO';
        let finalAddress = { alias: "N/A", addressLine: "Recoger en tienda" };

        if (finalDeliveryType === 'DOMICILIO') {
            if (deliveryAddress && typeof deliveryAddress === 'object') {
                finalAddress = {
                    alias: deliveryAddress.alias || "Otro",
                    addressLine: deliveryAddress.addressLine || "",
                    houseNumber: deliveryAddress.houseNumber || "",
                    securityInfo: deliveryAddress.securityInfo || "",
                    reference: deliveryAddress.reference || ""
                };
            } else {
                const targetAddress = addressId 
                    ? client.addresses.id(addressId)
                    : client.addresses.find(a => a.isDefault) || client.addresses[0];
                
                if (!targetAddress) {
                    return res.status(400).json({ success: false, message: "No se encontró una dirección de entrega válida" });
                }

                finalAddress = {
                    alias: targetAddress.alias,
                    addressLine: targetAddress.addressLine,
                    houseNumber: targetAddress.houseNumber,
                    securityInfo: targetAddress.securityInfo,
                    reference: targetAddress.reference
                };
            }
        }

        // --- Crear Orden ---
        const newOrder = new Order({
            client: client._id,
            restaurant: restaurantId,
            deliveryType: finalDeliveryType,
            items: hydratedItems,
            total: totalOrder,
            deliveryAddress: finalAddress,
            paymentMethod,
            promotion: activePromo ? activePromo._id : null
        });

        const savedOrder = await newOrder.save();
        
        // --- Generar Factura ---
        const invoiceCount = await Invoice.countDocuments();
        const invoiceNumber = `INV-${Date.now()}-${(invoiceCount + 1).toString().padStart(4, '0')}`;

        const newInvoice = new Invoice({
            invoiceNumber,
            order: savedOrder._id,
            client: client._id,
            clientName: client.name,
            restaurant: restaurantId,
            restaurantName: restaurant.name,
            items: hydratedItems.map(i => ({
                name: i.name,
                quantity: i.quantity,
                price: i.price,
                subtotal: i.subtotal
            })),
            total: totalOrder,
            paymentMethod
        });

        const savedInvoice = await newInvoice.save();

        // --- Notificación y Email ---
        await notificationService.createAndEmit(
            String(savedOrder.client),
            'PEDIDO_RECIBIDO',
            'Pedido recibido',
            'Tu pedido ha sido recibido y está pendiente de confirmación.',
            savedOrder._id,
            'Order'
        );

        generatePDFBuffer(savedInvoice)
            .then(pdfBuffer => sendInvoiceEmail(client.email, pdfBuffer, savedInvoice.invoiceNumber))
            .catch(err => console.error("Error enviando factura:", err));

        res.status(201).json({
            success: true,
            message: "Pedido creado correctamente",
            order: savedOrder,
            invoice: savedInvoice
        });

    } catch (error) {
        console.error("Error en createOrder:", error);
        
        // Determinar si es un error de validación/lógica (como falta de stock) o de servidor
        const statusCode = error.message.includes("stock") || 
                           error.message.includes("disponible") || 
                           error.message.includes("promoción") 
                           ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            message: error.message || "Error al procesar el pedido",
            error: error.message
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const client = req.user;
        const orders = await Order.find({ client: client._id })
            .populate('restaurant', 'name photo address')
            .populate('items.productId', 'name photo')
            .populate('client', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: orders.length,
            orders
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el historial de pedidos",
            error: error.message
        });
    }
};

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const authenticatedClient = req.user;

        const order = await Order.findById(id)
            .populate('restaurant', 'name photo address phone')
            .populate('items.productId', 'name photo')
            .populate('client', 'name email')
            .lean();

        if (!order) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        const orderClientId = order.client?._id?.toString() || order.client?.toString();
        const authClientId = authenticatedClient._id.toString();

        if (orderClientId !== authClientId) {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para ver este pedido",
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener el detalle",
            error: error.message
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.user;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        // Enforce MANAGER_ROLE restriction for updates
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee || employee.restaurant.toString() !== order.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para gestionar pedidos de este restaurante"
                });
            }
        }

        const normalizedStatus = status.toUpperCase();

        if (normalizedStatus === 'CANCELADO') {
            const orderClientId = order.client?.toString();
            const authUserId = (user.uid || user._id || user.id)?.toString();

            if (user.role !== 'ADMIN_ROLE' && user.role !== 'MANAGER_ROLE') {
                if (!orderClientId || orderClientId !== authUserId) {
                    return res.status(403).json({
                        success: false,
                        message: "No tienes permiso para cancelar este pedido"
                    });
                }
                if (order.status !== 'PENDIENTE') {
                    return res.status(400).json({
                        success: false,
                        message: "No puedes cancelar un pedido que ya está en proceso o entregado"
                    });
                }
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { status: normalizedStatus },
            { returnDocument: 'after', runValidators: true }
        ).populate('restaurant', 'name');

        if (ORDER_NOTIFICATION_MAP[normalizedStatus]) {
            const notif = ORDER_NOTIFICATION_MAP[normalizedStatus];
            await notificationService.createAndEmit(
                String(updatedOrder.client),
                notif.type,
                notif.title,
                notif.message,
                updatedOrder._id,
                'Order'
            );
        }

        res.status(200).json({
            success: true,
            message: `Estado del pedido actualizado a ${status}`,
            order: updatedOrder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el estado del pedido",
            error: error.message
        });
    }
};

export const createOrderAdmin = async (req, res) => {
    try {
        const { clientId, restaurantId, items, paymentMethod, deliveryAddress, deliveryType } = req.body;
        const user = req.user;

        // Enforce MANAGER_ROLE restriction for creation
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee || employee.restaurant.toString() !== restaurantId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes crear pedidos para tu propio restaurante"
                });
            }
        }

        console.log("BODY RECIBIDO:", req.body);

        if (!clientId || !restaurantId) {
            return res.status(400).json({
                success: false,
                message: "Faltan campos obligatorios: clientId o restaurantId",
            });
        }
        const client = await Client.findOne({ _id: clientId.trim() });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: `El cliente con ID '${clientId}' no existe.`
            });
        }

        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: "Restaurante no encontrado" });
        }

        let totalOrder = 0;

        const hydratedItems = await Promise.all(items.map(async (item) => {
            const dish = await Dish.findOne({
                _id: item.dishId,
                restaurant: restaurantId,
                isActive: true
            });

            if (!dish) {
                throw new Error(`El plato con ID ${item.dishId} no está disponible en este restaurante`);
            }

            const subtotal = dish.price * item.quantity;
            totalOrder += subtotal;

            return {
                productId: dish._id,
                name: dish.name,
                price: dish.price,
                quantity: item.quantity,
                subtotal: subtotal
            };
        }));

        const newOrder = new Order({
            client: clientId,
            restaurant: restaurantId,
            items: hydratedItems,
            total: totalOrder,
            deliveryType: deliveryType || 'DOMICILIO',
            deliveryAddress: {
                alias: deliveryAddress.alias || "Dirección de Entrega",
                addressLine: deliveryAddress.addressLine,
            },
            paymentMethod,
            status: "CONFIRMADO"
        });

        const savedOrder = await newOrder.save();

        const invoiceCount = await Invoice.countDocuments();
        const invoiceNumber = `INV-ADM-${Date.now()}-${(invoiceCount + 1).toString().padStart(4, '0')}`;

        const newInvoice = new Invoice({
            invoiceNumber,
            order: savedOrder._id,
            client: clientId,
            clientName: client.name,
            restaurant: restaurantId,
            restaurantName: restaurant.name,
            items: hydratedItems,
            total: totalOrder,
            paymentMethod
        });

        const savedInvoice = await newInvoice.save();

        generatePDFBuffer(savedInvoice)
            .then(pdfBuffer => {
                return sendInvoiceEmail(client.email, pdfBuffer, savedInvoice.invoiceNumber);
            })
            .then(() => console.log(`Factura Admin enviada a ${client.email}`))
            .catch(err => console.error("Error enviando factura desde Admin:", err));

        res.status(201).json({
            success: true,
            message: "Orden administrativa creada y factura enviada",
            order: savedOrder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al procesar la orden administrativa",
            error: error.message
        });
    }
};

export const updateOrderAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { clientId, restaurantId, items, paymentMethod, deliveryAddress, deliveryType } = req.body;
        const user = req.user;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        // Enforce MANAGER_ROLE restriction for updates
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee || employee.restaurant.toString() !== order.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para actualizar pedidos de este restaurante"
                });
            }
            if (restaurantId && restaurantId.toString() !== employee.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No puedes transferir un pedido a otro restaurante"
                });
            }
        }

        const updateData = {};
        // ... rest of method
        if (clientId) updateData.client = clientId;
        if (restaurantId) updateData.restaurant = restaurantId;
        if (paymentMethod) updateData.paymentMethod = paymentMethod;
        if (deliveryType) updateData.deliveryType = deliveryType;
        if (deliveryAddress) {
            updateData.deliveryAddress = {
                alias: deliveryAddress.alias || order.deliveryAddress.alias,
                addressLine: deliveryAddress.addressLine || order.deliveryAddress.addressLine,
            };
        }

        if (items) {
            const restaurantIdToUse = restaurantId || order.restaurant;
            const hydratedItems = await Promise.all(items.map(async (item) => {
                const dish = await Dish.findOne({
                    _id: item.dishId,
                    restaurant: restaurantIdToUse,
                    isActive: true
                });

                if (!dish) {
                    throw new Error(`El plato con ID ${item.dishId} no está disponible en este restaurante`);
                }

                const subtotal = dish.price * item.quantity;

                return {
                    productId: dish._id,
                    name: dish.name,
                    price: dish.price,
                    quantity: item.quantity,
                    subtotal: subtotal
                };
            }));

            updateData.items = hydratedItems;
            updateData.total = hydratedItems.reduce((acc, item) => acc + item.subtotal, 0);
        }

        const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });

        res.status(200).json({
            success: true,
            message: "Pedido actualizado correctamente",
            order: updatedOrder
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el pedido",
            error: error.message
        });
    }
};

export const getOrders = async (req, res) => {
    try {
        const { page = 1, limit = 20, restaurante, isActive } = req.query;
        const user = req.user;
        const filter = {};

        // Enforce MANAGER_ROLE restriction for listing
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee) {
                return res.status(403).json({
                    success: false,
                    message: "No se encontró información de empleado para este manager."
                });
            }
            filter.restaurant = employee.restaurant;
        } else if (restaurante) {
            filter.restaurant = restaurante;
        }

        const normalizedIsActive = parseActiveFilter(isActive);
        if (normalizedIsActive !== undefined) {
            filter.isActive = normalizedIsActive;
        } else if (isActive === undefined) {
            filter.isActive = true;
        }
        
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const orders = await Order.find(filter)
            .populate('client', 'name email') 
            .populate('restaurant', 'name')
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Order.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: orders,
            pagination: {
                totalRecords: total,
                totalPages: Math.ceil(total / parsedLimit),
                currentPage: parsedPage,
                limit: parsedLimit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las órdenes',
            error: error.message
        });
    }
};

export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        // Enforce MANAGER_ROLE restriction for deletion
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee || employee.restaurant.toString() !== order.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para eliminar pedidos de este restaurante"
                });
            }
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            id,
            { isActive: false, status: 'CANCELADO' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Pedido no encontrado" });
        }

        // Restaurar notificación de cancelación
        await notificationService.createAndEmit(
            String(updatedOrder.client),
            ORDER_NOTIFICATION_MAP.CANCELADO.type,
            ORDER_NOTIFICATION_MAP.CANCELADO.title,
            ORDER_NOTIFICATION_MAP.CANCELADO.message,
            updatedOrder._id,
            'Order'
        );

        res.status(200).json({
            success: true,
            message: "Pedido cancelado correctamente",
            order: updatedOrder
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al eliminar el pedido",
            error: error.message
        });
    }
};
