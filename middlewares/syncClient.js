import Client from "../src/client/client.model.js";

export const syncClient = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario no disponible",
      });
    }
    const { id, role, email, name, phone } = req.user;
    const updateFields = {
      email,
      name,
    };
    if (phone) {
      updateFields.phone = phone;
    }

const user = await Client.findOneAndUpdate(
  { email: email },
  {
    $set: updateFields,
    $setOnInsert: {
      _id: id,
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
