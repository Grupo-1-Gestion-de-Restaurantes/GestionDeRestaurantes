import { body } from 'express-validator';
import { checkValidators } from './checkValidators.js';

export const validatePartnerLead = [
    body('restaurantName')
        .trim()
        .notEmpty().withMessage('El nombre del restaurante es obligatorio'),
    body('contactName')
        .trim()
        .notEmpty().withMessage('El nombre de contacto es obligatorio'),
    body('email')
        .trim()
        .isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('phone')
        .trim()
        .notEmpty().withMessage('El teléfono es obligatorio'),
    body('cityAddress')
        .trim()
        .notEmpty().withMessage('La ciudad/dirección es obligatoria'),
    body('branches')
        .isInt({ min: 1 }).withMessage('El número de sucursales debe ser al menos 1'),
    body('cuisine')
        .trim()
        .notEmpty().withMessage('El tipo de cocina es obligatorio'),
    checkValidators
];
