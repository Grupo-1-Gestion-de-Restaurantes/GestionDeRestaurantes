import { body, param, query } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { syncClient } from './syncClient.js';
import { requireRole } from './validate-role.js';
import Reservation from '../src/reservations/reservation.model.js';
import Restaurant from '../src/restaurants/restaurant.model.js';

export const validateCreateReservation = [
    validateJWT,
    syncClient, 
    body('restaurant')
        .notEmpty().withMessage('El ID del restaurante es obligatorio')
        .isMongoId().withMessage('ID de restaurante inválido')
        .custom(async (value) => {
            const restaurantExists = await Restaurant.findById(value);
            if (!restaurantExists) {
                throw new Error('El restaurante seleccionado no existe en nuestra base de datos');
            }
            return true;
        }),
    body('reservationDate')
        .notEmpty().withMessage('La fecha de reservación es obligatoria')
        .isISO8601().withMessage('Formato de fecha inválido')
        .custom((value) => {
            if (new Date(value) < new Date()) {
                throw new Error('La fecha de reservación no puede ser en el pasado');
            }
            return true;
        }),
    body('numberOfPeople')
        .notEmpty().withMessage('El número de personas es obligatorio')
        .isInt({ min: 1, max: 20 }).withMessage('El número de personas debe ser entre 1 y 20'),
    body('occasion')
        .optional()
        .trim()
        .isString(),
    checkValidators
];

// Validación para actualizar (solo el admin o el dueño de la reserva debería poder)
export const validateUpdateReservation = [
    validateJWT,
    param('id').isMongoId().withMessage('ID de reservación inválido'),
    body('reservationDate')
        .optional()
        .isISO8601().withMessage('Formato de fecha inválido'),
    body('numberOfPeople')
        .optional()
        .isInt({ min: 1 }).withMessage('Debe ser al menos 1 persona'),
    checkValidators
];

// Listar reservaciones (Generalmente solo para ADMIN)
export const validateGetReservations = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    checkValidators
];

// Obtener por ID o Cambiar estado
export const validateReservationId = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id').isMongoId().withMessage('ID de reservación inválido'),
    checkValidators
];

export const validateChangeReservationStatus = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id').isMongoId().withMessage('ID de reservación inválido'),
    body('status')
        .notEmpty().withMessage('El estado es obligatorio')
        .isIn(['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'])
        .withMessage('Estado inválido'),
    checkValidators
];