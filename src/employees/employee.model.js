'use strict';

import e from 'cors';
import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'El ID del AuthService es obligatorio'],
        unique: true
    },
    fullName: {
        type: String,
        required: [true, 'El nombre completo del empleado es obligatorio']
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurante',
        required: [true, 'El restaurante del empleado es obligatorio']
    },
    specialty: {
        type: String,
        enum: {
            values: ['COCINERO', 'BARTENDER', 'CAMARERO', 'ADMINISTRATIVO', 'OTRO'],
            message: 'La especialidad del empleado debe ser una de las siguientes: COCINERO, CAMARERO, ADMINISTRATIVO, OTRO'
        },
        required: [true, 'La especialidad del empleado es obligatoria']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});
employeeSchema.index({ isActive: 1 });
employeeSchema.index({ restaurant: 1 });
employeeSchema.index({ specialty: 1 });
employeeSchema.index({ userId: 1, restaurant: 1 }, { unique: true });

export default mongoose.model('Employee', employeeSchema);