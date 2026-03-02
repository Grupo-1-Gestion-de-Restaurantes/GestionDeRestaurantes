import { Router } from 'express';
import { getMyInvoices, getInvoiceById } from "./invoice.controller.js";
import { validateGetMyInvoices } from '../../middlewares/invoice-validators.js';


const router = Router();

router.get(
    '/myInvoices',
    validateGetMyInvoices,
    getMyInvoices
);
router.get('/:id', getInvoiceById);

export default router;