'use strict';

import PartnerLead from './partner.model.js';

export const createPartnerLead = async (req, res) => {
  try {
    const leadData = req.body;
    const newLead = new PartnerLead(leadData);
    await newLead.save();

    res.status(201).json({
      success: true,
      message: "Solicitud enviada correctamente. Un partner manager te contactará pronto.",
      id: newLead._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud de partner",
      error: error.message
    });
  }
};

export const getPartnerLeads = async (req, res) => {
  try {
    const leads = await PartnerLead.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener las solicitudes",
      error: error.message
    });
  }
};
