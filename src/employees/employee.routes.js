import { Router } from 'express';
import { uploadMemory } from '../../middlewares/file-uploader.js';
import { createEmployee, changeEmployeeStatus, getEmployeeById, getEmployees, updateEmployee } from './employee.controller.js';

const router = Router();

router.get('/', getEmployees);

router.get('/:id', getEmployeeById);

router.post('/',
    uploadMemory.single('profilePicture'),
    createEmployee);

router.put('/:id',
    updateEmployee);

router.patch('/:id', changeEmployeeStatus);

export default router;