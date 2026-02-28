import { Router } from 'express';
import { createEvent, changeEventStatus, getEventById, getEvents, updateEvent } from './event.controller.js';
import { validateCreateEvent, validateUpdateEventRequest, validateRestaurantStatusChange, validateGetRestaurantdById} from '../../middlewares/event-validators.js'

const router = Router();

router.get(
    '/', 
    getEvents
);

router.get(
    '/:id', 
    validateGetRestaurantdById,
    getEventById
);

router.post(
    '/', 
    validateCreateEvent,
    createEvent
);

router.put(
    '/:id', 
    validateUpdateEventRequest,
    updateEvent
);

router.patch(
    '/:id', 
    validateRestaurantStatusChange,
    changeEventStatus
);

export default router;