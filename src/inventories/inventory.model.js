'use strict';

import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
        maxLength: [100, 'El nombre no puede tener más de 100 caracteres']
    },
    quantity: {
        type: Number,
        required: [true, 'La cantidad es obligatoria'],
        min: [0, 'La cantidad no puede ser negativa']
    },
    unit: {
        type: String,
        required: [true, 'La unidad es obligatoria'],
        enum: {
            values: ['KG', 'LITRO', 'UNIDAD', 'GRAMO', 'MILILITRO'],
            message: 'La unidad debe ser KG, LITRO, UNIDAD, GRAMO o MILILITRO'
        }
    },
    minStock: { // Para las alertas de stock bajo
        type: Number,
        min: [1, 'El stock mínimo debe ser al menos 1'],
        default: 5,
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'El restaurante es obligatorio']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    versionKey: false
});

inventorySchema.index({ isActive: 1 });
inventorySchema.index({ restaurant: 1 });
inventorySchema.index({ name: 1 });
inventorySchema.index({ restaurant: 1, name: 1 }, { unique: true });


export default mongoose.model('Inventory', inventorySchema);
