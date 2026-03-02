import { Router } from 'express';
import { uploadDishImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { createDish, changeDishStatus, getDishById, getDishes, updateDish } from './dish.controller.js';
import {
    validateCreateDish,
    validateUpdateDish,
    validateGetDishById,
    validateChangeDishStatus
} from '../../middlewares/dishes-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.get('/', validateJWT, getDishes);

router.get('/:id', validateGetDishById, getDishById);

router.post('/',
    uploadDishImage.single('photo'),
    cleanUploaderFileOnFinish,
    validateCreateDish,
    createDish);

router.put('/:id',
    uploadDishImage.single('photo'),
    cleanUploaderFileOnFinish,
    validateUpdateDish,
    updateDish);

router.patch('/:id',
    validateChangeDishStatus,
    changeDishStatus);

export default router;