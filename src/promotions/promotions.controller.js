import Promotions from "./promotions.model.js";

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
        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }
        const promotions = await Promotions.find(filter)
            //.populate('promotions', 'name')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Promotions.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: promotions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
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