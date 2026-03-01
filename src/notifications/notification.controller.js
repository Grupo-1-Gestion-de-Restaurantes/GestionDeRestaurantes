import Notification from './notification.model.js';

export const getMyNotifications = async (req, res) => {
    try {
        const recipient = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const notifications = await Notification.find({ recipient })
            .sort({ createdAt: -1 })
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit);

        const total = await Notification.countDocuments({ recipient });

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
        const recipient = req.user.id;

        const count = await Notification.countDocuments({ recipient, isRead: false });

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
        const recipient = req.user.id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, recipient },
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
        const recipient = req.user.id;

        const result = await Notification.updateMany(
            { recipient, isRead: false },
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
        const recipient = req.user.id;

        const notification = await Notification.findOneAndDelete({ _id: id, recipient });

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
