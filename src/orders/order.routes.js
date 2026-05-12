import { Router } from "express";
import { validateCreateOrder, validateGetMyOrders, validateGetOrderById, validateUpdateStatus } from '../../middlewares/order-validators.js';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getOrders,
    deleteOrder,
    createOrderAdmin
} from "./order.controller.js";

const router = Router();

router.post("/create",
    validateCreateOrder,
    createOrder);

router.post("/create-admin",
    validateCreateOrder,
    createOrderAdmin);

router.get("/get", //validateGetOrders,
    getOrders);

router.get("/getMyOrders", validateGetMyOrders,
    getMyOrders);

router.get("/:id", validateGetOrderById,
    getOrderById);



router.put("/delete/:id", //validateDeleteOrder,
    deleteOrder);

router.put("/:id/status",
    validateUpdateStatus,
    updateOrderStatus);

export default router;