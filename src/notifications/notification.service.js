import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Notification from './notification.model.js';

let io = null;

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || '*',
            methods: ['GET', 'POST'],
        },
    });

    io.use((socket, next) => {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
            return next(new Error('Token no proporcionado'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.sub;
            next();
        } catch {
            next(new Error('Token inválido'));
        }
    });

    io.on('connection', (socket) => {
        socket.join(socket.userId);
        socket.on('disconnect', () => {});
    });

    return io;
};

export const notificationService = {
    async createAndEmit(recipient, type, title, message, referenceId, referenceType) {
        const notification = new Notification({
            recipient,
            type,
            title,
            message,
            referenceId,
            referenceType,
        });

        await notification.save();

        if (io) {
            io.to(recipient).emit('new_notification', {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                referenceId: notification.referenceId,
                referenceType: notification.referenceType,
                isRead: notification.isRead,
                createdAt: notification.createdAt,
            });
        }

        return notification;
    },
};
