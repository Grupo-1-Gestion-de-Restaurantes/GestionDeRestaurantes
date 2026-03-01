import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import Employee from '../src/employees/employee.model.js';
import Restaurant from '../src/restaurants/restaurant.model.js';

export const validateCreateEmployee = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('El nombre es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
    body('surname')
        .trim()
        .notEmpty()
        .withMessage('El apellido es requerido')
        .isLength({ min: 2, max: 50 })
        .withMessage('El apellido debe tener entre 2 y 50 caracteres'),
    body('username')
        .trim()
        .notEmpty()
        .withMessage('El username es requerido')
        .isLength({ min: 3, max: 30 })
        .withMessage('El username debe tener entre 3 y 30 caracteres'),
    body('email')
        .trim()
        .notEmpty()
        .withMessage('El email es requerido')
        .isEmail()
        .withMessage('El email debe tener un formato válido'),
    body('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    body('phone')
        .trim()
        .notEmpty()
        .withMessage('El teléfono es requerido')
        .matches(/^\d{8}$/)
        .withMessage('El teléfono debe tener exactamente 8 dígitos'),
    body('role')
        .notEmpty()
        .withMessage('el role es requerido')
        .isIn(['EMPLOYEE_ROLE', 'MANAGER_ROLE'])
        .withMessage('El role debe ser EMPLOYEE_ROLE o MANAGER_ROLE'),
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
        .withMessage('ID debe ser un ObjectId valido de MongoDB')
        .custom(async (id) => {
            const employee = await Employee.findById(id);
            if (!employee) throw new Error('El empleado no existe');
        }),
    body('userId')
        .not().exists()
        .withMessage('El userId no puede ser modificado'),
    body('restaurant')
        .optional()
        .trim()
        .isMongoId()
        .withMessage('El restaurant debe ser un ObjectId valido de MongoDB')
        .custom(async (restaurantId) => {
            const restaurant = await Restaurant.findById(restaurantId);
            if (!restaurant) throw new Error('El restaurante no existe');
        }),
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
