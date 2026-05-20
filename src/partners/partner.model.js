'use strict';

import mongoose from "mongoose";

const partnerLeadSchema = mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: [true, "El nombre del restaurante es obligatorio"],
      trim: true
    },
    contactName: {
      type: String,
      required: [true, "El nombre de contacto es obligatorio"],
      trim: true
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: [true, "El teléfono es obligatorio"]
    },
    cityAddress: {
      type: String,
      required: [true, "La dirección es obligatoria"]
    },
    city: {
      type: String,
      required: [true, "La ciudad es obligatoria"],
      default: "Guatemala"
    },
    capacity: {
      type: Number,
      required: [true, "La capacidad es obligatoria"],
      min: 1
    },
    categories: {
      type: String,
      required: [true, "La categoría es obligatoria"],
      enum: ["Gourmet", "Casual"]
    },
    openingTime: {
      type: String,
      required: [true, "La hora de apertura es obligatoria"]
    },
    closingTime: {
      type: String,
      required: [true, "La hora de cierre es obligatoria"]
    },
    userId: {
      type: String,
      required: [true, "El ID del usuario es obligatorio"]
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model('PartnerLead', partnerLeadSchema);
