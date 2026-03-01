import { Router } from 'express';
import { validateJWT } from "../../middlewares/validate-JWT.js"
import { changeReservationStatus, createReservation, getReservationById, getReservations, updateReservation, getMyReservations } from './reservation.controller.js';
import { 
    validateCreateReservation, 
    validateGetReservations, 
    validateUpdateReservation, 
    validateReservationId 
} from '../../middlewares/reservations-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateReservation,
    createReservation
);

router.get(
    '/get',
    validateGetReservations,
    getReservations
);

router.get(
  '/my-reservations',
  validateJWT,
  getMyReservations
);

router.get('/:id', getReservationById);
    '/:id', 
    validateReservationId, 
    getReservationById
);

router.put(
    '/:id',
    validateUpdateReservation,
    updateReservation
);

router.put(
    '/:id/activate', 
    validateReservationId, 
    changeReservationStatus
);

router.put(
    '/:id/deactivate', 
    validateReservationId, 
    changeReservationStatus
);

export default router;