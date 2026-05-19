import { Router } from "express";
import { 
    validateCreateOrder, 
    validateCreateOrderAdmin, 
    validateGetMyOrders, 
    validateGetOrderById, 
    validateUpdateStatus,
    validateGetOrders,
    validateDeleteOrder,
    validateUpdateOrderAdmin
} from '../../middlewares/order-validators.js';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderStatus,
    getOrders,
    deleteOrder,
    createOrderAdmin,
    updateOrderAdmin
} from "./order.controller.js";

const router = Router();

router.post("/create",
    validateCreateOrder,
    createOrder);

router.post("/create-admin",
    validateCreateOrderAdmin,
    createOrderAdmin);

router.get("/get", 
    validateGetOrders,
    getOrders);

router.get("/getMyOrders", validateGetMyOrders,
    getMyOrders);

router.get("/:id", validateGetOrderById,
    getOrderById);

router.put("/delete/:id", 
    validateDeleteOrder,
    deleteOrder);

router.put("/update-admin/:id",
    validateUpdateOrderAdmin,
    updateOrderAdmin);

router.put("/:id/status",
    validateUpdateStatus,
    updateOrderStatus);

export default router;