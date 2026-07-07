import Table from './table.model.js';
import Restaurant from '../restaurants/restaurant.model.js';
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

export const createTable = async (req, res) => {
    try {
        console.log("BODY QUE LLEGA:", req.body);
        const tableData = req.body;
        const user = req.user;

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee || employee.restaurant.toString() !== tableData.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "Solo puedes crear mesas para tu propio restaurante."
                });
            }
        }

        const table = new Table(tableData);
        await table.save();

        res.status(201).json({
            success: true,
            message: 'Mesa creada exitosamente',
            data: table
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear mesa',
            error: error.message
        });
    }
};

export const getTables = async (req, res) => {
    try {
        const { page = 1, limit = 20, isActive, restaurante } = req.query;
        const user = req.user;
        const filter = {};

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const employee = await Employee.findOne({ userId: user.id });
            if (!employee) {
                return res.status(403).json({
                    success: false,
                    message: "No se encontró información de tu restaurante."
                });
            }
            filter.restaurant = employee.restaurant;
        } else if (restaurante) {
            filter.restaurant = restaurante;
        }

        const normalizedIsActive = parseActiveFilter(isActive);

        if (normalizedIsActive !== undefined && normalizedIsActive !== 'all') {
            filter.isActive = normalizedIsActive;
        } else if (normalizedIsActive !== 'all') {
            filter.isActive = true;
        }
        
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const tables = await Table.find(filter)
            .populate('restaurant', 'name')
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Table.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: tables,
            pagination: {
                currentPage: parsedPage,
                totalPages: Math.ceil(total / parsedLimit),
                totalRecords: total,
                limit: parsedLimit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las mesas',
            error: error.message
        });
    }
};

export const getTableById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const table = await Table.findById(id).populate('restaurant', 'name');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== table.restaurant._id.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para ver mesas de otros restaurantes."
                });
            }
        }

        res.status(200).json({
            success: true,
            data: table,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la mesa',
            error: error.message,
        });
    }
};

export const updateTable = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const currentTable = await Table.findById(id);
        if (!currentTable) {
            return res.status(404).json({
                success: false,
                message: "Mesa no encontrada",
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== currentTable.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para actualizar mesas de otros restaurantes."
                });
            }
        }

        const updateData = { ...req.body };

        const updatedTable = await Table.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Mesa actualizada exitosamente",
            data: updatedTable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar mesa",
            error: error.message,
        });
    }
};

export const changeTableStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activada' : 'desactivada';

        const tableToUpdate = await Table.findById(id);
        if (!tableToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== tableToUpdate.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para cambiar el estado de mesas de otros restaurantes."
                });
            }
        }

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: `Mesa ${action} exitosamente`,
            data: updatedTable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado de la mesa',
            error: error.message,
        });
    }
};

export const changeTableAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { disponibilidad } = req.body;
        const user = req.user;

        const tableToUpdate = await Table.findById(id);
        if (!tableToUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== tableToUpdate.restaurant.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para cambiar la disponibilidad de mesas de otros restaurantes."
                });
            }
        }

        const updatedTable = await Table.findByIdAndUpdate(
            id,
            { disponibilidad },
            { new: true }
        );

        const status = disponibilidad ? 'disponible' : 'ocupada';

        res.status(200).json({
            success: true,
            message: `Mesa marcada como ${status}`,
            data: updatedTable,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar disponibilidad de la mesa',
            error: error.message,
        });
    }
};

export const getTablesByRestaurant = async (req, res) => {
    try {
        const { restaurantId } = req.params;
        const { page = 1, limit = 20, isActive } = req.query;
        const user = req.user;

        // Enforce MANAGER_ROLE restriction
        if (user.role === 'MANAGER_ROLE') {
            const manager = await Employee.findOne({ userId: user.id });
            if (!manager || manager.restaurant.toString() !== restaurantId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: "No tienes permiso para ver mesas de este restaurante."
                });
            }
        }

        const restaurantExists = await Restaurant.findById(restaurantId);
        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: 'El restaurante proporcionado no existe'
            });
        }

        const filter = { restaurant: restaurantId };
        const normalizedIsActive = parseActiveFilter(isActive);

        if (normalizedIsActive !== undefined && normalizedIsActive !== 'all') {
            filter.isActive = normalizedIsActive;
        }
        
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        const [tables, total] = await Promise.all([
            Table.find(filter)
                .populate('restaurant', 'name')
                .limit(parsedLimit)
                .skip(skip)
                .sort({ tableNumber: 1 }), 
            Table.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            data: tables,
            pagination: {
                totalRecords: total,
                totalPages: Math.ceil(total / parsedLimit),
                currentPage: parsedPage,
                limit: parsedLimit
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las mesas del restaurante',
            error: error.message
        });
    }
};