import Event from './event.model.js';
import Promotion from '../promotions/promotions.model.js';
import Employee from '../employees/employee.model.js';
import Client from '../client/client.model.js';
import { sendEventSubscriptionEmail } from '../../helpers/email-service.js';

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

export const createEvent = async (req, res) => {
    try {
        const { activePromotions, restaurant } = req.body;
        const user = req.user;
        let validPromotions = [];

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee || employee.restaurant.toString() !== restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes crear eventos para tu propio restaurante."
                });
            }
        }

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
        const { page = 1, limit = 20, isActive, restaurant } = req.query;
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
            filter.restaurant = employee.restaurant;
        } else if (restaurant) {
            filter.restaurant = restaurant;
        }

        const normalizedIsActive = parseActiveFilter(isActive);
        if (normalizedIsActive !== undefined) {
            filter.isActive = normalizedIsActive;
        } else if (isActive === undefined) {
            filter.isActive = true;
        }

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const events = await Event.find(filter)
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Event.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: events,
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
            message: 'Error al obtener los eventos',
            error: error.message
        });
    }
};

export const getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        const user = req.user;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== event.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para ver eventos de otros restaurantes."
                });
            }
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
        const user = req.user;

        const eventToUpdate = await Event.findById(eventId);
        if (!eventToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== eventToUpdate.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para actualizar eventos de otros restaurantes."
                });
            }
            if (updateData.restaurant && updateData.restaurant.toString() !== manager.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No puedes transferir un evento a otro restaurante."
                });
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true, runValidators: true });

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
        const user = req.user;

        const eventToUpdate = await Event.findById(eventId);
        if (!eventToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Evento no encontrado'
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== eventToUpdate.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para cambiar el estado de eventos de otros restaurantes."
                });
            }
        }

        const updatedEvent = await Event.findByIdAndUpdate(eventId, { isActive }, { new: true });

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

        const eventInfo = await Event.findById(id).populate('restaurant', 'name');
        if (!eventInfo) throw new Error('Evento no encontrado');

        if (eventInfo.attendees.includes(clientId)) {
            return res.status(400).json({
                success: false,
                message: 'Ya estás inscrito en este evento'
            });
        }

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

        const clientInfo = await Client.findById(clientId);
        if (clientInfo?.email) {
            sendEventSubscriptionEmail(
                clientInfo.email,
                clientInfo.name || req.user.name || 'Cliente',
                eventInfo.name,
                eventInfo.dateTime,
                eventInfo.restaurant?.name || 'Restaurante',
                finalPrice
            ).catch(err => console.error('Error sending subscription email:', err));
        }

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