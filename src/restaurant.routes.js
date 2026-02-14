import { Router } from "express";
import {
  createRestaurante,
  getRestaurantes,
  getRestauranteById,
  updateRestaurante,
  deleteRestaurante
} from "../restaurants/restaurant.controller.js";

const router = Router();

router.post("/", createRestaurante);

router.get("/", getRestaurantes);

router.get("/:id", getRestauranteById);

router.put("/:id", updateRestaurante);

router.delete("/:id", deleteRestaurante);

export default router;
