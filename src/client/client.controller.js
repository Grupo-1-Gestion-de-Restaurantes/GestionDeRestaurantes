import Client from './client.model.js';
import Order from '../orders/order.model.js';
import Employee from '../employees/employee.model.js';

const parseActiveFilter = (value) => {
    if (value === undefined || value === null || value === '') {
        return undefined;
    }

    if (value === 'all') {
        return 'all';
    }

    if (value === true || value === 'true' || value === 'active') {
        return true;
    }

    if (value === false || value === 'false' || value === 'inactive') {
        return false;
    }

    return undefined;
};

export const createClient = async (req, res) => {
    try {
        const client = req.user;

        if (client.phone && client.birthdate) {
            return res.status(400).json({
                success: false,
                message: 'Este cliente ya completó su registro anteriormente.',
                error: 'Información de cliente ya existe',
            });
        }

        delete req.body.name;
        delete req.body.email;
        delete req.body.role;
        delete req.body._id;

        client.set(req.body);

        if (req.body.address) {
            client.addresses.push({ ...req.body.address, isDefault: true });
        }

        await client.save();

        res.status(201).json({
            success: true,
            message: 'Cliente registrado exitosamente',
            data: client
        });

    } catch (error) {
        const status = error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({
            success: false,
            message: 'Error al registrar el cliente',
            error: error.message
        });
    }
}

export const getClients = async (req, res) => {

    try {
        const { page = 1, limit = 20, isActive, search = '' } = req.query;
        const user = req.user;
        const filter = {};


        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee) {
                return res.status(403).json({
                    success: false,
                    message: "No se encontró información de tu restaurante."
                });
            }
            const orderClients = await Order.distinct('client', { restaurant: employee.restaurant });
            filter._id = { $in: orderClients };
        }

        const normalizedIsActive = parseActiveFilter(isActive);

        if (normalizedIsActive !== undefined && normalizedIsActive !== 'all') {
            filter.isActive = normalizedIsActive;
        } else if (isActive === undefined) {
            filter.isActive = true;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { surname: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const clients = await Client.find(filter)
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Client.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: clients,
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
            message: 'Error al obtener los clientes',
            error: error.message
        })
    }

}

// Obtener cliente por ID
export const getClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const client = await Client.findById(id);

        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado',
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee) {
                return res.status(403).json({
                    success: false,
                    message: "No se encontró información de tu restaurante."
                });
            }
            const hasOrder = await Order.exists({ client: id, restaurant: employee.restaurant });
            if (!hasOrder) {
                return res.status(403).json({
                    success: false,
                    message: "Este cliente no tiene historial en tu restaurante."
                });
            }
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
        const clientEmail = req.user.email;
        
        console.log("=== UPDATE CLIENT DEBUG ===");
        console.log("clientEmail from req.user:", clientEmail);
        console.log("req.body:", JSON.stringify(req.body));
        
        const { address, ...otherData } = req.body;
        console.log("otherData after first destructure:", JSON.stringify(otherData));
        
        const { address: addr, ...rest } = otherData;
        console.log("rest after second destructure:", JSON.stringify(rest));
        
        const updateFields = { ...rest };
        console.log("updateFields to apply:", JSON.stringify(updateFields));
        
        if (address) {
            updateFields.addresses = [address];
        }
        
        // Buscar el cliente y actualizar con save() en lugar de findOneAndUpdate
        const client = await Client.findOne({ email: clientEmail });
        
        if (!client) {
            console.log("CLIENT NOT FOUND with email:", clientEmail);
            return res.status(404).json({ success: false, message: "Cliente no encontrado" });
        }
        
        console.log("Client found, current phone:", client.phone);
        console.log("Applying updateFields:", updateFields);
        
        // Aplicar cada campo del updateFields
        for (const [key, value] of Object.entries(updateFields)) {
            client[key] = value;
        }
        
        console.log("Client after setting fields, phone:", client.phone);
        
        await client.save();
        console.log("Client saved successfully, new phone:", client.phone);
        
        res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: client
        });
    } catch (error) {
        console.error("=== UPDATE CLIENT ERROR ===");
        console.error(error);
        const status = error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({
            success: false,
            message: "Error al actualizar",
            error: error.message
        });
    }
};

export const updateClientById = async (req, res) => {
    try {
        const { id } = req.params;
        const { addresses, ...otherData } = req.body;

        const client = await Client.findOne({ _id: id });

        if (!client) {
            return res.status(404).json({
                success: false,
                message: "Cliente no encontrado"
            });
        }

        if (otherData.name !== undefined) client.name = otherData.name;
        if (otherData.email !== undefined) client.email = otherData.email;
        if (otherData.phone !== undefined) client.phone = otherData.phone;
        if (otherData.birthdate !== undefined) client.birthdate = otherData.birthdate;
        if (otherData.gender !== undefined) client.gender = otherData.gender;
        if (addresses !== undefined) client.addresses = addresses;

        await client.save();

        res.status(200).json({
            success: true,
            message: "Cliente actualizado correctamente",
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

        if (!req.body.address) {
            return res.status(400).json({
                success: false,
                message: "La dirección es obligatoria"
            });
        }

        const updatedClient = await Client.findByIdAndUpdate(
            client._id,
            { $push: { addresses: req.body.address } },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Dirección agregada correctamente",
            data: updatedClient
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al agregar la dirección",
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

export const getMyInfo = async (req, res) => {
    try {
        const client = req.user;

        if (!client) {
            return res.status(404).json({ success: false, message: 'Cliente no encontrado' });
        }

        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener tu información',
            error: error.message,
        });
    }
};