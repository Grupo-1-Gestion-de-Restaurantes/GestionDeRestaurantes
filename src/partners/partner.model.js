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
      required: [true, "La ciudad/dirección es obligatoria"]
    },
    branches: {
      type: Number,
      required: [true, "El número de sucursales es obligatorio"],
      min: 1
    },
    cuisine: {
      type: String,
      required: [true, "El tipo de cocina es obligatorio"]
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
