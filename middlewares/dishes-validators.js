import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validateCreateDish = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del platillo es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('La descripcion del platillo es obligatoria')
        .isLength({ min: 5, max: 500 })
        .withMessage('La descripcion debe tener entre 5 y 500 caracteres'),
    body('price')
        .notEmpty()
        .withMessage('El precio es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un numero positivo'),
    body('dishType')
        .trim()
        .notEmpty()
        .withMessage('El tipo de platillo es obligatorio')
        .isIn(['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('El tipo de platillo debe ser: ENTRADA, PLATO_FUERTE, POSTRE o BEBIDA'),
    body('restaurant')
        .trim()
        .notEmpty()
        .withMessage('El restaurante es obligatorio')
        .isMongoId()
        .withMessage('El restaurant debe ser un ObjectId valido de MongoDB'),
    body('photo')
        .optional()
        .trim(),
    checkValidators,
];

export const validateUpdateDish = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId valido de MongoDB'),
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 5, max: 500 })
        .withMessage('La descripcion debe tener entre 5 y 500 caracteres'),
    body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio debe ser un numero positivo'),
    body('dishType')
        .optional()
        .trim()
        .isIn(['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'])
        .withMessage('El tipo de platillo debe ser: ENTRADA, PLATO_FUERTE, POSTRE o BEBIDA'),
    body('restaurant')
        .optional()
        .trim()
        .isMongoId()
        .withMessage('El restaurant debe ser un ObjectId valido de MongoDB'),
    body('photo')
        .optional()
        .trim(),
    checkValidators,
];

export const validateGetDishById = [
    validateJWT,
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId valido de MongoDB'),
    checkValidators,
];

export const validateChangeDishStatus = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId valido de MongoDB'),
    checkValidators,
];
