import { Router } from "express";
import { validateJWT } from "../../middlewares/validate-JWT.js"
import { uploadFieldImage } from '../../middlewares/file-uploader.js';
import { cleanUploaderFileOnFinish } from '../../middlewares/delete-file-on-error.js';
import { validateCreateOrder, validateGetMyOrders, validateGetOrderById, validateUpdateStatus  } from '../../middlewares/order-validators.js';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus

} from "./order.controller.js";

const router = Router();

router.post("/create",
    validateCreateOrder,
    createOrder);


router.get("/getMyOrders", validateGetMyOrders, getMyOrders);

router.get("/:id", validateGetOrderById, getOrderById);

router.put("/:id/status",
    validateUpdateStatus,
    updateOrderStatus);

//router.delete("/:id", changeRestauranteStatus);


export default router;
