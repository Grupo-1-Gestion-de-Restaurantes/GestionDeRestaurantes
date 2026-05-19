'use strict';

import Restaurant from './src/restaurants/restaurant.model.js';
import Dish from './src/dishes/dish.model.js';
import Inventory from './src/inventories/inventory.model.js';
import Promotion from './src/promotions/promotions.model.js';
import Event from './src/events/event.model.js';
import Table from './src/table/table.model.js';

const DISH_TEMPLATES = [
    { name: "Hamburguesa Gourmet", description: "Carne angus, queso brie, cebolla caramelizada.", price: 75, dishType: "PLATO_FUERTE" },
    { name: "Pasta a la Norma", description: "Berenjenas, tomate, ricotta salada.", price: 65, dishType: "PLATO_FUERTE" },
    { name: "Ensalada Mediterránea", description: "Feta, aceitunas, pepino, tomate.", price: 45, dishType: "ENTRADA" },
    { name: "Carpaccio de Res", description: "Láminas de res con parmesano y alcaparras.", price: 55, dishType: "ENTRADA" },
    { name: "Tiramisú Casero", description: "Café, mascarpone y bizcocho.", price: 40, dishType: "POSTRE" },
    { name: "Cheesecake de Frutos Rojos", description: "Suave crema con mermelada artesanal.", price: 40, dishType: "POSTRE" },
    { name: "Limonada de Coco", description: "Refrescante y cremosa.", price: 25, dishType: "BEBIDA" },
    { name: "Vino de la Casa (Copa)", description: "Selección especial del sommelier.", price: 35, dishType: "BEBIDA" },
    { name: "Pizza Prosciutto", description: "Jamón serrano, rúcula y parmesano.", price: 85, dishType: "PLATO_FUERTE" },
    { name: "Risotto de Hongos", description: "Variedad de setas silvestres y aceite de trufa.", price: 90, dishType: "PLATO_FUERTE" },
    { name: "Sopa de Cebolla", description: "Gratinada con queso gruyere.", price: 35, dishType: "ENTRADA" },
    { name: "Salmón a la Plancha", description: "Con puré de camote y espárragos.", price: 120, dishType: "PLATO_FUERTE" }
];

const INVENTORY_ITEMS = [
    { name: "Carne de Res", unit: "KG" },
    { name: "Harina", unit: "KG" },
    { name: "Queso", unit: "KG" },
    { name: "Tomate", unit: "KG" },
    { name: "Lechuga", unit: "UNIDAD" },
    { name: "Cebolla", unit: "KG" },
    { name: "Aceite", unit: "LITRO" },
    { name: "Sal", unit: "KG" }
];

const TABLE_LOCATIONS = ['Terraza', 'Salón Principal', 'VIP', 'Bar', 'Jardín'];

export const runMassiveSeed = async () => {
    try {
        console.log('--- Starting Massive Seeding Check ---');
        
        const restaurants = await Restaurant.find();
        if (restaurants.length === 0) {
            console.log('No restaurants found. Skipping massive seed.');
            return;
        }

        for (const res of restaurants) {
            // 1. Ensure Inventory
            let inventory = await Inventory.find({ restaurant: res._id });
            if (inventory.length < 5) {
                console.log(`  Seeding inventory for ${res.name}...`);
                for (const item of INVENTORY_ITEMS) {
                    try {
                        await Inventory.findOneAndUpdate(
                            { restaurant: res._id, name: item.name },
                            { ...item, quantity: 100, minStock: 10, isActive: true },
                            { upsert: true, returnDocument: 'after' }
                        );
                    } catch (e) { /* skip */ }
                }
                inventory = await Inventory.find({ restaurant: res._id });
            }

            // 2. Ensure 10+ Dishes
            const dishesCount = await Dish.countDocuments({ restaurant: res._id });
            if (dishesCount < 10) {
                console.log(`  Seeding dishes for ${res.name} (currently ${dishesCount})...`);
                const dishesToInsert = [];
                for (let i = 0; i < 12; i++) {
                    const template = DISH_TEMPLATES[i];
                    const ingredients = inventory.slice(0, 3).map(inv => ({
                        inventoryItem: inv._id,
                        quantityUsed: Math.random() * 2 + 0.1
                    }));
                    
                    dishesToInsert.push({
                        ...template,
                        name: `${template.name} - ${res.name.split(' ')[0]}`,
                        restaurant: res._id,
                        ingredients,
                        isActive: true
                    });
                }
                try {
                    await Dish.insertMany(dishesToInsert, { ordered: false });
                } catch (e) {}
            }

            // 3. Ensure Promotions
            const promoCount = await Promotion.countDocuments({ restaurant: res._id });
            if (promoCount < 5) {
                console.log(`  Seeding promotions for ${res.name} (currently ${promoCount})...`);
                const promosToInsert = [];
                const restaurantDishes = await Dish.find({ restaurant: res._id });
                
                for (let i = 0; i < 8; i++) {
                    promosToInsert.push({
                        title: `Promo ${i + 1} en ${res.name} - ${Date.now() + i}`,
                        description: `¡Aprovecha esta promoción exclusiva de ${res.name}!`,
                        discountPercentage: 10 + (i * 5),
                        restaurant: res._id,
                        dishesApplicables: restaurantDishes.slice(0, 3).map(d => d._id),
                        scope: i % 2 === 0 ? 'PEDIDOS' : 'EVENTOS',
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
                        status: 'APPROVED',
                        isOneTimeUse: i % 2 === 0,
                        isActive: true
                    });
                }
                try {
                    await Promotion.insertMany(promosToInsert);
                } catch (e) {}
            }

            // 4. Ensure Events
            const eventCount = await Event.countDocuments({ restaurant: res._id });
            if (eventCount < 2) {
                console.log(`  Seeding events for ${res.name} (currently ${eventCount})...`);
                const eventsToInsert = [
                    {
                        name: `Noche de Jazz en ${res.name}`,
                        description: `Disfruta de la mejor música en vivo mientras degustas nuestra carta.`,
                        dateTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                        restaurant: res._id,
                        capacity: 40,
                        price: 75,
                        typeEvent: 'MUSICA_EN_VIVO',
                        isActive: true
                    },
                    {
                        name: `Degustación de Vinos - ${res.name}`,
                        description: `Una selección exclusiva de nuestra cava acompañada de maridaje.`,
                        dateTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
                        restaurant: res._id,
                        capacity: 20,
                        price: 200,
                        typeEvent: 'CATA_VINOS',
                        isActive: true
                    }
                ];
                try {
                    await Event.insertMany(eventsToInsert);
                } catch (e) {}
            }

            // 5. Ensure Tables
            const tableCount = await Table.countDocuments({ restaurant: res._id });
            if (tableCount < 5) {
                console.log(`  Seeding tables for ${res.name} (currently ${tableCount})...`);
                const tablesToInsert = [];
                for (let i = 1; i <= 8; i++) {
                    tablesToInsert.push({
                        restaurant: res._id,
                        tableNumber: `T-${i}-${res.name.substring(0, 3).toUpperCase()}`,
                        capacity: Math.floor(Math.random() * 4) + 2,
                        location: TABLE_LOCATIONS[Math.floor(Math.random() * TABLE_LOCATIONS.length)],
                        tableAvailability: true,
                        isActive: true
                    });
                }
                try {
                    await Table.insertMany(tablesToInsert, { ordered: false });
                } catch (e) {}
            }
        }

        console.log('--- Massive Seeding Process Completed ---');
    } catch (error) {
        console.error('Error during massive seeding:', error);
    }
};
