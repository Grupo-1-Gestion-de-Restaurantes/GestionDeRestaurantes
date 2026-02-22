import Dish from './dish.model.js';

export const createDish = async (req, res) => {
    try {

        const dishData = req.body;
        if (req.file){
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

export const getDishes = async (req, res) => {
    try {

        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const dishes = await Dish.find(filter)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .sort(options.sort);

            const total = await Dish.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: dishes,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit: options.limit
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

        if (req.file){
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