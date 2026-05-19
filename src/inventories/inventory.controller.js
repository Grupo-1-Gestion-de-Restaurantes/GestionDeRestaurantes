import Inventory from './inventory.model.js';
import Employee from '../employees/employee.model.js';

const parseActiveFilter = (value) => {
    if (value === undefined || value === null || value === '' || value === 'all') {
        return undefined;
    }

    if (value === true || value === 'true' || value === 'active') {
        return true;
    }

    if (value === false || value === 'false' || value === 'inactive') {
        return false;
    }

    return undefined;
};

export const createInventoryItem = async (req, res) => {
    try {

        if (req.user.role === 'MANAGER_ROLE') {
            // obtener el restaurante del manager para forzar que este creando un item para su restaurante
            const userRestaurant = await Employee.findOne({ userId: req.user.id }).select('restaurant');
            if (userRestaurant.restaurant.toString() !== req.body.restaurant) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes crear items de inventario para tu propio restaurante',
                });
            }
        }


        const item = new Inventory(req.body);
        await item.save();
        res.status(201).json({
            success: true,
            message: 'El item de inventario se ha creado exitosamente',
            data: item
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el item de inventario',
            error: error.message
        });
    }
};

export const getInventory = async (req, res) => {
    try {
        const { page = 1, limit = 20, isActive, restaurant } = req.query;
        const filter = {};

        const normalizedIsActive = parseActiveFilter(isActive);
        if (normalizedIsActive !== undefined) {
            filter.isActive = normalizedIsActive;
        } else if (isActive === undefined) {
            filter.isActive = true;
        }

        if (restaurant) filter.restaurant = restaurant;

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const items = await Inventory.find(filter)
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ name: 1 });

        const total = await Inventory.countDocuments(filter);
        res.status(200).json({
            success: true,
            data: items,
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
            message: 'Error al obtener los items de inventario',
            error: error.message
        });
    }
};

export const getInventoryById = async (req, res) => {
    try {
        const item = await Inventory.findOne({ _id: req.params.id, isActive: true });
        if (!item) return res.status(404).json({ success: false, message: 'Item no encontrado' });

        res.status(200).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const updateInventoryItem = async (req, res) => {
    try {

        if (req.user.role === 'MANAGER_ROLE') {
            // obtener el restaurante del manager para forzar que este actualizando un item para su restaurante
            const userRestaurant = await Employee.findOne({ userId: req.user.id }).select('restaurant');
            if (userRestaurant.restaurant.toString() !== req.body.restaurant) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes actualizar items de inventario para tu propio restaurante',
                });
            }
        }

        const { id } = req.params;
        const updateData = req.body;

        const item = await Inventory.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        if (!item) return res.status(404).json({ success: false, message: 'Item no encontrado' });

        res.status(200).json({ success: true, message: 'Item actualizado', data: item });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

export const updateInventoryStock = async (req, res) => {
    try {

        if (req.user.role === 'MANAGER_ROLE') {
            // obtener el restaurante del manager para forzar que este actualizando un item para su restaurante
            const userRestaurant = await Employee.findOne({ userId: req.user.id }).select('restaurant');
            if (userRestaurant.restaurant.toString() !== req.body.restaurant) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes actualizar stock de items de inventario para tu propio restaurante',
                });
            }
        }

        const { id } = req.params;
        const { quantity } = req.body;
        const item = await Inventory.findByIdAndUpdate(id, { quantity }, { new: true, runValidators: true });
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item de inventario no encontrado'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Stock actualizado exitosamente',
            data: item
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el stock del item de inventario',
            error: error.message
        });
    }
};

export const changeInventoryItemStatus = async (req, res) => {
    try {

        if (req.user.role === 'MANAGER_ROLE') {
            // obtener el restaurante del manager para forzar que este eliminando un item para su restaurante
            const userRestaurant = await Employee.findOne({ userId: req.user.id }).select('restaurant');
            if (userRestaurant.restaurant.toString() !== req.body.restaurant) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes cambiar el estado de  items de inventario para tu propio restaurante',
                });
            }
        }

        const { id } = req.params;
        const isActive = req.body.isActive;
        const item = await Inventory.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item de inventario no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: `Item de inventario ${isActive ? 'activado' : 'desactivado'} exitosamente`,
            data: item,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del item de inventario',
            error: error.message,
        });
    }
};