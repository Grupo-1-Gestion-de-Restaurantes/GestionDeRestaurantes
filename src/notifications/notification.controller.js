import Notification from './notification.model.js';
import Reservation from '../reservations/reservation.model.js';
import Order from '../orders/order.model.js';
import Client from '../client/client.model.js'; // Importar explícitamente el modelo Client

export const getMyNotifications = async (req, res) => {
    try {
        const user = req.user;
        const recipient = user.id || user._id;
        const { page = 1, limit = 10, isRead } = req.query;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const filter = (user.role === 'ADMIN_ROLE' || user.role === 'MANAGER_ROLE') 
            ? {} 
            : { recipient: recipient.toString() };

        if (isRead !== undefined && isRead !== "") {
            filter.isRead = isRead === "true";
        }

        const notifications = await Notification.find(filter)
            .populate({
                path: 'referenceId',
                select: 'client status total reservationDate', // Seleccionar campos clave
                populate: {
                    path: 'client',
                    model: 'Client', // Forzar el uso del modelo Client
                    select: 'name email phone'
                }
            })
            .sort({ createdAt: -1 })
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit);

        const total = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                totalRecords: total,
                limit: parsedLimit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las notificaciones',
            error: error.message,
        });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const user = req.user;
        const recipient = user.id || user._id;

        const filter = (user.role === 'ADMIN_ROLE' || user.role === 'MANAGER_ROLE')
            ? { isRead: false }
            : { recipient: recipient.toString(), isRead: false };

        const count = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            unreadCount: count,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el conteo de notificaciones no leídas',
            error: error.message,
        });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const recipient = user.id || user._id;

        const filter = (user.role === 'ADMIN_ROLE' || user.role === 'MANAGER_ROLE')
            ? { _id: id }
            : { _id: id, recipient: recipient.toString() };

        const notification = await Notification.findOneAndUpdate(
            filter,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada o sin permiso',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notificación marcada como leída',
            data: notification,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al marcar la notificación como leída',
            error: error.message,
        });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const user = req.user;
        const recipient = user.id || user._id;

        const filter = (user.role === 'ADMIN_ROLE' || user.role === 'MANAGER_ROLE')
            ? { isRead: false }
            : { recipient: recipient.toString(), isRead: false };

        const result = await Notification.updateMany(
            filter,
            { isRead: true }
        );

        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} notificaciones marcadas como leídas`,
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al marcar todas las notificaciones como leídas',
            error: error.message,
        });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const recipient = user.id || user._id;

        const filter = (user.role === 'ADMIN_ROLE' || user.role === 'MANAGER_ROLE')
            ? { _id: id }
            : { _id: id, recipient: recipient.toString() };

        const notification = await Notification.findOneAndDelete(filter);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada o sin permiso',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notificación eliminada exitosamente',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la notificación',
            error: error.message,
        });
    }
};
