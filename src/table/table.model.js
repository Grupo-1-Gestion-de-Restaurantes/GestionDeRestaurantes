'use strict';
import mongoose from "mongoose";

const tableSchema = mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurante',
            required: [true, 'El restaurante es requerido']
        },
        tableNumber: {
            type: String,
            required: [true, 'El número de mesa es requerido'],
            trim: true,
            maxLength: [50, 'El número de mesa no puede exceder 50 caracteres']
        },
        capacity: {
            type: Number,
            required: [true, 'La capacidad es requerida'],
            min: [1, 'La capacidad debe ser al menos 1'],
            max: [20, 'La capacidad no puede exceder 20 personas']
        },
        location: {
            type: String,
            required: true,
            enum: ['Terraza', 'Salón Principal', 'VIP', 'Bar', 'Jardín'],
            default: 'Salón Principal'
        },
        availability: [{
            day: {
                type: String,
                enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
            },
            startTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
            endTime: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ }
        }],
        tableAvailability: {
            type: Boolean,
            default: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

tableSchema.index({ isActive: 1 });
tableSchema.index({ restaurant: 1 });
tableSchema.index({ tableAvailability: 1 });
tableSchema.index({ isActive: 1, restaurant: 1 });

export default mongoose.model('Table', tableSchema);