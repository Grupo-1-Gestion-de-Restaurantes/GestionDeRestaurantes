import { Router } from 'express';
import { getMyInvoices, getInvoiceById, getInvoicePdfById } from "./invoice.controller.js";
import { validateGetInvoiceById, validateGetMyInvoices } from '../../middlewares/invoice-validators.js';


const router = Router();

router.get(
    '/myInvoices',
    validateGetMyInvoices,
    getMyInvoices
);
router.get('/:id', validateGetInvoiceById, getInvoiceById);
router.get('/:id/pdf', validateGetInvoiceById, getInvoicePdfById);

export default router;