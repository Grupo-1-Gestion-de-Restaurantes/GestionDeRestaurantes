'use strict';

import { Router } from 'express';
import { createPartnerLead, getPartnerLeads } from './partner.controller.js';
import { validatePartnerLead } from '../../middlewares/partner-validators.js';

const router = Router();

// Endpoint for the public form
router.post('/leads', validatePartnerLead, createPartnerLead);

// Endpoint for internal use (e.g. admin dashboard)
router.get('/leads', getPartnerLeads);

export default router;
