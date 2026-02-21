'use strict';

import mongoose from 'mongoose';
const dishSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del platillo es obligatorio'],
        unique: [true, 'El nombre del platillo ya existe'],
        trim: true,
        maxlength: [50, 'El nombre del platillo no puede tener más de 50 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción del platillo es obligatoria'],
        trim: true,
        maxlength: [500, 'La descripción del platillo no puede tener más de 500 caracteres']
    },
    price: {
        type: Number,
        required: [true, 'El precio del platillo es obligatorio'],
        min: [0, 'El precio del platillo no puede ser negativo']
    },
    dishType: {
        type: String,
        required: [true, 'El tipo del platillo es obligatorio'],
        enum: {
            values: ['Entrada', 'Plato fuerte', 'Postre', 'Bebida'],
            message: 'El tipo del platillo debe ser uno de los siguientes: Entrada, Plato fuerte, Postre, Bebida'
        }
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante del platillo es obligatorio']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

dishSchema.index({isActive: 1});
dishSchema.index({ restaurant: 1 });
dishSchema.index({ name: 1 });
dishSchema.index({ dishType: 1 });

dishSchema.index({ name: 1, restaurant: 1, isActive:1, dishType: 1}, { unique: true });

export default mongoose.model('Dish', dishSchema);