import { Router } from "express";
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

export default router;
