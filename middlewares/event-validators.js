import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import Restaurante from '../src/restaurants/restaurant.model.js'
import e from 'express';
import { validate } from 'uuid';

export const validateCreateEvent = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del evento es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede tener más 100 caracteres'),
    body('description')
        .notEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({ max: 500 })
        .withMessage('La descripción no puede tener más de 500 caracteres'),
    body('typeEvent')
        .notEmpty()
        .withMessage('El tipo del evento es obligatorio')
        .isIn(['CENA_TEMATICA', 'DEGUSTACION', 'FESTIVAL', 'OTRO'])
        .withMessage('El tipo del evento debe ser uno de los siguientes: CENA_TEMATICA, DEGUSTACION, FESTIVAL, OTRO'),
    body('capacity')
        .notEmpty()
        .withMessage('La capacidad del evento es requerida')
        .trim()
        .isLength({ min: 1 })
        .withMessage('La capacidad debe ser mayor a 1')
        .custom(async (value, { req }) => {
            const { restaurant } = req.body;

            const restaurantDB = await Restaurante.findById(restaurant);

            if (!restaurantDB) {
                throw new Error('El restaurante no existe');
            }

            if (value > restaurantDB.capacity) {
                throw new Error(
                    `La capacidad del evento no puede ser mayor a la capacidad del restaurante: (${restaurantDB.capacity})`
                );
            }
            return true;
        }),
    body('promotion')
        .optional()
        .isMongoId()
        .withMessage('El ID de la promoción debe ser un ObjectId válido de MongoDB')
        .custom(async (value) => {
            const promotionDB = await Promotion.findById(value);
            if (!promotionDB) {
                throw new Error('La promoción no existe');
            }
            return true;
        }),
    body('price')
        .notEmpty()
        .withMessage('El precio del evento es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    body('restaurant')
        .trim()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser un MongoID valido')
        .notEmpty()
        .withMessage('El ID del restaurante es obligatorio'),
    body('dateTime')
        .notEmpty()
        .withMessage('La fecha del evento es obligatoria'),
    checkValidators,
];

export const validateUpdateEventRequest = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del evento es obligatorio')
        .isLength({ max: 100 })
        .withMessage('El nombre no puede tener más 100 caracteres'),
    body('description')
        .notEmpty()
        .withMessage('La descripción es obligatoria')
        .isLength({ max: 500 })
        .withMessage('La descripción no puede tener más de 500 caracteres'),
    body('typeEvent')
        .notEmpty()
        .withMessage('El tipo del evento es obligatorio')
        .isIn(['CENA_TEMATICA', 'DEGUSTACION', 'FESTIVAL', 'OTRO'])
        .withMessage('El tipo del evento debe ser uno de los siguientes: CENA_TEMATICA, DEGUSTACION, FESTIVAL, OTRO'),
    body('capacity')
        .notEmpty()
        .withMessage('La capacidad del evento es requerida')
        .trim()
        .isLength({ min: 1 })
        .withMessage('La capacidad debe ser mayor a 1 y no puede exceder la capacidad del restaurante'),
    body('price')
        .notEmpty()
        .withMessage('El precio del evento es obligatorio')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un número positivo'),
    body('restaurant')
        .trim()
        .isMongoId()
        .withMessage('El ID del restaurante debe ser un MongoID valido')
        .notEmpty()
        .withMessage('El ID del restaurante es obligatorio'),
    body('dateTime')
        .notEmpty()
        .withMessage('La fecha del evento es obligatoria'),
    checkValidators,
];

// Validaciones para activar/desactivar eventos
export const validateRestaurantStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    requireRole('MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

// Validación para obtener eventos por ID
export const validateGetEventById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateSuscribeToEvent = [
    validateJWT,
    requireRole('CLIENT_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    body('promotionId')
        .optional()
        .isMongoId()
        .withMessage('El ID de la promoción debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateGetEvents = [
    validateJWT,
    body('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero mayor a 0'),
    body('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser un número entero mayor a 0'),
    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive debe ser un valor booleano'),
    checkValidators,
];