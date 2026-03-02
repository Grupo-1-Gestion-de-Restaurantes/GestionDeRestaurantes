import { Router } from 'express';
import { createClient, getClients , getClientById, updateClient, addAddressToClient, changeClientStatus, getMyInfo } from './client.controller.js';
import { validateGetClients, validateCreateClient, validateClientById,validateUpdateClientRequest, validateAddAddressToClient, validateClientStatusChange, validateGetMyInfo } from '../../middlewares/client-validators.js';

const router = Router();

router.post(
    '/create',
    validateCreateClient,
    createClient
)

router.get(
    '/get',
    validateGetClients,
    getClients
)

router.get('/myInfo', validateGetMyInfo, getMyInfo);

router.get('/:id', validateClientById, getClientById);

router.put(
    '/update',
    validateUpdateClientRequest,
    updateClient
);
router.put(
    '/addAddress',
    validateAddAddressToClient,
    addAddressToClient
);

router.put('/:id/activate', validateClientStatusChange, changeClientStatus);
router.put('/:id/deactivate', validateClientStatusChange, changeClientStatus);


export default router;