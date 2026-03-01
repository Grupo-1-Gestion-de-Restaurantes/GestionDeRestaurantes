import Order from "./order.model.js";
import Dish from "../dishes/dish.model.js";
import Restaurante from "../restaurants/restaurant.model.js";
import Invoice from "../invoice/invoice.model.js";
import InventoryItem from "../inventories/inventory.model.js";
import Promotion from "../promotions/promotions.model.js";
import { notificationService } from '../notifications/notification.service.js';

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

export const createOrder = async (req, res) => {
    try {
        const { restaurantId, items, addressId, paymentMethod, promotion } = req.body;
        const client = req.user;
        const stockDeductions = [];

        const selectedAddress = addressId
            ? client.addresses.id(addressId)
            : client.addresses.find(addr => addr.isDefault);

        if (!selectedAddress) {
            return res.status(400).json({
                success: false,
                message: "No se encontró una dirección válida en el perfil"
            });
        }

        let activePromo = null;
        if (promotion) {
            activePromo = await Promotion.findOne({
                _id: promotion,
                restaurant: restaurantId,
                isActive: true,
                status: 'APPROVED',
                scope: { $in: ['PEDIDOS', 'GENERAL'] },
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            if (!activePromo) throw new Error("La promoción no es válida o ha expirado");
        }

        let totalOrder = 0;

        const hydratedItems = await Promise.all(items.map(async (item) => {
            const dish = await Dish.findOne({
                _id: item.dishId,
                restaurant: restaurantId,
                isActive: true
            }).populate('ingredients.inventoryItem');

            if (!dish) {
                throw new Error(`El plato ${item.dishId} no está disponible o no pertenece a este restaurante`);
            }
            let subtotal = dish.price * item.quantity;

            // Validación de inventario
            for (const ingredient of dish.ingredients) {
                const totalNeeded = ingredient.quantityUsed * item.quantity;
                const currentStock = ingredient.inventoryItem.quantity;

                if (currentStock < totalNeeded) {
                    throw new Error(`No hay suficiente stock de ${ingredient.inventoryItem.name} para preparar ${item.quantity} unidades de ${dish.name}`);
                }

                // Guardar en memoria lo que se va a descontar
                stockDeductions.push({
                    inventoryItemId: ingredient.inventoryItem._id,
                    amountToDeduct: totalNeeded
                });
            }

            if (activePromo && activePromo.dishesApplicables.includes(dish._id)) {
                const discount = subtotal * (activePromo.discountPercentage / 100);
                subtotal -= discount;
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

        // Descontar del inventario
        if (stockDeductions.length > 0) {
            const bulkOps = stockDeductions.map(deduction => ({
                updateOne: {
                    filter: { _id: deduction.inventoryItemId },
                    update: { $inc: { quantity: -deduction.amountToDeduct } }
                }
            }));

            await InventoryItem.bulkWrite(bulkOps);
        }

        const newOrder = new Order({
            client: client.uid || client._id,
            restaurant: restaurantId,
            items: hydratedItems,
            total: totalOrder,
            deliveryAddress: {
                alias: selectedAddress.alias,
                addressLine: selectedAddress.addressLine,
                houseNumber: selectedAddress.houseNumber,
                securityInfo: selectedAddress.securityInfo,
                reference: selectedAddress.reference
            },
            paymentMethod
        });

        const savedOrder = await newOrder.save();
        const invoiceCount = await Invoice.countDocuments();
        const invoiceNumber = `INV-${Date.now()}-${(invoiceCount + 1).toString().padStart(4, '0')}`;

        const newInvoice = new Invoice({
            invoiceNumber,
            order: savedOrder._id,
            client: client.uid || client._id,
            clientName: client.name,
            restaurant: restaurantId,
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

        await notificationService.createAndEmit(
            String(savedOrder.client),
            'PEDIDO_RECIBIDO',
            'Pedido recibido',
            'Tu pedido ha sido recibido y está pendiente de confirmación.',
            savedOrder._id,
            'Order'
        );

        res.status(201).json({
            success: true,
            message: "Pedido y Factura creados correctamente",
            order: savedOrder,
            invoice: savedInvoice
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al procesar el pedido",
            error: error.message
        });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        const client = req.user;
        const clienteId = client.uid || client._id;

        const orders = await Order.find({ client: clienteId })
            .populate('restaurant', 'name photo address')
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
        const authClientId = authenticatedClient.uid?.toString() || authenticatedClient._id?.toString();

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
            return res.status(404).json({
                success: false,
                message: "Pedido no encontrado"
            });
        }

        const normalizedStatus = status.toUpperCase();

        if (normalizedStatus === 'CANCELADO') {
            if (order.client.toString() !== (user.uid || user._id).toString()) {
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