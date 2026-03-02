'use strict';

import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    review: {
        type: Number,
        required: [true, "La reseña no puede estar vacía"],
        min: [1, "La reseña mínima es 1"],
        max: [5, "La reseña máxima es 5"]
    },
    comment: {
        type: String,
        required: [true, "El comentario no puede estar vacío"],
        trim: true,
        maxlength: [500, "El comentario no puede superar los 500 caracteres"]
    },

    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurant",
        required: false
    },

    dishId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish",
        required: false
    },

    isActive: {
        type: Boolean,
        default: true
    },
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Comment", commentSchema);