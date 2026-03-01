import { Router } from 'express';
import { validateJWT } from "../../middlewares/validate-JWT.js"
import { changeReservationStatus, createReservation, getReservationById, getReservations, updateReservation, getMyReservations } from './reservation.controller.js';
const router = Router();

router.post(
    '/create',
    createReservation
)

router.get(
    '/get',
    getReservations
)

router.get(
  '/my-reservations',
  validateJWT,
  getMyReservations
);

router.get('/:id', getReservationById);

// Rutas PUT - Requieren autenticación
router.put(
    '/:id',
    updateReservation
);
router.put('/:id/activate', changeReservationStatus);
router.put('/:id/desactivate', changeReservationStatus);
export default router;