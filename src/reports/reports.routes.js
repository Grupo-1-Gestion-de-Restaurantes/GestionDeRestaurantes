import { Router } from 'express';
import { getGeneralReport, getRestaurantReportById } from './reports.controller.js';
import { validateGetGeneralReport, validateGetRestaurantReport } from '../../middlewares/reports-validators.js';
const router = Router();



router.get('/generalReport', validateGetGeneralReport, getGeneralReport);
router.get('/restaurantReport/:id', validateGetRestaurantReport, getRestaurantReportById);

export default router;