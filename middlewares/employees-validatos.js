import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateEmployee = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('userId')
        .trim()
        .notEmpty()
        .withMessage('El userId es requerido'),
    body('restaurant')
        .trim()
        .notEmpty()
        .withMessage('El restaurante es requerido')
        .isMongoId()
        .withMessage('El restaurant debe ser un ObjectId valido de MongoDB'),
    body('specialty')
        .trim()
        .notEmpty()
        .withMessage('La especialidad es obligatoria')
        .isIn(['COCINERO', 'BARTENDER', 'CAMARERO', 'ADMINISTRATIVO', 'OTRO'])
        .withMessage('La especialidad debe ser: COCINERO, BARTENDER, CAMARERO, ADMINISTRATIVO u OTRO'),
    checkValidators,
];

export const validateUpdateEmployee = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId valido de MongoDB'),
    body('restaurant')
        .optional()
        .trim()
        .isMongoId()
        .withMessage('El restaurant debe ser un ObjectId valido de MongoDB'),
    body('specialty')
        .optional()
        .trim()
        .isIn(['COCINERO', 'BARTENDER', 'CAMARERO', 'ADMINISTRATIVO', 'OTRO'])
        .withMessage('La especialidad debe ser: COCINERO, BARTENDER, CAMARERO, ADMINISTRATIVO u OTRO'),
    checkValidators,
];

export const validateGetEmployeeById = [
    validateJWT,
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId valido de MongoDB'),
    checkValidators,
];

export const validateChangeEmployeeStatus = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId valido de MongoDB'),
    checkValidators,
];
