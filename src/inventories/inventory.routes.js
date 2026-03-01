import { validateCreateInventoryItem,validateGetInventoryById, validateChangeInventoryItemStatus, validateGetInventory, validateUpdateInventoryItem, validateUpdateInventoryStock } from "../../middlewares/inventory-validators.js";
import { createInventoryItem, changeInventoryItemStatus, updateInventoryItem, updateInventoryStock, getInventoryById, getInventory } from "./inventory.controller.js";

import Router from 'express';

const router = Router();

router.post('/',
    validateCreateInventoryItem,
    createInventoryItem);

router.get('/',
    validateGetInventory,
    getInventory);

router.get('/:id',
    validateGetInventoryById,
    getInventoryById);

router.patch('/:id/status',
    validateChangeInventoryItemStatus,
    changeInventoryItemStatus);

router.put('/:id',
    validateUpdateInventoryItem,
    updateInventoryItem);

router.patch('/:id/stock',
    validateUpdateInventoryStock,
    updateInventoryStock);

export default router;