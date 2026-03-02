import { Router } from 'express';
import { uploadMemory } from '../../middlewares/file-uploader.js';
import { createEmployee, changeEmployeeStatus, getEmployeeById, getEmployees, updateEmployee } from './employee.controller.js';
import {
    validateCreateEmployee,
    validateUpdateEmployee,
    validateGetEmployeeById,
    validateChangeEmployeeStatus
} from '../../middlewares/employees-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';

const router = Router();

router.get('/', validateJWT, getEmployees);

router.get('/:id', validateGetEmployeeById, getEmployeeById);

router.post('/',
    uploadMemory.single('profilePicture'),
    validateCreateEmployee,
    createEmployee);

router.put('/:id',
    validateUpdateEmployee,
    updateEmployee);

router.patch('/:id',
    validateChangeEmployeeStatus,
    changeEmployeeStatus);

export default router;