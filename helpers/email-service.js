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

export const sendPartnerStatusEmail = async (clientEmail, contactName, status) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, 
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD 
        }
    });

    let subject, text;
    if (status === 'APPROVED') {
        subject = '¡Tu solicitud de restaurante ha sido aprobada!';
        text = `Hola ${contactName},\n\nNos complace informarte que tu solicitud para registrar tu restaurante ha sido APROBADA.\n\nYa puedes acceder al Dashboard de Administración con tu cuenta existente para gestionar tu restaurante.\n\n¡Bienvenido a nuestra red!`;
    } else {
        subject = 'Actualización sobre tu solicitud de restaurante';
        text = `Hola ${contactName},\n\nGracias por tu interés en unirte a nuestra red. Lamentamos informarte que por el momento no podemos aprobar tu solicitud de registro.\n\nSi tienes alguna duda, puedes contactarnos respondiendo a este correo.`;
    }

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: clientEmail,
        subject: subject,
        text: text
    };

    return transporter.sendMail(mailOptions);
};

export const sendAdminAlertEmail = async (subject, htmlContent) => {
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
        to: process.env.EMAIL_FROM, // Notificar al admin (usando el remitente como destino por defecto)
        subject: subject,
        html: htmlContent
    };

    return transporter.sendMail(mailOptions);
};

export const sendEventSubscriptionEmail = async (clientEmail, clientName, eventName, eventDateTime, restaurantName, finalPrice) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, 
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD 
        }
    });

    const eventDate = new Date(eventDateTime).toLocaleDateString('es-GT', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const subject = `¡Te has inscrito al evento: ${eventName}!`;
    const text = `Hola ${clientName},\n\n¡Te has inscrito exitosamente al evento "${eventName}"!\n\n📅 Fecha y hora: ${eventDate}\n🏪 Restaurante: ${restaurantName}\n💰 Precio pagado: Q${finalPrice.toFixed(2)}\n\n¡Te esperamos!`;

    const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
        to: clientEmail,
        subject: subject,
        text: text
    };

    return transporter.sendMail(mailOptions);
};