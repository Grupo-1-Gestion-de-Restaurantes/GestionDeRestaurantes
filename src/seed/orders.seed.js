'use strict';

import Order from '../orders/order.model.js';
import Restaurante from '../restaurants/restaurant.model.js';
import Dish from '../dishes/dish.model.js';
import Client from '../client/client.model.js';

const ORDER_STATUSES = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'LISTO_PARA_RECOGER', 'ENTREGADO', 'CANCELADO'];
const PAYMENT_METHODS = ['EFECTIVO', 'TARJETA'];
const DELIVERY_TYPES = ['DOMICILIO', 'RECOGER'];
const DELIVERY_ALIASES = ['Casa', 'Trabajo', 'Otro', 'N/A'];

export const seedOrdersIfEmpty = async () => {
  try {
    const count = await Order.countDocuments();
    if (count === 0) {
      console.log('Seeding orders...');
      const restaurants = await Restaurante.find({ isActive: true });
      const dishes = await Dish.find({ isActive: true });
      const clients = await Client.find({ isActive: true });
      
      if (restaurants.length === 0 || dishes.length === 0 || clients.length === 0) {
        console.log('Required data (restaurants, dishes, clients) not found. Skipping order seed.');
        return;
      }

      const ordersToInsert = [];
      const now = new Date();

      for (const restaurant of restaurants) {
        const restaurantDishes = dishes.filter(d => String(d.restaurant) === String(restaurant._id));
        const restaurantClients = clients.slice(0, 10); // Use first 10 clients
        
        if (restaurantDishes.length === 0) continue;

        for (let i = 0; i < 20; i++) {
          const client = restaurantClients[i % restaurantClients.length];
          
          // Pick 1-4 random dishes from this restaurant
          const numItems = Math.floor(Math.random() * 4) + 1;
          const orderDishes = restaurantDishes
            .sort(() => 0.5 - Math.random())
            .slice(0, numItems);

          const items = orderDishes.map(d => ({
            productId: d._id,
            name: d.name,
            price: d.price,
            quantity: Math.floor(Math.random() * 3) + 1,
            subtotal: d.price * (Math.floor(Math.random() * 3) + 1)
          }));

          const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
          const status = ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)];
          const deliveryType = DELIVERY_TYPES[Math.floor(Math.random() * DELIVERY_TYPES.length)];
          const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];
          
          const createdAt = new Date(now);
          createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30)); // Within last 30 days
          createdAt.setHours(11 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);

          const order = {
            client: client._id,
            restaurant: restaurant._id,
            deliveryType,
            items,
            total: subtotal,
            deliveryAddress: {
              alias: DELIVERY_ALIASES[Math.floor(Math.random() * DELIVERY_ALIASES.length)],
              addressLine: client.addresses[0]?.addressLine || 'Dirección por defecto',
              houseNumber: client.addresses[0]?.houseNumber || '123',
              reference: client.addresses[0]?.reference || 'Sin referencia'
            },
            status,
            paymentMethod,
            promotion: Math.random() > 0.7 ? restaurantDishes[0]?._id : undefined, // 30% chance
            isActive: true,
            createdAt,
            updatedAt: createdAt
          };

          ordersToInsert.push(order);
        }
      }

      await Order.insertMany(ordersToInsert);
      console.log(`Successfully seeded ${ordersToInsert.length} orders.`);
    } else {
      console.log('Orders already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding orders:', error.message);
  }
};