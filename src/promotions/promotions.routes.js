import { Router } from 'express';
import { validateCreatePromotion, validateGetPromotionById, validateUpdatePromotion, validateUpdatePromotionStatus, validateChangePromotionStatus, validateGetPromotion } from '../../middlewares/promotions-validators.js';
import { getPromotion, getPromotionById, createPromotion, updatePromotion, changePromotionStatus, updatePromotionStatus } from './promotions.controller.js';


const router = Router();

router.post(
    '/create',
    validateCreatePromotion,
    createPromotion
);

router.get(
    '/get',
    validateGetPromotion,
    getPromotion
);

router.get(
    '/:id',
    validateGetPromotionById,
    getPromotionById
);


router.put(
    '/:id',
    validateUpdatePromotion,
    updatePromotion
);

router.patch('/status/:id', 
    validateUpdatePromotionStatus,
    updatePromotionStatus);


router.put('/:id/activate', 
    validateChangePromotionStatus,
    changePromotionStatus);
router.put('/:id/desactivate', validateChangePromotionStatus, changePromotionStatus);


export default router;