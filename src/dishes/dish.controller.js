import Dish from './dish.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

export const createDish = async (req, res) => {
    try {

        const dishData = req.body;

        if (dishData.ingredients && typeof dishData.ingredients === 'string') {
            dishData.ingredients = JSON.parse(dishData.ingredients);
        }

        if (!dishData.restaurant) {
            return res.status(400).json({
                success: false,
                message: 'El ID del restaurante es requerido para crear un platillo'
            });
        }

        const restaurantExists = await Restaurant.findById(dishData.restaurant);
        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: 'El restaurante proporcionado no existe'
            });
        }
        if (req.file) {
            dishData.photo = req.file.path;
        }


        const dish = new Dish(dishData);
        await dish.save();
        res.status(201).json({
            success: true,
            message: 'Platillo creado exitosamente',
            data: dish
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el platillo',
            error: error.message
        });
    }
}

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

export const getDishes = async (req, res) => {
    try {

        const { page = 1, limit = 20, isActive, restaurant, search = '', dishType = '' } = req.query;
        const filter = {};

        const normalizedIsActive = parseActiveFilter(isActive);
        if (normalizedIsActive !== undefined) {
            filter.isActive = normalizedIsActive;
        } else if (isActive === undefined) {
            // Por defecto, si no se envía nada, mostrar solo activos
            filter.isActive = true;
        }

        if (restaurant) {
            filter.restaurant = restaurant;
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (dishType) {
            filter.dishType = dishType;
        }

        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);

        const dishes = await Dish.find(filter)
            .populate({ path: 'restaurant', model: 'Restaurante', select: 'name' })
            .limit(parsedLimit)
            .skip((parsedPage - 1) * parsedLimit)
            .sort({ createdAt: -1 });

        const total = await Dish.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: dishes,
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
            message: 'Error al obtener los platillos',
            error: error.message
        });
    }
}

export const getDishById = async (req, res) => {
    try {

        const dishId = req.params.id;
        const dish = await Dish.findById(dishId);

        if (!dish) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Platillo obtenido exitosamente',
            data: dish
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el platillo',
            error: error.message
        });
    }
}

export const updateDish = async (req, res) => {

    try {

        const dishId = req.params.id;
        const updateData = req.body;

        if (updateData.ingredients && typeof updateData.ingredients === 'string') {
            updateData.ingredients = JSON.parse(updateData.ingredients);
        }

        if (req.file) {
            updateData.photo = req.file.path;
        }

        const updatedDish = await Dish.findByIdAndUpdate(dishId, updateData, { new: true, runValidators: true });

        if (!updatedDish) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Platillo actualizado exitosamente',
            data: updatedDish
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el platillo',
            error: error.message
        });
    }
}

export const changeDishStatus = async (req, res) => {
    try {
        const dishId = req.params.id;
        const { isActive } = req.body;

        const updatedDish = await Dish.findByIdAndUpdate(dishId, { isActive }, { new: true });

        if (!updatedDish) {
            return res.status(404).json({
                success: false,
                message: 'Platillo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: `Platillo ${isActive ? 'activado' : 'desactivado'} exitosamente`,
            data: updatedDish
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del platillo',
            error: error.message
        });
    }

}