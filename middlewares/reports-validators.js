import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';
import { param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import Employee from '../src/employees/employee.model.js';

export const validateRestaurantAdmin = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!req.user) {
            return res.status(500).json({
                success: false,
                message: "Error interno: El usuario no fue autenticado correctamente antes de validar el restaurante."
            });
        }
        const userIdentifier = req.user.uid || req.user._id || req.user.id
        const employee = await Employee.findOne({
            userId: userIdentifier,
            restaurant: id,
            isActive: true
        });
        if (!employee) {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado: No tienes una relación laboral con este restaurante."
            });
        }

        if (employee.specialty !== 'ADMINISTRATIVO') {
            return res.status(403).json({
                success: false,
                message: "Acceso denegado: Solo el personal ADMINISTRATIVO puede acceder a los reportes."
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al verificar permisos del establecimiento.",
            error: error.message
        });
    }
};

export const validateGetGeneralReport = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    checkValidators,
];

export const getRestaurantActivityReport = [
    validateJWT,
    requireRole('MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    validateRestaurantAdmin,
    checkValidators,
];

export const getRestaurantClientsReport = [
    validateJWT,
    requireRole('MANAGER_ROLE'),
    param('id')
        .isMongoId()
        .withMessage('ID de restaurante no válido'),
    validateRestaurantAdmin,
    checkValidators,
];

export const validateGetRestaurantReport = [
    validateJWT,
    requireRole('MANAGER_ROLE'),
    param('id').isMongoId().withMessage('ID de restaurante no válido'),
    validateRestaurantAdmin,
    checkValidators,
];