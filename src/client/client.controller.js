import { parse } from 'dotenv';
import Client from './client.model.js';

export const createClient = async (req, res) => {
    try {
        const client = req.user; 

        client.set(req.body);

        if (req.body.address) {
            client.addresses.push({ ...req.body.address, isDefault: true });
        }

        await client.save();

        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: client
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear cliente',
            error: error.message
        });
    }
}

export const getClients = async (req, res) => {

    try {
        const { page = 1, limit = 10, isActive = true } = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        }

        const clients = await Client.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Client.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: clients,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los clientes',
            error: error.message
        })
    }

}

// Obtener cliente por ID
export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Client.findById(id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            data: client,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el cliente',
            error: error.message,
        });
    }
};

export const updateClient = async (req, res) => {
    try {
        const client = req.user;
        const { address, ...otherData } = req.body;

        client.set(otherData);

        if (address && address._id) {
            const addressToEdit = client.addresses.id(address._id);

            if (addressToEdit) {
                addressToEdit.set(address);
            } else {
                return res.status(404).json({
                    success: false,
                    message: "No se encontró la dirección con ese ID"
                });
            }
        }

        await client.save();

        res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: client
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar",
            error: error.message
        });
    }
};


// Actualizar cliente
export const addAddressToClient = async (req, res) => {
    try {
        const client = req.user;

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        client.set(req.body);


        if (req.body.address) {
            client.addresses.push(req.body.address);
        }

        await client.save();

        res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: client
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el cliente",
            error: error.message
        });
    }
};

// Cambiar estado del cliente (activar/desactivar)
export const changeClientStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const client = await Client.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: `Cliente ${action} exitosamente`,
            data: client,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del cliente',
            error: error.message,
        });
    }
};
