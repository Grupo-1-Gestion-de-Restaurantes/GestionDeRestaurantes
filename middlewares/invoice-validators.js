import { query, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { syncClient } from './syncClient.js'
import { requireRole } from './validate-role.js';
import { validateJWT } from './validate-JWT.js';

export const validateGetMyInvoices = [
    validateJWT,
    syncClient,
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número mayor a 0'),
    query('limit')
        .optional()
        .isInt({ min: 1 })
        .withMessage('El límite debe ser un número mayor a 0'),
    query('startDate')
        .optional()
        .isDate()
        .withMessage('La fecha de inicio debe tener un formato válido (YYYY-MM-DD)'),
    query('endDate')
        .optional()
        .isDate()
        .withMessage('La fecha de fin debe tener un formato válido (YYYY-MM-DD)'),
    checkValidators
];