import Restaurante from "../restaurants/restaurant.model.js";
import Reservation from "../reservations/reservation.model.js";
import Order from "../orders/order.model.js";

export const createRestaurante = async (req, res) => {
  try {
    console.log("BODY QUE LLEGA:", req.body);

    const restaurantData = req.body;

    if (req.file) {
      restaurantData.photo = req.file.path;
    }

    const restaurante = new Restaurante(restaurantData);
    await restaurante.save();

    res.status(201).json({
      success: true,
      message: "Restaurante creado correctamente",
      data: restaurante
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al crear restaurante",
      error: error.message
    });
  }
};

export const getRestaurantes = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive = true } = req.query;

    const filter = { isActive };

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    }

    const restaurantes = await Restaurante.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(options.sort);

    const total = await Restaurante.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: restaurantes,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit,
        restaurantes
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener los restaurantes',
      error: error.message
    })
  }
};

export const getRestauranteById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurante = await Restaurante.findById(id);

    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'restaurante no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      data: restaurante,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el restaurante',
      error: error.message,
    });
  }
};

export const updateRestaurante = async (req, res) => {
  try {
    const { id } = req.params;

    const currentRestaurante = await Restaurante.findById(id);
    if (!currentRestaurante) {
      return res.status(404).json({
        success: false,
        message: "Restaurante no encontrado",
      });
    }

    const updateData = { ...req.body };

    if (req.file) {
      if (currentRestaurante.photo_public_id) {
        await cloudinary.uploader.destroy(currentRestaurante.photo_public_id);
      }

      updateData.photo = req.file.path;
      updateData.photo_public_id = req.file.filename;
    }

    const updatedRestaurante = await Restaurante.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Restaurante actualizado exitosamente",
      data: updatedRestaurante,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al actualizar restaurante",
      error: error.message,
    });
  }
};

export const changeRestauranteStatus = async (req, res) => {
  try {
    const { id } = req.params;
    // Detectar si es activate o deactivate desde la URL
    const isActive = req.url.includes('/activate');
    const action = isActive ? 'activado' : 'desactivado';

    const restaurante = await Restaurante.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );

    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: 'Restaurante no encontrado',
      });
    }

    res.status(200).json({
      success: true,
      message: `Restaurante ${action} exitosamente`,
      data: restaurante,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar el estado del restaurante',
      error: error.message,
    });
  }
};

export const getActivity = async (req, res) => {
    try {
        const { id } = req.params; 

        const [reservations, orders] = await Promise.all([
            Reservation.find({ restaurant: id, isActive: true })
                .populate('table', 'number location capacity') 
                .sort({ reservationDate: 1 }),
            Order.find({ restaurant: id })
                .sort({ createdAt: -1 })
                .limit(20) 
        ]);

        return res.status(200).json({
            success: true,
            restaurantId: id,
            activeReservations: reservations.map(res => ({
                id: res._id,
                fecha: res.reservationDate,
                cliente: res.client,
                personas: res.numberOfPeople,
                mesa: res.table?.number || "N/A",
                ubicacion: res.table?.location || "General",
                estado: res.status
            })),
            recentOrders: orders.map(order => ({
                id: order._id,
                tipo: order.deliveryType, 
                total: `Q${order.total.toFixed(2)}`,
                estado: order.status,
                hora: order.createdAt
            }))
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error al consultar la actividad en vivo",
            error: error.message
        });
    }
};