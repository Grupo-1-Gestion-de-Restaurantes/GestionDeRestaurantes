'use strict';

import Table from '../table/table.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

export const seedTablesIfEmpty = async () => {
  try {
    const count = await Table.countDocuments();
    if (count === 0) {
      console.log('Seeding tables...');
      const restaurants = await Restaurante.find();
      
      const tablesToInsert = [];
      for (const restaurant of restaurants) {
        for (let i = 1; i <= 8; i++) {
          tablesToInsert.push({
            restaurant: restaurant._id,
            tableNumber: `${i}`,
            capacity: Math.floor(Math.random() * 4) * 2 + 2, // 2, 4, 6, 8
            location: ['Terraza', 'Salón Principal', 'VIP', 'Bar', 'Jardín'][Math.floor(Math.random() * 5)],
            tableAvailability: true,
            isActive: true
          });
        }
      }

      await Table.insertMany(tablesToInsert);
      console.log(`Successfully seeded ${tablesToInsert.length} tables.`);
    } else {
      console.log('Tables already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding tables:', error.message);
  }
};
