import Invoice from './invoice.model.js';
import Order from '../orders/order.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

export const getMyInvoices = async (req, res) => {
    try {
        const client = req.user;
        const clientId = client.uid || client._id;

        const invoices = await Invoice.find({ client: clientId })
            .populate('restaurant', 'name photo address')
            .sort({ issuedAt: -1 });

        res.status(200).json({
            success: true,
            total: invoices.length,
            invoices
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener historial",
            error: error.message
        });
    }
};

export const getInvoiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const client = req.user;
        const clientId = client.uid || client._id;

        const invoice = await Invoice.findById(id)
            .populate('restaurant', 'name photo address phone')
            .populate('order', 'status');

        if (!invoice) {
            return res.status(404).json({
                success: false,
                message: "Factura no encontrada"
            });
        }

        if (invoice.client.toString() !== clientId.toString()) {
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para ver esta factura"
            });
        }

        res.status(200).json({
            success: true,
            invoice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener la factura",
            error: error.message
        });
    }
};