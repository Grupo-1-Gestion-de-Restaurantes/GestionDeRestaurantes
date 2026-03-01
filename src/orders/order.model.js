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
    deliveryType: {
        type: String,
        enum: {
            values: ['DOMICILIO', 'RECOGER'],
            message: "El tipo de entrega debe ser DOMICILIO o RECOGER"
        },
        required: [true, "El tipo de entrega es obligatorio"],
        default: 'DOMICILIO'
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Dish',
            required: [true, "El producto es obligatorio"]
        },
        name: String,
        price: Number,
        quantity: {
            type: Number,
            required: true,
            min: [1, "Mínimo 1"]
        },
        subtotal: Number
    }],
    total: {
        type: Number,
        required: true,
        default: 0
    },
    deliveryAddress: {
        alias: {
            type: String,
            enum: ["Casa", "Trabajo", "Otro", "N/A"],
            default: "Casa"
        },
        addressLine: {
            type: String,
            trim: true
        },
        houseNumber: String,
        securityInfo: String,
        reference: String
    },
    status: {
        type: String,
        enum: ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'LISTO_PARA_RECOGER', 'ENTREGADO', 'CANCELADO'],
        default: 'PENDIENTE'
    },
    paymentMethod: {
        type: String,
        enum: ['EFECTIVO', 'TARJETA'],
        required: [true, "El método de pago es obligatorio"]
    }
}, { 
    timestamps: true,
    versionKey: false 
});

export default mongoose.model("Order", orderSchema);