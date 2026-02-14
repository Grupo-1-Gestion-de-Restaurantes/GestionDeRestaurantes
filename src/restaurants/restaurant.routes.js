import { Router } from "express";
import {
  createRestaurante,
  getRestaurantes,
  getRestauranteById,
  updateRestaurante,
  deleteRestaurante
} from "./restaurant.controller.js";

const router = Router();

router.post("/create", createRestaurante);

router.get("/get", getRestaurantes);

router.get("/:id", getRestauranteById);

router.put("/:id", updateRestaurante);

router.delete("/:id", deleteRestaurante);

export default router;
