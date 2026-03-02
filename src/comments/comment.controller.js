import Comment from "./comment.model.js";
import Restaurante from "../restaurants/restaurant.model.js";

export const createComment = async (req, res) => {
    try {
        const commentData = req.body;

        const comment = new Comment(commentData);
        await comment.save();

        // Actualizar el rating del restaurante si el comentario es para un restaurante
        if (commentData.restaurantId) {
            const restaurantComments = await Comment.find({
                restaurantId: commentData.restaurantId,
                isActive: true
            });

            if (restaurantComments.length > 0) {
                const totalReviews = restaurantComments.reduce((acc, curr) => acc + curr.review, 0);
                const averageRating = totalReviews / restaurantComments.length;

                await Restaurante.findByIdAndUpdate(commentData.restaurantId, {
                    rating: Math.round(averageRating * 10) / 10
                });
            }
        }

        res.status(201).json({
            success: true,
            message: "Comentario creado correctamente y rating del restaurante actualizado",
            data: comment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al crear comentario",
            error: error.message
        });
    }
};

export const getComments = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const comments = await Comment.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Comment.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit,
                comments
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los comentarios',
            error: error.message
        })
    }
};

export const getCommentById = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'comentario no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            data: comment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el comentario',
            error: error.message,
        });
    }
};

export const getCommentsDish = async (req, res) => {
    try {
        const { dishId } = req.params;

        const comments = await Comment.find({
            dishId,
            isActive: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: comments.length,
            data: comments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener comentarios del plato",
            error: error.message
        });
    }
};

export const getCommentsRestaurants = async (req, res) => {
    try {
        const { restaurantId } = req.params;

        const comments = await Comment.find({
            restaurantId,
            isActive: true
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            total: comments.length,
            data: comments
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al obtener comentarios del restaurante",
            error: error.message
        });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { id } = req.params;

        const currentComment = await Comment.findById(id);
        if (!currentComment) {
            return res.status(404).json({
                success: false,
                message: "Comentario no encontrado",
            });
        }

        const updateData = { ...req.body };

        const updatedComment = await Comment.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Comentario actualizado exitosamente",
            data: updatedComment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar comentario",
            error: error.message,
        });
    }
};

export const changeCommentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        // Detectar si es activate o deactivate desde la URL
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const comment = await Comment.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: `Comentario ${action} exitosamente`,
            data: comment,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del comentario',
            error: error.message,
        });
    }
};