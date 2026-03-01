'use strict';

import mongoose from "mongoose";

const clientSchema = mongoose.Schema(
    {
        _id: {
            type: String,
            unique: true,
            trim: true,
        },

        name: {
            type: String,
            trim: true
        },

        email: {
            type: String,
            unique: true,
            trim: true
        },

        phone: {
            type: String,
            required: [true, "El teléfono es obligatorio"],
            trim: true,
            match: [/^[0-9]{8,15}$/, "Ingrese un número de teléfono válido"]
        },

        birthdate: {
            type: Date,
            required: [true, "La fecha de nacimiento es obligatoria"]
        },

        gender: {
            type: String,
            required: [true, "El género es obligatorio"],
            enum: {
                values: ["Masculino", "Femenino", "Otro"],
                message: "El género debe ser Masculino o Femenino"
            }
        },

        addresses: [
            {
                alias:{
                    type: String,
                    enum: {
                        values: ["Casa", "Trabajo", "Otro"],
                        message: "La dirección debe ser Casa, Trabajo u Otro",
                        default: "Casa"
                    }
                },
                addressLine: {
                    type: String,
                    required: [true, "La dirección es obligatoria"],
                    trim: true
                },
                houseNumber: {
                    type: String,
                    required: [true, "El número de casa es obligatorio"],
                    trim: true
                },
                securityInfo: {
                    type: String,
                    trim: true
                },
                reference: {
                    type: String,
                    trim: true
                },
                isDefault: {
                    type: Boolean,
                    default: false
                }
            }
        ],

        isActive: {
            type: Boolean,
            default: true
        },
    },
    {
        timestamps: true,
        versionKey: false
    }
);

export default mongoose.model("Client", clientSchema);