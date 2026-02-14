import Table from './table.model.js';

export const createTable = async (req, res) => {
    try {
        const tableData = req.body;

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
        const { page = 1, limit = 10, activo = true, restaurante } = req.query;

        const filter = { activo };
        
        if (restaurante) {
            filter.restaurante = restaurante;
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const tables = await Table.find(filter)
            .populate('restaurante', 'nombre')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Table.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: tables,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
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

        const table = await Table.findById(id).populate('restaurante', 'nombre');

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
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

        const currentTable = await Table.findById(id);
        if (!currentTable) {
            return res.status(404).json({
                success: false,
                message: "Mesa no encontrada",
            });
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
        const activo = req.url.includes('/activate');
        const action = activo ? 'activada' : 'desactivada';

        const table = await Table.findByIdAndUpdate(
            id,
            { activo },
            { new: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }

        res.status(200).json({
            success: true,
            message: `Mesa ${action} exitosamente`,
            data: table,
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

        const table = await Table.findByIdAndUpdate(
            id,
            { disponibilidad },
            { new: true }
        );

        if (!table) {
            return res.status(404).json({
                success: false,
                message: 'Mesa no encontrada',
            });
        }

        const status = disponibilidad ? 'disponible' : 'ocupada';

        res.status(200).json({
            success: true,
            message: `Mesa marcada como ${status}`,
            data: table,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar disponibilidad de la mesa',
            error: error.message,
        });
    }
};