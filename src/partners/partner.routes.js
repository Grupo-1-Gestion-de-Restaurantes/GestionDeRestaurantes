'use strict';

import { Router } from 'express';
import { createPartnerLead, getPartnerLeads, updateLeadStatus } from './partner.controller.js';
import { validatePartnerLead } from '../../middlewares/partner-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

// Endpoint for the public form - Requiere estar logueado para registrar restaurante
router.post('/leads', validateJWT, validatePartnerLead, createPartnerLead);

// Endpoint for internal use (e.g. admin dashboard)
router.get('/leads', validateJWT, requireRole('ADMIN_ROLE'), getPartnerLeads);

// Endpoint to approve or reject a lead
router.put('/leads/:id/status', validateJWT, requireRole('ADMIN_ROLE'), updateLeadStatus);

export default router;
