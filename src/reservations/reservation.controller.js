import Reservation from './reservation.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
import Table from '../table/table.model.js';
import Employee from '../employees/employee.model.js';
import { notificationService } from '../notifications/notification.service.js';

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

export const createReservation = async (req, res) => {
    try {

        const reservationData = req.body;
        const { restaurantId, tableId, reservationDate, time, durationInMinutes, numberOfPeople, occasion } = reservationData;
        const user = req.user;

        const restaurant = restaurantId;
        const table = tableId;

        const reservationDateTime = time 
            ? new Date(`${reservationDate}T${time}:00`)
            : new Date(reservationDate);

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee || employee.restaurant.toString() !== restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes crear reservaciones para tu propio restaurante."
                });
            }
        }

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

        const duration = durationInMinutes || 90; 
        const newStart = reservationDateTime;
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
                message: 'La mesa ya se encuentra reservada o en uso durante ese lapse de tiempo.'
            });
        }

        const reservation = new Reservation({
            ...reservationData,
            restaurant,
            table,
            client: req.user._id,
            reservationDate: reservationDateTime,
        });
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
            order: reservation
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

        const reservations = await Reservation.find(filter)
            .populate('restaurant', 'name')
            .populate('table', 'tableNumber')
            .populate('client', 'name email')
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Reservation.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reservations,
            pagination: {
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                totalRecords: total,
                limit: parsedLimit
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
        const user = req.user;

        const reservation = await Reservation.findById(id);
        if (!reservation) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada',
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== reservation.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para ver reservaciones de otros restaurantes."
                });
            }
        }

        res.status(200).json({
            success: true,
            data: reservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la reservación',
            error: error.message
        });
    }
};

export const updateReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const currentReservation = await Reservation.findById(id);
        if (!currentReservation) {
            return res.status(404).json({
                success: false,
                message: "Reservación no encontrada",
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== currentReservation.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para actualizar reservaciones de otros restaurantes."
                });
            }
        }

        const updateData = { ...req.body };

        const updatedReservation = await Reservation.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (updateData.status === 'CONFIRMADA') {
            await Table.findByIdAndUpdate(updatedReservation.table, { tableAvailability: false });
        } else if (['CANCELADA', 'COMPLETADA', 'NO_ASISTIO'].includes(updateData.status)) {
            await Table.findByIdAndUpdate(updatedReservation.table, { tableAvailability: true });
        }

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
            error: error.message
        });
    }
};

export const changeReservationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        // Detectar si es activate o deactivate desde la URL
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const reservationToUpdate = await Reservation.findById(id);
        if (!reservationToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Reservación no encontrada',
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== reservationToUpdate.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para gestionar el estado de reservaciones de otros restaurantes."
                });
            }
        }

        const reservation = await Reservation.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Reservación ${action} exitosamente`,
            data: reservation,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del reservación',
            error: error.message
        });
    }
};

export const getMyReservations = async (req, res) => {
    try {
        const client = String(req.user._id);
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
            error: error.message
        });
    }
};
