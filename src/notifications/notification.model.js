import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: String,
            required: [true, 'El destinatario es requerido'],
            index: true,
        },
        type: {
            type: String,
            enum: [
                'RESERVACION_RECIBIDA',
                'RESERVACION_CONFIRMADA',
                'RESERVACION_CANCELADA',
                'RESERVACION_COMPLETADA',
                'RESERVACION_NO_ASISTIO',
                'PEDIDO_RECIBIDO',
                'PEDIDO_CONFIRMADO',
                'PEDIDO_EN_PREPARACION',
                'PEDIDO_LISTO',
                'PEDIDO_ENTREGADO',
                'PEDIDO_CANCELADO',
            ],
            required: [true, 'El tipo de notificación es requerido'],
        },
        title: {
            type: String,
            required: [true, 'El título es requerido'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'El mensaje es requerido'],
            trim: true,
        },
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'La referencia es requerida'],
        },
        referenceType: {
            type: String,
            enum: ['Reservation', 'Order'],
            required: [true, 'El tipo de referencia es requerido'],
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    { timestamps: true, versionKey: false }
);

export default mongoose.model('Notification', notificationSchema);
