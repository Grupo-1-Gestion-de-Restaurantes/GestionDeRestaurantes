import Employee from './employee.model.js';

const sendRollbackError = async (userId) => {
    try {
        await fetch(`${process.env.AUTH_SERVICE_URL}/api/v1/auth/rollbackUser/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': req.headers['authorization'] }    
        });

        console.log("Rollback realizado exitosamente");

    } catch (rollbackError) {
        console.error("Error al intentar hacer rollback en AuthService:", rollbackError.message);
    }
}

export const createEmployee = async (req, res) => {
    let createdUserId = null;

    try {
        const employeeData = req.body;

        const formData = new FormData();
        formData.append('name', employeeData.name);
        formData.append('surname', employeeData.surname);
        formData.append('username', employeeData.username);
        formData.append('email', employeeData.email);
        formData.append('password', employeeData.password);
        formData.append('phone', employeeData.phone);

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

        const authData = await authResponse.json();

        if (!authResponse.ok) {
            return res.status(401).json({
                success: false,
                message: 'No se pudo registrar en AuthService',
                error: authData
            });
        }

        createdUserId = authData.user?.id;

        const existingEmployee = await Employee.findOne({ userId: createdUserId });
        if (existingEmployee) {
            await sendRollbackError(createdUserId);

        }

        const newEmployee = new Employee({
            userId: createdUserId,
            restaurant: employeeData.restaurant,
            specialty: employeeData.specialty
        });

        await newEmployee.save();

        res.status(201).json({
            success: true,
            message: 'Empleado creado y registrado exitosamente',
            data: newEmployee,
            authData: authData
        });

        await sendRollbackError(createdUserId);






    } catch (error) {
        // Si falla, intenta hacer rollback en AuthService para eliminar el usuario creado
        if (createdUserId) {
            await sendRollbackError(createdUserId);
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
        const updateData = req.body;
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