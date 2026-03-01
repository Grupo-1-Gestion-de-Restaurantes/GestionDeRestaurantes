import nodemailer from 'nodemailer';

export const sendInvoiceEmail = async (clientEmail, invoiceBuffer, invoiceNumber) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, 
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD 
        }
    });

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: clientEmail,
        subject: `Factura No. ${invoiceNumber}`,
        text: 'Estimado cliente,\n\nAdjunto encontrará la factura correspondiente a su pedido. Gracias por elegirnos.',
        attachments: [{
            filename: `Factura-${invoiceNumber}.pdf`,
            content: invoiceBuffer
        }]
    };

    return transporter.sendMail(mailOptions);
};