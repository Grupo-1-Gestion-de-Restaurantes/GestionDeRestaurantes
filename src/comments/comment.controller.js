import Comment from "./comment.model.js";
import Restaurante from "../restaurants/restaurant.model.js";
import Employee from "../employees/employee.model.js";
import Order from "../orders/order.model.js";

const parseActiveFilter = (value) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
        return undefined;
    }

    if (value === true || value === 'true' || value === 'active') {
        return true;
    }

    if (value === false || value === 'false' || value === 'inactive') {
        return false;
    }

    return undefined;
};

export const createComment = async (req, res) => {
    try {
        const commentData = { ...req.body };
        const user = req.user;



        if (user.role === 'MANAGER_ROLE' && commentData.restaurantId) {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee || employee.restaurant.toString() !== commentData.restaurantId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No puedes crear comentarios para otros restaurantes."
                });
            }
        }

        if ((user.role === 'CLIENT_ROLE' || user.role === 'USER_ROLE')) {
            commentData.clientId = user.id || user._id;
        }

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
        const { page = 1, limit = 10, isActive, search = '', restaurantId } = req.query;
        const user = req.user;
        const filter = {};

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee) {
                return res.status(403).json({
                    success: false,
                    message: "No se encontró información de tu restaurante."
                });
            }
            filter.restaurantId = employee.restaurant;
        } else if (restaurantId) {
            filter.restaurantId = restaurantId;
        }

        const normalizedIsActive = parseActiveFilter(isActive);
        if (normalizedIsActive !== undefined) {
            filter.isActive = normalizedIsActive;
        } else if (isActive === undefined) {
            filter.isActive = true;
        }

        if (search) {
            filter.$or = [
                { comment: { $regex: search, $options: 'i' } }
            ];
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const comments = await Comment.find(filter)
            .populate({ path: 'restaurantId', model: 'Restaurante', select: 'name' })
            .populate({ path: 'clientId', model: 'Client', select: 'name' })
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .sort(options.sort);

        const total = await Comment.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalRecords: total,
                limit: options.limit
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

export const getMyComments = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const client = req.user;

        const filter = { clientId: client.id || client._id, isActive: true };

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const comments = await Comment.find(filter)
            .populate({ path: 'restaurantId', model: 'Restaurante', select: 'name photo' })
            .populate({ path: 'dishId', model: 'Dish', select: 'name photo' })
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Comment.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: comments,
            pagination: {
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                totalRecords: total,
                limit: parsedLimit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener tus reseñas',
            error: error.message
        });
    }
};

export const getCommentById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'comentario no encontrado',
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE' && comment.restaurantId) {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== comment.restaurantId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para ver comentarios de otros restaurantes."
                });
            }
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
        const user = req.user;

        const currentComment = await Comment.findById(id);
        if (!currentComment) {
            return res.status(404).json({
                success: false,
                message: "Comentario no encontrado",
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE' && currentComment.restaurantId) {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== currentComment.restaurantId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para actualizar comentarios de otros restaurantes."
                });
            }
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
            error: error.message
        });
    }
};

export const changeCommentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        // Detectar si es activate o deactivate desde la URL
        const isActive = req.url.includes('/activate') && !req.url.includes('/deactivate');
        const action = isActive ? 'activado' : 'desactivado';

        const commentToUpdate = await Comment.findById(id);
        if (!commentToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Comentario no encontrado',
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE' && commentToUpdate.restaurantId) {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== commentToUpdate.restaurantId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para gestionar el estado de comentarios de otros restaurantes."
                });
            }
        }

        const comment = await Comment.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (commentToUpdate.restaurantId) {
            const restaurantComments = await Comment.find({
                restaurantId: commentToUpdate.restaurantId,
                isActive: true
            });

            const averageRating = restaurantComments.length > 0
                ? restaurantComments.reduce((acc, curr) => acc + curr.review, 0) / restaurantComments.length
                : 5.0;

            await Restaurante.findByIdAndUpdate(commentToUpdate.restaurantId, {
                rating: Math.round(averageRating * 10) / 10
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