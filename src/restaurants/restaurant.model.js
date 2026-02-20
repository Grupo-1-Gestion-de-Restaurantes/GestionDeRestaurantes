'use strict';

import mongoose from "mongoose";

const restaurantSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [100, "El nombre no puede superar los 100 caracteres"]
    },

    address: {
      type: String,
      required: [true, "La dirección es obligatoria"],
      trim: true
    },

    categories: {
      type: String,
      required: true,
      enum: ["Gourmet", "Casual"]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "La descripción no puede superar los 500 caracteres"]
    },


    openingTime: {
      type: String,
      required: [true, "La hora de apertura es obligatoria"],
      trim: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Usa el formato HH:mm (ej: 09:30)"]
    },

    closingTime: {
      type: String,
      required: [true, "La hora de cierre es obligatoria"],
      trim: true,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, "Usa el formato HH:mm (ej: 22:00)"]
    },

    averagePrice: {
      type: Number,
      min: [0, "El precio promedio no puede ser negativo"]
    },

    phone: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
      match: [/^[0-9]{8,15}$/, "Ingrese un número de teléfono válido"]
    },

    photo: {
      type: String,
      default: null
    },

    status: {
      type: String,
      enum: ["Abierto", "Cerrado", "En Mantenimiento"],
      default: "Abierto",
    },

    isActive: {
      type: Boolean,
      default: true
    },

    rating: {
      type: Number,
      min: [1, "El rating mínimo es 1"],
      max: [5, "El rating máximo es 5"],
      default: 5
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model("Restaurante", restaurantSchema);