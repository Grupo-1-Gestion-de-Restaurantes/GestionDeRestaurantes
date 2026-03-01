import { Router } from "express";
import { validateJWT } from "../../middlewares/validate-JWT.js"
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreateRestaurant, validateRestaurantStatusChange, validateGetRestaurantdById, validateUpdateRetaurantRequest, } from '../../middlewares/restaurant-validators.js';
import { getRestaurantActivityReport, getRestaurantClientsReport } from '../../middlewares/reports-validators.js';
import {
  createRestaurante,
  getRestaurantes,
  getRestauranteById,
  updateRestaurante,
  changeRestauranteStatus,
  getActivity,
  getRestaurantClientsData
} from "./restaurant.controller.js";

const router = Router();

router.post("/create",
  uploadFieldImage.single('image'),
  cleanUploaderFileOnFinish,
  validateCreateRestaurant,
  createRestaurante);

router.get("/get", getRestaurantes);

router.get("/:id", validateGetRestaurantdById, getRestauranteById);

router.put("/:id",
  uploadFieldImage.single('image'),
  cleanUploaderFileOnFinish,
  validateUpdateRetaurantRequest,
  updateRestaurante);

router.delete("/:id", validateRestaurantStatusChange, changeRestauranteStatus);


router.get(
  '/:id',
  getRestaurantActivityReport,
  getActivity
);

router.get(
  '/:id/clients',
  getRestaurantClientsReport,
  getRestaurantClientsData
);

export default router;
