'use strict';

import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del evento es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre del evento no puede tener más de 100 caracteres']
    },
    description: {
        type: String,
        required: [true, 'La descripción del evento es obligatoria'],
        trim: true,
        maxlength: [500, 'La descripción del evento no puede tener más de 500 caracteres']
    },
    typeEvent: {
        type: String,
        required: [true, 'El tipo del evento es obligatorio'],
        enum: {
            values: ['CENA_TEMATICA', 'DEGUSTACION', 'FESTIVAL', 'OTRO'],
            message: 'El tipo del evento debe ser uno de los siguientes: CENA_TEMATICA, DEGUSTACION, FESTIVAL, OTRO'
        }
    },
    capacity: {
        type: Number,
        required: [true, 'La capacidad del evento es obligatoria'],
        min: [1, 'La capacidad del evento debe ser al menos 1'],
    },
    price: {
        type: Number,
        required: [true, 'El precio del evento es obligatorio'],
        min: [0, 'El precio del evento no puede ser negativo']
    },
    attendees: [{
        type: String, ref: 'Client', default: []
    }
    ],
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante del evento es obligatorio']
    },
    assignedTables: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table'
    }],
    specialDishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }],
    assignedEmployees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    }],
    additionalServices: [{
        type: String,
        enum: {
            values: ['MUSICA_EN_VIVO', 'DECORACION_ESPECIAL', 'FOTOGRAFIA', 'OTRO'],
            message: 'Los servicios adicionales deben ser uno de los siguientes: MUSICA_EN_VIVO, DECORACION_ESPECIAL, FOTOGRAFIA, OTRO'
        }
    }],
    activePromotions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Promotion'
    }],
    dateTime: {
        type: Date,
        required: [true, 'La fecha y hora del evento es obligatoria'],
        validate: {
            validator: function (value) {
                return value > new Date();
            },
            message: 'La fecha y hora del evento no puede ser en el pasado'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

eventSchema.index({ name: 1, restaurant: 1 }, { unique: true });
eventSchema.index({ restaurant: 1 });
eventSchema.index({ typeEvent: 1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ restaurant: 1, typeEvent: 1, dateTime: 1 });
eventSchema.index({ restaurant: 1, dateTime: 1 }, { unique: true });

export default mongoose.model('Event', eventSchema);