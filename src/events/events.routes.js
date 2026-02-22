import { Router } from 'express';
import { createEvent, changeEventStatus, getEventById, getEvents, updateEvent } from './event.controller.js';

const router = Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.patch('/:id', changeEventStatus);

export default router;