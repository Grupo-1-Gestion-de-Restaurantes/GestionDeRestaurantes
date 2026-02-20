import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateTable = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    body('restaurant')
        .trim()
        .notEmpty()
        .withMessage('El id del restaurante es requerido'),
    body('tableNumber')
        .notEmpty()
        .withMessage('El número de mesa es requerido')
        .isLength({ min: 1, max: 50 })
        .withMessage('El número de mesa debe tener entre 1 y 50 caracteres'),
    body('capacity')
        .notEmpty()
        .withMessage('La capacidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser un número entero mayor o igual a 1'),
];

export const validateUpdateTableRequest = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    body('tableNumber')
        .notEmpty()
        .withMessage('El número de mesa es requerido')
        .isLength({ min: 1, max: 50 })
        .withMessage('El número de mesa debe tener entre 1 y 50 caracteres'),
    body('capacity')
        .notEmpty()
        .withMessage('La capacidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser un número entero mayor o igual a 1'),
];


export const validateTableStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];


export const validateGetTableById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateTableAvailabilityChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),  
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'), 
    body('isAvailable')
        .isBoolean()
        .withMessage('isAvailable debe ser un valor booleano'),
    checkValidators,
];