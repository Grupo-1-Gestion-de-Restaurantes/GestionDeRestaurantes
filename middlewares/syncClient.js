import Client from '../src/client/client.model.js';

export const syncClient = async (req, res, next) => {
    try {
        const { id } = req.user; 

        const user = await Client.findOneAndUpdate(
            { _id: id },
            { 
                $setOnInsert: { 
                    _id: id, 
                    isActive: true
                } 
            },
            { upsert: true, new: true }
        );

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error en la sincronización del cliente",
            error: error.message
        });
    }
};