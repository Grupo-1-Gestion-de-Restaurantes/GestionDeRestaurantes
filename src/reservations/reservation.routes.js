import { Router } from 'express';
import { changeReservationStatus, createReservation, getReservationById, getReservations, updateReservation } from './reservation.controller.js';
const router = Router();

router.post(
    '/create',
    createReservation
)

router.get(
    '/get',
    getReservations
)

router.get('/:id', getReservationById);

// Rutas PUT - Requieren autenticación
router.put(
    '/:id',
    updateReservation
);
router.put('/:id/activate', changeReservationStatus);
router.put('/:id/desactivate', changeReservationStatus);
export default router;