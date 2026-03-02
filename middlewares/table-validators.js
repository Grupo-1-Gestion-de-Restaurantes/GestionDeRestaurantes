import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import Table from '../src/table/table.model.js';
import Restaurant from '../src/restaurants/restaurant.model.js';

export const validateCreateTable = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('restaurant')
        .trim()
        .notEmpty()
        .withMessage('El id del restaurante es requerido'),
    body('tableNumber')
        .notEmpty()
        .withMessage('El número de mesa es requerido')
        .isLength({ min: 1, max: 50 })
        .withMessage('El número de mesa debe tener entre 1 y 50 caracteres')
        .custom(async (value, { req }) => {
            const existingTable = await Table.findOne({ 
                tableNumber: value, 
                restaurant: req.body.restaurant 
            });
            
            if (existingTable) {
                throw new Error(`La mesa número ${value} ya existe en este restaurante`);
            }
            return true;
        }),
    body('capacity')
        .notEmpty()
        .withMessage('La capacidad es requerida')
        .isInt({ min: 1 })
        .withMessage('La capacidad debe ser un número entero mayor o igual a 1'),
    checkValidators
];

export const validateUpdateTableRequest = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
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
    checkValidators
];


export const validateTableStatusChange = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];


export const validateGetTableById = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'EMPLOYEE_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'),
    checkValidators,
];

export const validateTableAvailabilityChange = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'EMPLOYEE_ROLE'),  
    param('id')
        .isMongoId()
        .withMessage('ID debe ser un ObjectId válido de MongoDB'), 
    body('isAvailable')
        .isBoolean()
        .withMessage('isAvailable debe ser un valor booleano'),
    checkValidators,
];

export const validateGetTablesByRestaurant = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'EMPLOYEE_ROLE'),
    param('restaurantId')
        .isMongoId()
        .withMessage('El ID del restaurante no es válido')
        .custom(async (id) => {
            const restaurantExists = await Restaurant.findById(id);
            if (!restaurantExists) {
                throw new Error('El restaurante no existe en la base de datos');
            }
            return true;
        }),
    checkValidators 
];

export const validateGetTables = [
    validateJWT,
    requireRole('ADMIN_ROLE',),
    checkValidators 
];