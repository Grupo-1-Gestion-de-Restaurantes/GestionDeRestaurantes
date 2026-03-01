import { Router } from 'express';
import { createEvent, changeEventStatus, getEventById, getEvents, updateEvent, subscribeToEvent } from './event.controller.js';
import { validateCreateEvent, validateUpdateEventRequest, validateRestaurantStatusChange, validateSuscribeToEvent,validateGetEvents,validateGetEventById} from '../../middlewares/event-validators.js'

const router = Router();

router.get(
    '/', 
    validateGetEvents,
    getEvents
);

router.get(
    '/:id', 
    validateGetEventById,
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

router.patch(
    '/:id/subscribe', 
    validateSuscribeToEvent,
    subscribeToEvent
);

export default router;