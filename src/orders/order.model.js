'use strict';

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    client: {
        type: String,
        ref: 'Client',
        required: [true, "El cliente es obligatorio"]
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurante',
        required: [true, "El restaurante es obligatorio"]
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
            required: [true, "El producto es obligatorio"]
        },
        name: {
            type: String,
            required: [true, "El nombre del producto es obligatorio"]
        },
        price: {
            type: Number,
            required: [true, "El precio del producto es obligatorio"]
        },
        quantity: {
            type: Number,
            required: [true, "La cantidad del producto es obligatoria"],
            min: [1, "La cantidad debe ser al menos 1"]
        },
        subtotal: {
            type: Number,
            required: [true, "El subtotal del producto es obligatorio"],
            min: [0, "El subtotal debe ser mayor o igual a 0"]
        }
    }],
    total: {
        type: Number,
        required: [true, "El total es obligatorio"],
        default: 0
    },
    deliveryAddress: {
        alias: {
            type: String,
            enum: ["Casa", "Trabajo", "Otro"],
            default: "Casa"
        },
        addressLine: {
            type: String,
            required: [true, "La dirección es obligatoria"],
            trim: true
        },
        houseNumber: {
            type: String,
            required: [true, "El número de casa es obligatorio"]
        },
        securityInfo: String,
        reference: String
    },
    status: {
        type: String,
        enum: ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'],
        default: 'PENDIENTE'
    },
    paymentMethod: {
        type: String,
        enum: {
            values: ['EFECTIVO', 'TARJETA'],
            message: "El método de pago debe ser EFECTIVO o TARJETA"
        },
        required: [true, "El método de pago es obligatorio"]
    }
}, { 
    timestamps: true,
    versionKey: false 
});

export default mongoose.model("Order", orderSchema);