import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { syncClient } from './syncClient.js';
import { requireRole } from './validate-role.js';

// Validaciones para crear campos (field)
export const validateCreateClient = [
    validateJWT,
    syncClient,
    body('name')
        .trim()
        .optional()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío'),
    body('email')
        .trim()
        .optional()
        .isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('phone')
        .trim()
        .matches(/^[0-9]{8,15}$/).withMessage('Ingrese un número de teléfono válido (8 a 15 dígitos)'),
    body('birthdate')
        .notEmpty().withMessage('La fecha de nacimiento es obligatoria')
        .isISO8601().withMessage('Formato de fecha inválido (AAAA-MM-DD)'),
    body('gender')
        .isIn(['Masculino', 'Femenino', 'Otro']).withMessage('Género debe ser Masculino, Femenino u Otro'),

    // Validación de la primera dirección
    body('address').isObject().withMessage('La información de la dirección es requerida'),
    body('address.addressLine').notEmpty().withMessage('La dirección es obligatoria'),
    body('address.houseNumber').notEmpty().withMessage('El número de casa es obligatorio'),
    body('address.alias')
        .optional()
        .isIn(['Casa', 'Trabajo', 'Otro']).withMessage('El alias debe ser Casa, Trabajo u Otro'),

    checkValidators,
];

export const validateUpdateClientRequest = [
    validateJWT,
    syncClient,
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('El nombre no puede estar vacío'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[0-9]{0,8}$/)
        .withMessage('Teléfono inválido'),
    body('birthdate')
        .optional()
        .isISO8601()
        .withMessage('Fecha inválida'),
    body('gender')
        .optional()
        .isIn(['Masculino', 'Femenino', 'Otro']),
    body('address')
        .optional()
        .isObject()
        .withMessage('La dirección debe ser un objeto'),
    body('address._id')
        .optional()
        .isMongoId()
        .withMessage('El ID de la dirección debe ser un ObjectId válido de MongoDB'),
    checkValidators
];

export const validateAddAddressToClient = [
    validateJWT,
    syncClient,
    body('address')
        .notEmpty()
        .withMessage('La dirección es obligatoria'),
    body('address.addressLine')
        .notEmpty()
        .withMessage('La línea de dirección es obligatoria'),
    body('address.houseNumber')
        .notEmpty()
        .withMessage('El número de casa es obligatorio'),
    checkValidators
];


// Validaciones para activar/desactivar 
export const validateClientStatusChange = [
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isString().withMessage('El ID debe ser una cadena de texto'),
    checkValidators,
];

export const validateGetClients = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    checkValidators,
]

// Validación para obtener cliente por ID
export const validateClientById = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .notEmpty().withMessage('El ID es obligatorio')
        .isString().withMessage('El ID debe ser una cadena de texto'),
    checkValidators,
];

export const validateGetMyInfo = [
    validateJWT,
    syncClient,
    checkValidators,
]