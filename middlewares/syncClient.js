import Client from '../src/client/client.model.js';

export const syncClient = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no disponible"
            });
        }

        const { id } = req.user;

        const user = await Client.findOneAndUpdate(
            { id: id },
            {
                $setOnInsert: {
                    id: id,
                    isActive: true
                }
            },
            { upsert: true, new: true }
        );

        req.user = user;
        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error en la sincronización del cliente",
            error: error.message
        });
    }
};