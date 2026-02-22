import Event from './event.model.js';

export const createEvent = async (req, res) => {
    try {
        const event = new Event(req.body);
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