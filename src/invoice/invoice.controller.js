import Invoice from './invoice.model.js';
import Order from '../orders/order.model.js';
import Restaurante from '../restaurants/restaurant.model.js';
import PDFDocument from "pdfkit-table";

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


export const generatePDFBuffer = async (invoice) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'Letter' });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (err) => reject(err));

        const nombreRestaurante = (invoice.restaurantName);
        console.log(nombreRestaurante)
        doc.fontSize(20).text(nombreRestaurante, { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`Factura No: ${invoice.invoiceNumber}`, { align: 'right' });
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown();

        doc.fontSize(12).text("DATOS DEL CLIENTE:", { underline: true });
        doc.fontSize(10).text(`Nombre: ${invoice.clientName}`);
        doc.text(`Método de Pago: ${invoice.paymentMethod}`);
        doc.moveDown(2);

        const table = {
            title: "DETALLE DEL PEDIDO",
            headers: ["Producto", "Cantidad", "Precio Unit.", "Subtotal"],
            rows: invoice.items.map(item => [
                item.name,
                item.quantity.toString(),
                `Q${item.price.toFixed(2)}`,
                `Q${item.subtotal.toFixed(2)}`
            ]),
        };

        doc.table(table, {
            prepareHeader: () => doc.font("Helvetica-Bold").fontSize(10),
            prepareRow: () => doc.font("Helvetica").fontSize(10),
        });

        doc.moveDown(); // Espacio después de la tabla
        doc.font("Helvetica-Bold").fontSize(12);

        doc.text(`TOTAL A PAGAR: Q${invoice.total.toFixed(2)}`, {
            align: 'right'
        });

        doc.moveDown(2);
        doc.font("Helvetica-Oblique").fontSize(10)
            .text("¡Gracias por tu compra! Vuelve pronto.", { align: 'center' });

        doc.end();
    });
};