import Client from "../src/client/client.model.js";

export const syncClientUpdate = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario no disponible",
      });
    }

    const { id, role, email, name } = req.user;

    // SOLO crear documento si no existe, NO modificar campos existentes
    // Esto permite que el controlador updateClient actualice phone libremente
    const user = await Client.findOneAndUpdate(
      { email: email },
      {
        $setOnInsert: {
          _id: id,
          email,
          name,
          isActive: true,
        },
      },
      { upsert: true, new: true, runValidators: false, returnDocument: "after" }
    );

    req.user = user;
    req.user.role = role;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error en la sincronización",
      error: error.message,
    });
  }
};