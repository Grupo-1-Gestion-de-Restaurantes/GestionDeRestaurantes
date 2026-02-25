import {Router} from 'express';
import {getPromotion,getPromotionById, createPromotion, updatePromotion, changePromotionStatus} from './promotions.controller.js';


const router = Router();

router.post(
'/create',
createPromotion
);

router.get(
'/get',
getPromotion
);

router.get(
'/:id',
getPromotionById
);


router.put(
'/:id',
updatePromotion
);



router.put('/:id/activate', changePromotionStatus);
router.put('/:id/deactivate', changePromotionStatus);


export default router;