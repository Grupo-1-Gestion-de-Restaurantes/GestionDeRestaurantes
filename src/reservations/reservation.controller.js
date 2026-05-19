import Reservation from './reservation.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import Table from '../table/table.model.js';
import { notificationService } from '../notifications/notification.service.js';

export const createReservation = async (req, res) => {
    try {

        const reservationData = req.body;
        const { restaurant, table, reservationDate, durationInMinutes, numberOfPeople } = reservationData;

        const targetTable = await Table.findById(table);
        if (!targetTable) {
            return res.status(404).json({
                success: false,
                message: 'La mesa seleccionada no existe.'
            });
        }

        if (String(targetTable.restaurant) !== String(restaurant)) {
            return res.status(400).json({
                success: false,
                message: 'Error de integridad: La mesa seleccionada no pertenece a este restaurante.'
            });
        }

        if (Number(numberOfPeople) > targetTable.capacity) {
            return res.status(400).json({
                success: false,
                message: `La mesa seleccionada es muy pequeña. Capacidad máxima: ${targetTable.capacity} personas, pero intentas reservar para ${numberOfPeople}.`
            });
        }

        const newStart = new Date(reservationDate);
        const duration = durationInMinutes || 90; 
        const newEnd = new Date(newStart.getTime() + duration * 60000);

        const overlappingReservation = await Reservation.findOne({
            table: table,
            restaurant: restaurant,
            isActive: true,
            status: { $nin: ['CANCELADA', 'NO_ASISTIO'] }, 
            $expr: {
                $let: {
                    vars: {
                        existingStart: "$reservationDate",
                        existingEnd: {
                            $add: [
                                "$reservationDate",
                                { $multiply: [{ $ifNull: ["$durationInMinutes", 90] }, 60000] }
                            ]
                        }
                    },
                    in: {
                        $and: [
                            { $lt: [newStart, "$$existingEnd"] },
                            { $gt: [newEnd, "$$existingStart"] }
                        ]
                    }
                }
            }
        });

        if (overlappingReservation) {
            return res.status(400).json({
                success: false,
                message: 'La mesa ya se encuentra reservada o en uso durante ese lapso de tiempo.'
            });
        }

        const reservation = new Reservation(reservationData);
        await reservation.save();

        await notificationService.createAndEmit(
            String(reservation.client),
            'RESERVACION_RECIBIDA',
            'Reservación recibida',
            'Tu reservación ha sido registrada y está pendiente de confirmación.',
            reservation._id,
            'Reservation'
        );

        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            data: reservation
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear reservación',
            error: error.message
        });
    }
};

export const getReservations = async (req, res) => {
    try {
        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }



        const reservation = await Reservation.find()
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Reservation.countDocuments();

        res.status(200).json({
            success: true,
            data: reservation,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit,
                reservation
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los reservaciones',
            error: error.message
        })
    }
};

export const getReservationById = async (req, res) => {
    try {
        const { id } = req.params;

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la reservación',
            error: error.message,
        });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;

        const currentReservation = await Reservation.findById(id);
        if (!currentReservation) {
            return res.status(404).json({
                success: false,
                message: "Reservación no encontrada",
            });
        }

        const updateData = { ...req.body };

        const updatedReservation = await Reservation.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        const notifMap = {
            CONFIRMADA: { type: 'RESERVACION_CONFIRMADA', title: 'Reservación confirmada', message: 'Tu reservación ha sido confirmada. ¡Te esperamos!' },
            CANCELADA: { type: 'RESERVACION_CANCELADA', title: 'Reservación cancelada', message: 'Tu reservación ha sido cancelada.' },
            COMPLETADA: { type: 'RESERVACION_COMPLETADA', title: 'Reservación completada', message: 'Gracias por visitarnos. ¡Esperamos verte pronto!' },
            NO_ASISTIO: { type: 'RESERVACION_NO_ASISTIO', title: 'Reservación: no asistió', message: 'Registramos que no pudiste asistir a tu reservación.' },
        };

        if (updateData.status && notifMap[updateData.status]) {
            const notif = notifMap[updateData.status];
            await notificationService.createAndEmit(
                String(updatedReservation.client),
                notif.type,
                notif.title,
                notif.message,
                updatedReservation._id,
                'Reservation'
            );
        }

        res.status(200).json({
            success: true,
            message: "Reservación actualizada exitosamente",
            data: updatedReservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar reservación",
            error: error.message,
        });
    }
};

export const changeReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        // Detectar si es activate o deactivate desde la URL
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            message: `Reservación ${action} exitosamente`,
            data: reservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del reservación',
            error: error.message,
        });
    }
};

export const getMyReservations = async (req, res) => {
    try {
        const client = String(req.user.id);
        const { page = 1, limit = 10 } = req.query;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const reservations = await Reservation.find({ client })
            .sort({ reservationDate: -1 })
            .skip((parsedPage - 1) * parsedLimit)
            .limit(parsedLimit)
            .populate('restaurant', 'name address')
            .populate('table', 'tableNumber');

        const total = await Reservation.countDocuments({ client });

        res.status(200).json({
            success: true,
            data: reservations,
            pagination: {
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                totalRecords: total,
                limit: parsedLimit,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las reservaciones',
            error: error.message,
        });
    }
};