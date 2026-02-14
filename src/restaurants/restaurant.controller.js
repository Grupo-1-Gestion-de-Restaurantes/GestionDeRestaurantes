import Restaurante from "../restaurants/restaurant.model.js";

export const createRestaurante = async (req, res) => {
  try {
    const data = req.body;

    const restaurante = new Restaurante(data);
    await restaurante.save();

    return res.status(201).json({
      success: true,
      message: "Restaurante creado correctamente",
      restaurante
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al crear restaurante",
      error: error.message
    });
  }
};

export const getRestaurantes = async (req, res) => {
  try {
    const restaurantes = await Restaurante.find({ activo: true });

    return res.json({
      success: true,
      total: restaurantes.length,
      restaurantes
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al obtener restaurantes",
      error: error.message
    });
  }
};

export const getRestauranteById = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurante = await Restaurante.findById(id);

    if (!restaurante || !restaurante.activo) {
      return res.status(404).json({
        success: false,
        message: "Restaurante no encontrado"
      });
    }

    return res.json({
      success: true,
      restaurante
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al buscar restaurante",
      error: error.message
    });
  }
};

export const updateRestaurante = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const restaurante = await Restaurante.findByIdAndUpdate(
      id,
      data,
      { new: true }
    );

    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: "Restaurante no encontrado"
      });
    }

    return res.json({
      success: true,
      message: "Restaurante actualizado correctamente",
      restaurante
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al actualizar restaurante",
      error: error.message
    });
  }
};

export const deleteRestaurante = async (req, res) => {
  try {
    const { id } = req.params;

    const restaurante = await Restaurante.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!restaurante) {
      return res.status(404).json({
        success: false,
        message: "Restaurante no encontrado"
      });
    }

    return res.json({
      success: true,
      message: "Restaurante eliminado (soft delete)"
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error al eliminar restaurante",
      error: error.message
    });
  }
};