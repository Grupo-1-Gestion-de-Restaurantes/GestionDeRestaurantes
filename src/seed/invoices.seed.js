'use strict';

import Invoice from '../invoice/invoice.model.js';
import Order from '../orders/order.model.js';
import Client from '../client/client.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

export const seedInvoicesIfEmpty = async () => {
  try {
    const count = await Invoice.countDocuments();
    if (count === 0) {
      console.log('Seeding invoices...');
      const orders = await Order.find({ isActive: true }).populate('restaurant').populate('client');
      const clients = await Client.find({ isActive: true });
      const restaurants = await Restaurante.find({ isActive: true });
      
      if (orders.length === 0 || clients.length === 0 || restaurants.length === 0) {
        console.log('Required data (orders, clients, restaurants) not found. Skipping invoices seed.');
        return;
      }

      const invoicesToInsert = [];
      for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        if (!order.restaurant || !order.client) continue;

        const client = clients.find(c => c._id === order.client);
        if (!client) continue;

        const invoiceNumber = `INV-${order.restaurant._id.toString().slice(-6)}-${Date.now().toString().slice(-6)}-${i.toString().padStart(3, '0')}`;
        
        invoicesToInsert.push({
          invoiceNumber,
          order: order._id,
          client: order.client,
          clientName: client.name,
          restaurant: order.restaurant._id,
          restaurantName: order.restaurant.name,
          items: order.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
          })),
          total: order.total,
          paymentMethod: order.paymentMethod,
          issuedAt: order.createdAt
        });
      }

      if (invoicesToInsert.length > 0) {
        await Invoice.insertMany(invoicesToInsert);
        console.log(`Successfully seeded ${invoicesToInsert.length} invoices.`);
      }
    } else {
      console.log('Invoices already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding invoices:', error.message);
  }
};