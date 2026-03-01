import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreatePromotion = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('title').notEmpty().withMessage('El título es obligatorio').isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
    body('description').notEmpty().withMessage('La descripción es obligatoria').isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
    body('discountPercentage').isNumeric().withMessage('Debe ser un número').isFloat({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0 y 100'),
    body('restaurant').isMongoId().withMessage('No es un ID válido de Mongo'),
    body('scope').isIn(['EVENTOS', 'PEDIDOS', 'GENERAL']).withMessage('El alcance debe ser EVENTOS, PEDIDOS o GENERAL'),
    body('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    body('endDate').isISO8601().withMessage('Fecha de fin inválida'),
    body('dishesApplicables').optional().isArray().withMessage('Debe ser un arreglo de IDs'),
    body('dishesApplicables.*').optional().isMongoId().withMessage('Cada platillo debe ser un ID válido de Mongo'),
    checkValidators
];

export const validateGetPromotionById = [
    validateJWT,
    param('id').isMongoId().withMessage('No es un ID válido de Mongo'),
    checkValidators
];

export const validateUpdatePromotion = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id').isMongoId().withMessage('No es un ID válido de Mongo'),
    body('title').optional().isLength({ max: 100 }).withMessage('Máximo 100 caracteres'),
    body('description').optional().isLength({ max: 500 }).withMessage('Máximo 500 caracteres'),
    body('discountPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('El descuento debe estar entre 0 y 100'),
    body('scope').optional().isIn(['EVENTOS', 'PEDIDOS', 'GENERAL']).withMessage('El alcance debe ser EVENTOS, PEDIDOS o GENERAL'),
    body('startDate').optional().isISO8601().withMessage('Fecha de inicio inválida'),
    body('endDate').optional().isISO8601().withMessage('Fecha de fin inválida'),
    checkValidators
];

export const validateUpdatePromotionStatus = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id').isMongoId().withMessage('No es un ID válido de Mongo'),
    body('status').isIn(['APPROVED', 'REJECTED']).withMessage('El estado solo puede ser APPROVED o REJECTED'),
    checkValidators
];

export const validateChangePromotionStatus = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id').isMongoId().withMessage('No es un ID válido de Mongo'),
    checkValidators
];

export const validateGetPromotion = [
    validateJWT,
];