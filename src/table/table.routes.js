    import { Router } from 'express';
    import {  changeTableStatus, createTable, getTableById, getTables,  updateTable,changeTableAvailability, getTablesByRestaurant } from './table.controller.js';
    import { validateCreateTable, validateTableStatusChange, validateGetTableById, validateUpdateTableRequest,validateTableAvailabilityChange, validateGetTablesByRestaurant, validateGetTables} from '../../middlewares/table-validators.js';


    const router = Router();

    router.get('/restaurant/:restaurantId', validateGetTablesByRestaurant, getTablesByRestaurant);
    router.post(
        '/create',
        validateCreateTable,
        createTable
    );

    router.get(
        '/get',
        validateGetTables,
        getTables
    );

    router.get('/:id', validateGetTableById, getTableById);

    router.put(
        '/:id',
        validateUpdateTableRequest,
        updateTable
    );

    router.put('/:id/activate', validateTableStatusChange, changeTableStatus);
    router.put('/:id/deactivate', validateTableStatusChange, changeTableStatus);
    router.put('/:id/availability', validateTableAvailabilityChange, changeTableAvailability);
    export default router;