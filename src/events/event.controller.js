import Event from './event.model.js';
import Promotion from '../promotions/promotions.model.js';

export const createEvent = async (req, res) => {
    try {
        const { activePromotions } = req.body;
        let validPromotions = [];

        if (activePromotions && activePromotions.length > 0) {

            for (const promoId of activePromotions) {
                const activePromo = await Promotion.findOne({
                    _id: promoId,
                    isActive: true,
                    status: 'APPROVED',
                    scope: { $in: ['EVENTOS', 'GENERAL'] },
                    startDate: { $lte: new Date() },
                    endDate: { $gte: new Date() }
                });

                if (!activePromo) {
                    return res.status(400).json({
                        success: false,
                        message: `La promoción no existe, no está aprobada, expiró o no aplica para eventos`
                    });
                }

                validPromotions.push(activePromo._id);
            }
        }

        delete req.body.activePromotions;

        const event = new Event(req.body);

        event.activePromotions = validPromotions;

        await event.save();

        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            data: event
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el evento',
            error: error.message
        });
    }
};
export const getEvents = async (req, res) => {
    try {

        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const events = await Event.find(filter)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .sort(options.sort);

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: events,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalRecords: total,
                limit: options.limit
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los eventos',
            error: error.message
        });
    }
};

export const getEventById = async (req, res) => {
    try {

        const eventId = req.params.id;
        const event = await Event.findById(eventId);


        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Evento obtenido exitosamente',
            data: event
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el evento',
            error: error.message
        });
    }
};

export const updateEvent = async (req, res) => {

    try {

        const eventId = req.params.id;
        const updateData = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true, runValidators: true });

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Evento actualizado exitosamente',
            data: updatedEvent
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el evento',
            error: error.message
        });
    }
}

export const changeEventStatus = async (req, res) => {
    try {
        const eventId = req.params.id;
        const { isActive } = req.body;

        const updatedEvent = await Event.findByIdAndUpdate(eventId, { isActive }, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: `Evento ${isActive ? 'activado' : 'desactivado'} exitosamente`,
            data: updatedEvent
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del evento',
            error: error.message
        });
    }

}

export const subscribeToEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { promotionId } = req.body;

        const clientId = req.user.id;

        const eventInfo = await Event.findById(id);
        if (!eventInfo) throw new Error('Evento no encontrado');

        let finalPrice = eventInfo.price || 0;
        let discountValue = 0;

        if (promotionId) {
            const hasPromotion = eventInfo.activePromotions.some(
                promo => promo.toString() === promotionId
            );

            if (!hasPromotion) {
                throw new Error("Esta promoción no está asignada a este evento");
            }

            const activePromo = await Promotion.findOne({
                _id: promotionId,
                isActive: true,
                status: 'APPROVED',
                scope: { $in: ['EVENTOS', 'GENERAL'] },
                startDate: { $lte: new Date() },
                endDate: { $gte: new Date() }
            });

            if (!activePromo) throw new Error("La promoción no es válida, no está aprobada, expiró o no aplica para eventos");

            discountValue = finalPrice * (activePromo.discountPercentage / 100);
            finalPrice -= discountValue;
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: id, capacity: { $gt: 0 }, isActive: true },
            {
                $inc: { capacity: -1 },
                $addToSet: { attendees: clientId }
            },
            { new: true }
        );

        if (!updatedEvent) throw new Error('Evento lleno o inactivo');

        res.status(200).json({
            success: true,
            message: 'Inscrito con éxito al evento',
            paymentDetails: {
                originalPrice: eventInfo.price,
                discount: discountValue,
                totalToPay: finalPrice
            },
            data: updatedEvent
        });

    } catch (error) {
        res.status(400).json({ success: false, message: 'Error al inscribirse al evento', error: error.message });
    }
};