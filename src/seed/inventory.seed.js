'use strict';

import Inventory from '../inventories/inventory.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

const INVENTORY_TEMPLATES = [
  { name: 'Carne de Res', unit: 'KG', quantity: 50, minStock: 10 },
  { name: 'Pollo', unit: 'KG', quantity: 40, minStock: 8 },
  { name: 'Pescado', unit: 'KG', quantity: 30, minStock: 5 },
  { name: 'Harina', unit: 'KG', quantity: 100, minStock: 20 },
  { name: 'Arroz', unit: 'KG', quantity: 80, minStock: 15 },
  { name: 'Papa', unit: 'KG', quantity: 60, minStock: 10 },
  { name: 'Tomate', unit: 'KG', quantity: 40, minStock: 8 },
  { name: 'Cebolla', unit: 'KG', quantity: 35, minStock: 7 },
  { name: 'Lechuga', unit: 'UNIDAD', quantity: 50, minStock: 10 },
  { name: 'Queso Mozzarella', unit: 'KG', quantity: 25, minStock: 5 },
  { name: 'Queso Cheddar', unit: 'KG', quantity: 20, minStock: 5 },
  { name: 'Aceite Vegetal', unit: 'LITRO', quantity: 40, minStock: 8 },
  { name: 'Sal', unit: 'KG', quantity: 15, minStock: 3 },
  { name: 'Pimienta', unit: 'GRAMO', quantity: 2000, minStock: 500 },
  { name: 'Vino Tinto', unit: 'LITRO', quantity: 30, minStock: 6 },
  { name: 'Cerveza Artesanal', unit: 'UNIDAD', quantity: 100, minStock: 20 },
  { name: 'Refresco', unit: 'UNIDAD', quantity: 150, minStock: 30 },
  { name: 'Agua Mineral', unit: 'LITRO', quantity: 80, minStock: 15 },
  { name: 'Pan de Hamburguesa', unit: 'UNIDAD', quantity: 100, minStock: 20 },
  { name: 'Tortillas', unit: 'UNIDAD', quantity: 200, minStock: 50 },
];

export const seedInventoryIfEmpty = async () => {
  try {
    const count = await Inventory.countDocuments();
    if (count === 0) {
      console.log('Seeding inventory...');
      const restaurants = await Restaurante.find();
      
      if (restaurants.length === 0) {
        console.log('No restaurants found to seed inventory for.');
        return;
      }

      const inventoryToInsert = [];
      for (const restaurant of restaurants) {
        for (const template of INVENTORY_TEMPLATES) {
          inventoryToInsert.push({
            ...template,
            restaurant: restaurant._id,
            isActive: true
          });
        }
      }

      await Inventory.insertMany(inventoryToInsert);
      console.log(`Successfully seeded ${inventoryToInsert.length} inventory items.`);
    } else {
      console.log('Inventory already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding inventory:', error.message);
  }
};