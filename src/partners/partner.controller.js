'use strict';

import PartnerLead from './partner.model.js';
import Restaurante from '../restaurants/restaurant.model.js';
import Employee from '../employees/employee.model.js';
import { sendPartnerStatusEmail, sendAdminAlertEmail } from '../../helpers/email-service.js';

export const createPartnerLead = async (req, res) => {
    try {
        const leadData = {
            ...req.body,
            userId: req.user.id
        };
        const newLead = new PartnerLead(leadData);
        await newLead.save();

        res.status(201).json({
            success: true,
            message: "Solicitud enviada correctamente. Un administrador revisará tu propuesta.",
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
    const { page = 1, limit = 20 } = req.query;
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);

    const leads = await PartnerLead.find()
      .limit(parsedLimit)
      .skip((parsedPage - 1) * parsedLimit)
      .sort({ createdAt: -1 });

    const total = await PartnerLead.countDocuments();

    res.status(200).json({
      success: true,
      data: leads,
      pagination: {
        currentPage: parsedPage,
        totalPages: Math.ceil(total / parsedLimit),
        totalRecords: total,
        limit: parsedLimit
      }
    });
  } catch (error) {        res.status(500).json({
            success: false,
            message: "Error al obtener las solicitudes",
            error: error.message
        });
    }
};

export const updateLeadStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const lead = await PartnerLead.findById(id);
        if (!lead) {
            return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
        }

        if (lead.status !== 'PENDING') {
            return res.status(400).json({ success: false, message: 'Esta solicitud ya ha sido procesada' });
        }

        lead.status = status;
        await lead.save();

        if (status === 'APPROVED') {
            // 1. Crear el Restaurante
            const newRestaurant = new Restaurante({
                name: lead.restaurantName,
                address: lead.cityAddress,
                city: lead.city || "Guatemala",
                categories: lead.categories,
                description: lead.message || `Restaurante ${lead.restaurantName}`,
                phone: lead.phone,
                capacity: lead.capacity,
                openingTime: lead.openingTime,
                closingTime: lead.closingTime
            });
            await newRestaurant.save();

            // 2. Crear el Empleado (Manager)
            const newEmployee = new Employee({
                userId: lead.userId,
                fullName: lead.contactName,
                restaurant: newRestaurant._id,
                specialty: 'ADMINISTRATIVO'
            });
            await newEmployee.save();

            // 3. Actualizar el rol en el AuthService a MANAGER_ROLE
            try {
                const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5233';
                const authResponse = await fetch(`${authServiceUrl}/api/v1/users/${lead.userId}/role`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': req.headers['authorization'] || '',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ roleName: 'MANAGER_ROLE' })
                });

                if (!authResponse.ok) {
                    const errorData = await authResponse.json().catch(() => ({}));
                    console.error('Error al actualizar rol en AuthService:', errorData);

                    // Notificar al admin por correo
                    await sendAdminAlertEmail(
                        "⚠️ Error en actualización de rol (Partner)",
                        `<p>El partner <b>${lead.restaurantName}</b> fue aprobado, pero no se pudo actualizar el rol del usuario en el servicio de autenticación.</p>
                         <p>ID de usuario: ${lead.userId}</p>
                         <p>Status: ${authResponse.status}</p>
                         <p>Error: ${JSON.stringify(errorData)}</p>
                         <p>Por favor, actualice el rol manualmente a MANAGER_ROLE.</p>`
                    ).catch(e => console.error("Error enviando email de alerta:", e));
                }
            } catch (authError) {
                console.error('Fallo de red al conectar con AuthService:', authError);

                // Notificar al admin por correo en caso de fallo de red
                await sendAdminAlertEmail(
                    "⚠️ Fallo de red - actualización de rol (Partner)",
                    `<p>El partner <b>${lead.restaurantName}</b> fue aprobado, pero hubo un fallo de red al intentar conectar con el AuthService.</p>
                     <p>ID de usuario: ${lead.userId}</p>
                     <p>Error: ${authError.message}</p>
                     <p>Por favor, verifique la conexión y actualice el rol manualmente si es necesario.</p>`
                ).catch(e => console.error("Error enviando email de alerta:", e));
            }
        }

        // 4. Enviar Correo al partner
        await sendPartnerStatusEmail(lead.email, lead.contactName, status);

        res.status(200).json({
            success: true,
            message: `Solicitud ${status} correctamente`,
            data: lead
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar el estado de la solicitud",
            error: error.message
        });
    }
};
