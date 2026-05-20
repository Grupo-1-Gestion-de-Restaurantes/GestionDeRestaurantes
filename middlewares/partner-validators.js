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
        .notEmpty().withMessage('La dirección es obligatoria'),
    body('city')
        .trim()
        .notEmpty().withMessage('La ciudad es obligatoria'),
    body('capacity')
        .isInt({ min: 1 }).withMessage('La capacidad debe ser al menos 1'),
    body('categories')
        .isIn(['Gourmet', 'Casual']).withMessage('Categoría inválida'),
    body('openingTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato de hora de apertura inválido (HH:mm)'),
    body('closingTime')
        .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Formato de hora de cierre inválido (HH:mm)'),
    checkValidators
];
