'use strict';

import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título de la promoción es obligatorio'],
        trim: true,
        maxlength: 100,
        unique: true
    },
    description: {
        type: String,
        required: [true, 'La descripción de la promoción es obligatoria'],
        maxlength: 500,
    },
    discountPercentage: {
        type: Number,
        required: [true, 'El porcentaje de descuento es obligatorio'],
        min: [0, 'El porcentaje de descuento no puede ser negativo'],
        max: [100, 'El porcentaje de descuento no puede ser mayor a 100']
    },
    dishesApplicables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }],
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante de la promoción es obligatorio']
    },
    scope: { // Para validar si aplica solo a eventos, pedidos o es para ambos
        type: String,
        required: [true, 'El alcance de la promoción es obligatorio'],
        enum: {
            values: ['EVENTOS', 'PEDIDOS', "GENERAL"],
            message: 'El alcance de la promoción debe ser uno de los siguientes: EVENTOS, PEDIDOS, GENERAL'
        }
    },
    startDate: {
        type: Date,
        required: [true, 'La fecha de inicio de la promoción es obligatoria']
    },
    endDate: {
        type: Date,
        required: [true, 'La fecha de fin de la promoción es obligatoria']
    },
    status: {
        type: String,
        enum: {
            values: ['PENDING', 'APPROVED', 'REJECTED'],
            message: 'El estado de la promoción debe ser PENDING, APPROVED o REJECTED'
        },
        default: 'PENDING'
    },
    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true, versionKey: false });

promotionSchema.index({ isActive: 1 });
promotionSchema.index({ restaurant: 1 });
promotionSchema.index({ scope: 1 });
promotionSchema.index({ title: 1, restaurant: 1, isActive: 1 }, { unique: true });

export default mongoose.model('Promotion', promotionSchema);