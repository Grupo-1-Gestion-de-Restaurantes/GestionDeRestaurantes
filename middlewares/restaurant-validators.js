import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateRestaurant = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del restaurnate es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('La direccion es obligatoria')
        .isLength({min: 5, max: 100 })
        .withMessage('La direccion debe tener entre 5 y 100 caracteres'),
    body('categories')
        .trim()
        .notEmpty()
        .withMessage('La categoria es requerida')
        .isIn(['Gourmet', 'Casual'])
        .withMessage('Categoria no es valida'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La descripcion no puede exceder 200 caracteres'),
    body('openingTime')
        .trim()
        .notEmpty()
        .withMessage('La hora de apertura es obligatoria'),
    body('closingTime')
        .trim()
        .notEmpty()
        .withMessage('La hora de cierre es obligatoria'),
    body('averagePrice')
        .optional()
        .isLength({ min: 0})
        .withMessage('El precio promedio no puede ser negativo'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('El numero de telefono es obligatorio'),
    body('photo')
        .optional(),
    body('status')
        .optional()
        .isIn(['Gourmet', 'Casual'])
        .withMessage('El estado no es valido'),
    body('rating')
        .optional()
        .isLength({ min: 1, max: 5 })
        .withMessage('La calificacion no puede ser menor que 1, ni mayor que 5'),
    checkValidators,
];

export const validateUpdateRetaurantRequest = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre del restaurnate es requerido')
        .isLength({ min: 2, max: 100 })
        .withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('La direccion es obligatoria')
        .isLength({min: 5, max: 100 })
        .withMessage('La direccion debe tener entre 5 y 100 caracteres'),
    body('categories')
        .trim()
        .notEmpty()
        .withMessage('La categoria es requerida')
        .isIn(['Gourmet', 'Casual'])
        .withMessage('Categoria no es valida'),
    body('description')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('La descripcion no puede exceder 200 caracteres'),
    body('openingTime')
        .trim()
        .notEmpty()
        .withMessage('La hora de apertura es obligatoria'),
    body('closingTime')
        .trim()
        .notEmpty()
        .withMessage('La hora de cierre es obligatoria'),
    body('averagePrice')
        .optional()
        .isLength({ min: 0})
        .withMessage('El precio promedio no puede ser negativo'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('El numero de telefono es obligatorio'),
    body('status')
        .optional()
        .isIn(['Gourmet', 'Casual'])
        .withMessage('El estado no es valido'),
    body('rating')
        .optional()
        .isLength({ min: 1, max: 5 })
        .withMessage('La calificacion no puede ser menor que 1, ni mayor que 5'),
    checkValidators,
];

// Validaciones para activar/desactivar restaurantes
export const validateRestaurantStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

// Validación para obtener restaurante por ID
export const validateGetRestaurantdById = [
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];
