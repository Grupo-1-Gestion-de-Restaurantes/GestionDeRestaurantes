'use strict';

import Promotion from '../promotions/promotions.model.js';
import Dish from '../dishes/dish.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

export const seedPromotionsIfEmpty = async () => {
  try {
    const count = await Promotion.countDocuments();
    if (count === 0) {
      console.log('Seeding promotions...');
      const restaurants = await Restaurante.find();
      
      const promotionsToInsert = [];
      for (const restaurant of restaurants) {
        const restaurantDishes = await Dish.find({ restaurant: restaurant._id });
        
        promotionsToInsert.push({
          title: `Descuento Especial ${restaurant.name}`,
          description: `Disfruta de un descuento exclusivo en todos nuestros pedidos para celebrar la apertura de ${restaurant.name}.`,
          discountPercentage: 15,
          restaurant: restaurant._id,
          dishesApplicables: restaurantDishes.slice(0, 3).map(d => d._id),
          scope: 'PEDIDOS',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          status: 'APPROVED',
          isActive: true
        });

        promotionsToInsert.push({
          title: `Evento VIP ${restaurant.name}`,
          description: `Promoción especial para reservaciones y eventos privados en ${restaurant.name}.`,
          discountPercentage: 20,
          restaurant: restaurant._id,
          dishesApplicables: [],
          scope: 'EVENTOS',
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
          status: 'APPROVED',
          isActive: true
        });
      }

      await Promotion.insertMany(promotionsToInsert);
      console.log(`Successfully seeded ${promotionsToInsert.length} promotions.`);
    } else {
      console.log('Promotions already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding promotions:', error.message);
  }
};
