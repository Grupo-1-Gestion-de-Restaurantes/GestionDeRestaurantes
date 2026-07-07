'use strict';

import Notification from '../notifications/notification.model.js';
import Order from '../orders/order.model.js';
import Client from '../client/client.model.js';

const NOTIFICATION_TYPES = [
  { type: 'PEDIDO_RECIBIDO', title: 'Pedido Recibido', message: 'Tu pedido ha sido recibido y está pendiente de confirmación' },
  { type: 'PEDIDO_CONFIRMADO', title: 'Pedido Confirmado', message: 'Tu pedido ha sido confirmado y está en preparación' },
  { type: 'PEDIDO_EN_PREPARACION', title: 'Pedido en Preparación', message: 'Tu pedido está siendo preparado en la cocina' },
  { type: 'PEDIDO_LISTO', title: 'Pedido Listo', message: 'Tu pedido está listo para recoger/entregar' },
  { type: 'PEDIDO_ENTREGADO', title: 'Pedido Entregado', message: 'Tu pedido ha sido entregado exitosamente' },
  { type: 'RESERVACION_RECIBIDA', title: 'Reservación Recibida', message: 'Tu reservación ha sido registrada y está pendiente de confirmación' },
  { type: 'RESERVACION_CONFIRMADA', title: 'Reservación Confirmada', message: 'Tu reservación ha sido confirmada. ¡Te esperamos!' },
];

export const seedNotificationsIfEmpty = async () => {
  try {
    const count = await Notification.countDocuments();
    if (count === 0) {
      console.log('Seeding notifications...');
      
      const orders = await Order.find({ isActive: true }).populate('client');
      const clients = await Client.find({ isActive: true });
      
      if (orders.length === 0 || clients.length === 0) {
        console.log('Missing required data (orders or clients). Skipping notifications seed.');
        return;
      }

      const notificationsToInsert = [];
      
      for (let i = 0; i < 25; i++) {
        const order = orders[i % orders.length];
        const client = order.client || clients[i % clients.length];
        const type = NOTIFICATION_TYPES[i % NOTIFICATION_TYPES.length];
        
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));
        createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

        notificationsToInsert.push({
          recipient: client._id,
          type: type.type,
          title: type.title,
          message: type.message,
          referenceId: order._id,
          referenceType: 'Order',
          isRead: Math.random() > 0.4, // 60% read
          createdAt,
          updatedAt: createdAt
        });
      }

      await Notification.insertMany(notificationsToInsert);
      console.log(`Successfully seeded ${notificationsToInsert.length} notifications.`);
    } else {
      console.log('Notifications already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding notifications:', error.message);
  }
};