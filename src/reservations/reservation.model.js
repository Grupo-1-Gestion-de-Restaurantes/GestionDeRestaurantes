'use strict';

import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
    client: {
        type: String,
        ref: 'Client',
        required: [true, 'El cliente es requerido']
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es requerido']
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: [true, 'La mesa es requerida']
    },
    reservationDate: {
        type: Date,
        required: [true, 'La fecha y hora son requeridas']
    },
    numberOfPeople: {
        type: Number,
        required: [true, 'El número de personas es requerido']
    },
    status: {
        type: String,
        enum: ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'],
        default: 'PENDIENTE'
    },
    durationInMinutes: {
        type: Number,
        default: 90
    },
    specialRequests: {
        type: String,
        trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
}, { 
    timestamps: true,
    versionKey: false 
});


reservationSchema.index({ table: 1, reservationDate: 1 }, { unique: true });

export default mongoose.model('Reservation', reservationSchema);