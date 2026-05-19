import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { syncClient } from './syncClient.js'
import { requireRole } from './validate-role.js';

export const validateCreateOrder = [
    validateJWT,
    requireRole('CLIENT_ROLE'),
    syncClient,
    body('restaurantId')
        .notEmpty().withMessage('El ID del restaurante es obligatorio')
        .isMongoId().withMessage('ID de restaurante no válido'),
    
    body('paymentMethod')
        .notEmpty().withMessage('El método de pago es obligatorio')
        .isIn(['EFECTIVO', 'TARJETA']).withMessage('Método de pago debe ser EFECTIVO o TARJETA'),

    body('deliveryType')
        .optional()
        .isIn(['DOMICILIO', 'RECOGER']).withMessage('El tipo de entrega debe ser DOMICILIO o RECOGER'),

    body('items')
        .isArray({ min: 1 }).withMessage('El pedido debe contener al menos un plato'),

    body('items.*.dishId')
        .notEmpty().withMessage('El ID del plato es obligatorio')
        .isMongoId().withMessage('ID de plato no válido'),

    body('items.*.quantity')
        .notEmpty().withMessage('La cantidad es obligatoria')
        .isInt({ min: 1 }).withMessage('La cantidad mínima debe ser 1'),
        
    body('promotion')
        .optional()
        .isMongoId().withMessage('El ID de promoción debe ser un ID válido de MongoDB'),

    body('addressId')
        .optional()
        .isMongoId().withMessage('ID de dirección no válido'),

    body('deliveryAddress')
        .optional()
        .isObject().withMessage('La dirección de entrega debe ser un objeto'),

    checkValidators
];

export const validateCreateOrderAdmin = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('clientId')
        .notEmpty().withMessage('El ID del cliente es obligatorio'),
    body('restaurantId')
        .notEmpty().withMessage('El ID del restaurante es obligatorio')
        .isMongoId().withMessage('ID de restaurante no válido'),
    
    body('paymentMethod')
        .notEmpty().withMessage('El método de pago es obligatorio')
        .isIn(['EFECTIVO', 'TARJETA']).withMessage('Método de pago debe ser EFECTIVO o TARJETA'),

    body('items')
        .isArray({ min: 1 }).withMessage('El pedido debe contener al menos un plato'),

    body('items.*.dishId')
        .notEmpty().withMessage('El ID del plato es obligatorio')
        .isMongoId().withMessage('ID de plato no válido'),

    body('items.*.quantity')
        .notEmpty().withMessage('La cantidad es obligatoria')
        .isInt({ min: 1 }).withMessage('La cantidad mínima debe ser 1'),
    
    body('deliveryAddress.addressLine')
        .notEmpty().withMessage('La dirección de entrega es obligatoria'),
    
    checkValidators
];

export const validateGetOrders = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'EMPLOYEE_ROLE'),
    checkValidators
];

export const validateDeleteOrder = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id').isMongoId().withMessage('ID de pedido no válido'),
    checkValidators
];

export const validateGetMyOrders = [
    validateJWT,
    syncClient,
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser mayor a 0'),
    query('limit')
        .optional().isInt({ min: 1 })
        .withMessage('El límite debe ser mayor a 0'),
    query('status')
        .optional()
        .isIn(['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'LISTO', 'ENTREGADO', 'CANCELADO']),
    checkValidators
];

export const validateGetOrderById = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'EMPLOYEE_ROLE'),
    param('id').isMongoId().withMessage('ID de pedido no válido'),
    checkValidators
];

export const validateUpdateStatus = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'EMPLOYEE_ROLE'),
    param('id').isMongoId().withMessage('ID de pedido no válido'),
    body('status')
        .notEmpty().withMessage('El estado es obligatorio')
        .isIn(['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'LISTO_PARA_RECOGER', 'ENTREGADO', 'CANCELADO'])
        .withMessage('Estado no válido'),
    checkValidators
];

export const validateUpdateOrderAdmin = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id').isMongoId().withMessage('ID de pedido no válido'),
    body('clientId').optional(),
    body('restaurantId').optional().isMongoId().withMessage('ID de restaurante no válido'),
    body('paymentMethod').optional().isIn(['EFECTIVO', 'TARJETA']).withMessage('Método de pago debe ser EFECTIVO o TARJETA'),
    body('items').optional().isArray({ min: 1 }).withMessage('El pedido debe contener al menos un plato'),
    body('items.*.dishId').optional().isMongoId().withMessage('ID de plato no válido'),
    body('items.*.quantity').optional().isInt({ min: 1 }).withMessage('La cantidad mínima debe ser 1'),
    checkValidators
];