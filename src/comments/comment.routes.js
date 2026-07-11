import { Router } from 'express';
import {
    createComment,
    getComments,
    getCommentById,
    updateComment,
    changeCommentStatus,
    getCommentsDish,
    getCommentsRestaurants,
    getMyComments
} from './comment.controller.js';

import {
    validateCreateComment,
    validateUpdateCommentRequest,
    validateCommentStatusChange,
    validateGetCommentById,
    validateGetComments,
    validateGetCommentsDish,
    validateGetCommentsRestaurant,
    validateGetMyComments
} from '../../middlewares/comment-validators.js';

const router = Router();

router.get(
    '/',
    validateGetComments,
    getComments
);

router.get(
    '/mine',
    validateGetMyComments,
    getMyComments
);

router.get(
    '/:id',
    validateGetCommentById,
    getCommentById
);

router.get(
    '/dish/:dishId',
    validateGetCommentsDish,
    getCommentsDish
);

router.get(
    '/restaurant/:restaurantId',
    validateGetCommentsRestaurant,
    getCommentsRestaurants
);

router.post(
    '/',
    validateCreateComment,
    createComment
);

router.put(
    '/:id',
    validateUpdateCommentRequest,
    updateComment
);

router.put(
    '/activate/:id',
    validateCommentStatusChange,
    changeCommentStatus
);

router.put(
    '/deactivate/:id',
    validateCommentStatusChange,
    changeCommentStatus
);
export default router;