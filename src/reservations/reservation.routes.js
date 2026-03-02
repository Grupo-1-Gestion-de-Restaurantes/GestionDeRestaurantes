import { Router } from 'express';
import { validateJWT } from "../../middlewares/validate-JWT.js"
import { changeReservationStatus, createReservation, getReservationById, getReservations, updateReservation, getMyReservations } from './reservation.controller.js';
import { 
    validateCreateReservation, 
    validateGetReservations, 
    validateUpdateReservation, 
    validateChangeReservationStatus,
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

router.get(
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
    '/status/:id',
    validateChangeReservationStatus,
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