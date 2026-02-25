import { Router } from 'express';
import { uploadDishImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { createDish, changeDishStatus, getDishById, getDishes, updateDish } from './dish.controller.js';

const router = Router();

router.get('/', getDishes);

router.get('/:id', getDishById);

router.post('/',
    uploadDishImage.single('photo'),
    cleanUploaderFileOnFinish,
    createDish);

router.put('/:id', 
    uploadDishImage.single('photo'),
    cleanUploaderFileOnFinish,
    updateDish);

router.patch('/:id', changeDishStatus);

export default router;