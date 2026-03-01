import Reservation from "./reservation.model.js";
import '../restaurants/restaurant.model.js';
import '../table/table.model.js';

export const createReservation = async (req, res) => {
    try {

        const reservationData = req.body;

        const reservation = new Reservation(reservationData);
        await reservation.save();

        res.status(201).json({
            success: true,
            message: 'Reserva creada exitosamente',
            data: reservation
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear reservación',
            error: error.message
        })
    }
}

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

        if (!res) {
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

    const userId = req.user.id; // viene del JWT

    const reservations = await Reservation.find({
      client: userId,
      isActive: true
    })
    .populate('restaurant', 'name')
    .populate('table', 'number')
    .sort({ reservationDate: -1 });

    res.status(200).json({
      success: true,
      message: 'Mis reservaciones obtenidas exitosamente',
      total: reservations.length,
      data: reservations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener mis reservaciones',
      error: error.message
    });
  }
};