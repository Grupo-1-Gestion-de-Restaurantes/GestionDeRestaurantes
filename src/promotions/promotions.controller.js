import mongoose from "mongoose";
import Promotions from "./promotions.model.js";
import Dish from "../dishes/dish.model.js";

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

export const createPromotion = async (req, res) => {
    try {
        const promotionData = req.body;
        const promotions = new Promotions(promotionData);
        await promotions.save();
        res.status(201).json({
            success: true,
            message: "La promocion fue creada con exito",
            data: promotions,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Ocurrió un error al crear la promoción",
            error: error.message,
        });
    }
};

export const getPromotion = async (req, res) => {
    try {
        const { page = 1, limit = 20, isActive, restaurant, scope, dishId, dishType } = req.query;
        const filter = {};
        const normalizedIsActive = parseActiveFilter(isActive);

        if (normalizedIsActive !== undefined) {
            filter.isActive = normalizedIsActive;
        }

        if (restaurant && mongoose.Types.ObjectId.isValid(restaurant)) {
            filter.restaurant = restaurant;
        }

        if (scope) {
            filter.scope = scope;
        }

        if (dishId && mongoose.Types.ObjectId.isValid(dishId)) {
            filter.$or = [
                { dishesApplicables: { $size: 0 } },
                { dishesApplicables: dishId }
            ];
        } else if (dishType) {
            const applicableDishes = await Dish.find({ dishType }).select('_id');
            const dishIds = applicableDishes.map(d => d._id);
            filter.$or = [
                { dishesApplicables: { $size: 0 } },
                { dishesApplicables: { $in: dishIds } }
            ];
        }

        const parsedPage = Math.max(1, parseInt(page) || 1);
        const parsedLimit = Math.max(1, parseInt(limit) || 20);

        const promotions = await Promotions.find(filter)
            .populate('restaurant', 'name')
            .populate('dishesApplicables', 'name')
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Promotions.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: promotions,
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
            message: 'Error al obtener las promociones',
            error: error.message
        });
    }
};

export const getPromotionById = async (req, res) => {
    try {
        const { id } = req.params;

        const promotion = await Promotions.findById(id);

        if (!promotion) {
            return res.status(404).json({
                success: false,
                message: 'Promoción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: promotion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la promoción',
            error: error.message
        });
    }
};

export const updatePromotion = async (req, res) => {
    try {
        const { id } = req.params;

        const currentPromotion = await Promotions.findById(id);
        if (!currentPromotion) {
            return res.status(404).json({
                success: false,
                message: 'Promoción no encontrada'
            });
        }
        const updateData = { ...req.body };

        const updatedPromotion = await Promotions.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
        
        res.status(200).json({
            success: true,
            message: 'Promoción actualizada con éxito',
            data: updatedPromotion
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la promoción',
            error: error.message
        });
    }
};

export const changePromotionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        const table = await Promotions.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Promoción no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            message: `Promoción ${action} exitosamente`,
            data: table,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la promoción',
            error: error.message,
        });
    }
};

export const updatePromotionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 

        const validStatuses = ['APPROVED', 'REJECTED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Estado inválido. Use APPROVED o REJECTED' 
            });
        }

        const promo = await Promotions.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!promo) {
            return res.status(404).json({ success: false, message: 'Promoción no encontrada' });
        }

        res.status(200).json({
            success: true,
            message: `La promoción ha sido ${status === 'APPROVED' ? 'aprobada' : 'rechazada'} exitosamente`,
            data: promo
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la promoción',
            error: error.message
        });
    }
};