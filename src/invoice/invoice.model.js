'use strict';

import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, unique: true, required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    client: { type: String, required: true },
    clientName: String,
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurante', required: true },
    items: [{
        name: String,
        quantity: Number,
        price: Number,
        subtotal: Number
    }],
    total: { type: Number, required: true },
    paymentMethod: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now }
});

export default mongoose.model('Invoice', invoiceSchema);