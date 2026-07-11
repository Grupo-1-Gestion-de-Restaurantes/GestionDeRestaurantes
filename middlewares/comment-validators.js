import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { syncClient } from './syncClient.js';

export const validateCreateComment = [
    validateJWT,
    body('review')
        .notEmpty()
        .withMessage('La reseña es obligatoria')
        .isInt({ min: 1, max: 5 })
        .withMessage('La reseña debe estar entre 1 y 5'),
    body('comment')
        .trim()
        .notEmpty()
        .withMessage('El comentario es obligatorio')
        .isLength({ max: 500 })
        .withMessage('El comentario no puede tener más de 500 caracteres'),
    body('restaurantId')
        .optional()
        .trim()
        .isMongoId()
        .withMessage('restaurantId debe ser un ObjectId válido'),
    body('dishId')
        .optional()
        .trim()
        .isMongoId()
        .withMessage('dishId debe ser un ObjectId válido'),
    body()
        .custom((value, { req }) => {
            const { restaurantId, dishId } = req.body;

            if (!restaurantId && !dishId) {
                throw new Error("Debe enviar un restaurantId o un dishId");
            }

            if (restaurantId && dishId) {
                throw new Error("Solo puede enviar restaurantId o dishId, no ambos");
            }

            return true;
        }),
    checkValidators
];

export const validateUpdateCommentRequest = [
    validateJWT,
    body('review')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('La reseña debe estar entre 1 y 5'),
    body('comment')
        .trim()
        .notEmpty()
        .withMessage('El comentario no puede quedar vacío')
        .isLength({ max: 500 })
        .withMessage('El comentario no puede tener más de 500 caracteres'),
    body('restaurantId')
        .optional()
        .trim(),
    body('dishId')
        .optional()
        .trim(),
    body()
        .custom((value, { req }) => {
            const { restaurantId, dishId } = req.body;

            if (!restaurantId && !dishId) {
                throw new Error("Debe enviar un restaurantId o un dishId");
            }

            if (restaurantId && dishId) {
                throw new Error("Solo puede enviar restaurantId o dishId, no ambos");
            }

            return true;
        }),
    checkValidators 
];

export const validateCommentStatusChange = [
    validateJWT,
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetCommentById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetCommentsDish = [
    param('dishId')
        .isMongoId()
        .withMessage('dishId debe ser un ObjectId válido'),
    checkValidators,
];

export const validateGetCommentsRestaurant = [
    param('restaurantId')
        .isMongoId()
        .withMessage('restaurantId debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetMyComments = [
    validateJWT,
    syncClient,
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser mayor a 0'),
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser mayor a 0'),
    checkValidators,
];

export const validateGetComments = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'EMPLOYEE_ROLE'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser mayor a 0'),
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser mayor a 0'),
    query('search')
        .optional()
        .isString()
        .withMessage('La búsqueda debe ser texto'),
    query('restaurantId')
        .optional({ checkFalsy: true })
        .isMongoId()
        .withMessage('restaurantId debe ser un ObjectId válido'),
    query('isActive')
        .optional()
        .isIn(['true', 'false', 'all'])
        .withMessage('isActive debe ser true o false o all'),
    checkValidators,
];