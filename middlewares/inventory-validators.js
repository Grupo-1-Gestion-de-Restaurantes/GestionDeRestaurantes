import { query, param, body } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { requireRole } from './validate-role.js';
import { validateJWT } from './validate-JWT.js';

export const validateCreateInventoryItem = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('name')
        .notEmpty()
        .withMessage('El nombre del item es obligatorio'),
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('La cantidad debe ser un número entero no negativo'),
    body('unit')
        .isIn(['KG', 'LITRO', 'UNIDAD', 'GRAMO', 'MILILITRO'])
        .withMessage('La unidad debe ser KG, LITRO, UNIDAD, GRAMO o MILILITRO'),
    body('minStock')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El stock mínimo debe ser un número entero mayor a 0'),
    body('restaurant')
        .notEmpty()
        .withMessage('El ID del restaurante es obligatorio'),
    checkValidators
];

export const validateGetInventory = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
];

export const validateGetInventoryById = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de inventario no válido'),
    checkValidators
];

export const validateChangeInventoryItemStatus = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de inventario no válido'),
    body('isActive')
        .isBoolean()
        .withMessage('El estado debe ser un valor booleano'),
    checkValidators
];

export const validateUpdateInventoryItem = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de inventario no válido'),
    body('name')
        .optional()
        .notEmpty()
        .withMessage('El nombre del item no puede estar vacío'),
    body('quantity')
        .optional()
        .isInt({ min: 0 })
        .withMessage('La cantidad debe ser un número entero no negativo'),
    body('unit')
        .optional()
        .isIn(['KG', 'LITRO', 'UNIDAD', 'GRAMO', 'MILILITRO'])
        .withMessage('La unidad debe ser KG, LITRO, UNIDAD, GRAMO o MILILITRO'),
    body('minStock')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El stock mínimo debe ser un número entero mayor a 0'),
    checkValidators
];

export const validateUpdateInventoryStock = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de inventario no válido'),
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('La cantidad debe ser un número entero no negativo'),
    checkValidators
];