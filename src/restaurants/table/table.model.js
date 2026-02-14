'use strict';
import mongoose from "mongoose";

const tableSchema = mongoose.Schema(
    {
        restaurant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Restaurant',
            required: [true, 'El restaurante es requerido']
        },
        tableNumber : {
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
        tableAvailability: {
            type: Boolean,
            default: true
        },
        asset: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

tableSchema.index({ asset: 1 });
tableSchema.index({ restaurant: 1 });
tableSchema.index({ tableAvailability: 1 });
tableSchema.index({ asset: 1, restaurant: 1 });

export default mongoose.model('Table', tableSchema);