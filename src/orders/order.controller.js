import Order from "./order.model.js";
import Dish from "../dishes/dish.model.js";
import Restaurante from "../restaurants/restaurant.model.js";

export const createOrder = async (req, res) => {
    try {
        const { restaurantId, items, addressId, paymentMethod } = req.body;
        const client = req.user;

        const selectedAddress = addressId
            ? client.addresses.id(addressId)
            : client.addresses.find(addr => addr.isDefault);

        if (!selectedAddress) {
            return res.status(400).json({
                success: false,
                message: "No se encontró una dirección válida en el perfil"
            });
        }

        let totalOrder = 0;
        const hydratedItems = await Promise.all(items.map(async (item) => {
            // Validamos que el plato exista, esté activo y sea del restaurante
            const dish = await Dish.findOne({
                _id: item.dishId,
                restaurant: restaurantId,
                isActive: true
            });

            if (!dish) {
                throw new Error(`El plato ${item.dishId} no está disponible o no pertenece a este restaurante`);
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
            client: client._id || client.uid,
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

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Pedido creado correctamente",
            order: newOrder
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

        if (status === 'CANCELADA') {
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
            { status: status.toUpperCase() },
            { returnDocument: 'after', runValidators: true }
        ).populate('restaurant', 'name');

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