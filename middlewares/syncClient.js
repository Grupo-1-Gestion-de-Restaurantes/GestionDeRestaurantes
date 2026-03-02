import Client from '../src/client/client.model.js';

export const syncClient = async (req, res, next) => {
    try {
        if (!req.user?.id) {
            return res.status(400).json({
                success: false,
                message: "ID de usuario no disponible"
            });
        }
        const { id, name, email } = req.user; 

        const user = await Client.findOneAndUpdate(
            { _id: id },
            { 
                $set: { 
                    name: name,
                    email: email
                },
                $setOnInsert: { 
                    _id: id, 
                    isActive: true
                }
            },
            { upsert: true, new: true, runValidators: false } 
        );

        req.user = user;
        next();

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error en la sincronización",
            error: error.message
        });
    }
};