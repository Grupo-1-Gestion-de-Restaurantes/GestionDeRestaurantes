import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
    getMyNotifications,
    getUnreadCount,
    markAllAsRead,
    markAsRead,
    deleteNotification,
} from './notification.controller.js';

const router = Router();

router.get('/', validateJWT, getMyNotifications);
router.get('/unread-count', validateJWT, getUnreadCount);
router.put('/read-all', validateJWT, markAllAsRead);
router.put('/:id/read', validateJWT, markAsRead);
router.delete('/:id', validateJWT, deleteNotification);

export default router;
