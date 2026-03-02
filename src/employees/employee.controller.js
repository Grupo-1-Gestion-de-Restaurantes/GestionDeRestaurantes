import Employee from './employee.model.js';
import Restaurant from '../restaurants/restaurant.model.js';

const sendRollbackError = async (userId, req) => {
    console.warn(`[ROLLBACK PENDIENTE] El usuario ${userId} fue creado en AuthService pero falló el registro del empleado. Eliminarlo manualmente si es necesario.`);
}

export const createEmployee = async (req, res) => {
    let createdUserId = null;

    try {
        const employeeData = req.body;

        if (!employeeData.restaurant) {
            return res.status(400).json({
                success: false,
                message: 'El ID del restaurante es obligatorio'
            });
        }

        const restaurantExists = await Restaurant.findById(employeeData.restaurant);
        if (!restaurantExists) {
            return res.status(404).json({
                success: false,
                message: 'El restaurante proporcionado no existe'
            });
        }

        const formData = new FormData();
        formData.append('name', employeeData.name);
        formData.append('surname', employeeData.surname);
        formData.append('username', employeeData.username);
        formData.append('email', employeeData.email);
        formData.append('password', employeeData.password);
        formData.append('phone', employeeData.phone);
        formData.append('role', employeeData.role);

        if (req.user.role === 'MANAGER_ROLE') {
            // obtener el restaurante del manager para forzar que este creando un empleado para su restaurante
            const userRestaurant = await Employee.findOne({ userId: req.user.id }).select('restaurant');
            if (userRestaurant.restaurant.toString() !== employeeData.restaurant) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo puedes crear empleados para tu propio restaurante',
                });
            }
        }

        if (req.file) {
            const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
            formData.append('profilePicture', blob, req.file.originalname);
        }


        const authResponse = await fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/register-employee`, {
            method: 'POST',
            headers: {
                'Authorization': req.headers['authorization']
            },
            body: formData
        });

        const rawText = await authResponse.text();
        let authData = null;
        try {
            authData = rawText ? JSON.parse(rawText) : {};
        } catch {
            console.error('AuthService respondió con body no-JSON:', rawText);
            return res.status(502).json({
                success: false,
                message: 'Respuesta inválida del AuthService',
                error: rawText || 'Body vacío'
            });
        }

        if (!authResponse.ok) {
            console.error(`AuthService respondió ${authResponse.status} ${authResponse.statusText}:`, authData);
            return res.status(authResponse.status).json({
                success: false,
                message: 'No se pudo registrar en AuthService',
                authStatus: authResponse.status,
                authStatusText: authResponse.statusText,
                error: authData
            });
        }

        createdUserId = authData.user?.id;

        const existingEmployee = await Employee.findOne({ userId: createdUserId });
        if (existingEmployee) {
            await sendRollbackError(createdUserId, req);
            return res.status(409).json({
                success: false,
                message: 'El empleado ya existe'
            });
        }

        const newEmployee = new Employee({
            userId: createdUserId,
            restaurant: employeeData.restaurant,
            specialty: (employeeData.role === 'MANAGER_ROLE') ? "ADMINISTRATIVO" : employeeData.specialty
        });

        await newEmployee.save();

        return res.status(201).json({
            success: true,
            message: 'Empleado creado y registrado exitosamente',
            data: newEmployee,
            authData: authData
        });

    } catch (error) {
        // Si falla, intenta hacer rollback en AuthService para eliminar el usuario creado
        if (createdUserId) {
            await sendRollbackError(createdUserId, req);
        }
        console.error("Error al crear el empleado:", error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el empleado',
            error: error.message
        });
    }
}

export const getEmployees = async (req, res) => {
    try {

        const { page = 1, limit = 10, isActive = true } = req.query;
        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 }
        };

        const employees = await Employee.find(filter)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .sort(options.sort);

        const total = await Employee.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: employees,
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
            message: 'Error al obtener los empleados',
            error: error.message
        });
    }
}

export const getEmployeeById = async (req, res) => {
    try {

        const employeeId = req.params.id;
        const employee = await Employee.findById(employeeId);


        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Empleado obtenido exitosamente',
            data: employee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el empleado',
            error: error.message
        });
    }
}

export const updateEmployee = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const { restaurant, specialty } = req.body;
        const updateData = {};
        if (restaurant !== undefined) updateData.restaurant = restaurant;
        if (specialty !== undefined) updateData.specialty = specialty;

        const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, updateData, { new: true, runValidators: true });

        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Empleado actualizado exitosamente',
            data: updatedEmployee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al actualizar el empleado',
            error: error.message
        });
    }
}

export const changeEmployeeStatus = async (req, res) => {
    try {
        const employeeId = req.params.id;
        const { isActive } = req.body;

        const updatedEmployee = await Employee.findByIdAndUpdate(employeeId, { isActive }, { new: true });

        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        // Desactivar o activar el usuario en AuthService
        // Pendiente de hacer endpoint en AuthService para esto, por ahora solo se hace el cambio en Employee
        res.status(200).json({
            success: true,
            message: `Empleado ${isActive ? 'activado' : 'desactivado'} exitosamente`,
            data: updatedEmployee
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del empleado',
            error: error.message
        });
    }

}