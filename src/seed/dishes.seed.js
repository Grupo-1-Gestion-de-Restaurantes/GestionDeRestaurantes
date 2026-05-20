'use strict';

import Dish from '../dishes/dish.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

const DISH_TEMPLATES = [
  { name: "Hamburguesa Clásica", description: "Carne de res, queso, lechuga y tomate.", price: 45, dishType: "PLATO_FUERTE" },
  { name: "Papas Fritas Grandes", description: "Papas crujientes con sal marina.", price: 25, dishType: "ENTRADA" },
  { name: "Alitas de Pollo (12 unidades)", description: "Bañadas en salsa buffalo o BBQ.", price: 85, dishType: "PLATO_FUERTE" },
  { name: "Pizza Pepperoni Familiar", description: "Mucha muzzarella y pepperoni.", price: 95, dishType: "PLATO_FUERTE" },
  { name: "Ensalada César", description: "Lechuga romana, croutons y aderezo césar.", price: 55, dishType: "ENTRADA" },
  { name: "Tacos al Pastor (3 unidades)", description: "Con piña, cebolla y cilantro.", price: 40, dishType: "PLATO_FUERTE" },
  { name: "Sushi Roll Dragon", description: "Camarón tempura, aguacate y anguila.", price: 75, dishType: "PLATO_FUERTE" },
  { name: "Pasta Carbonara", description: "Crema, tocino y queso parmesano.", price: 65, dishType: "PLATO_FUERTE" },
  { name: "Brownie con Helado", description: "Brownie de chocolate caliente.", price: 35, dishType: "POSTRE" },
  { name: "Limonada con Hierbabuena", description: "Refrescante y natural.", price: 20, dishType: "BEBIDA" },
  { name: "Sopa de Tomate", description: "Acompañada de pan tostado.", price: 30, dishType: "ENTRADA" },
  { name: "Corte de Entrecot 300g", description: "A la parrilla con guarnición.", price: 150, dishType: "PLATO_FUERTE" }
];

const PHOTOS = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
  "https://images.unsplash.com/photo-1572656631137-7935297eff55?w=500",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=500",
  "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500",
  "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500",
  "https://images.unsplash.com/photo-1473093226795-af9932fe5856?w=500",
  "https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?w=500",
  "https://images.unsplash.com/photo-1536935338213-d2c123348f0e?w=500"
];

export const seedDishesIfEmpty = async () => {
  try {
    const count = await Dish.countDocuments();
    if (count === 0) {
      console.log('Seeding dishes...');
      const restaurants = await Restaurante.find();
      
      if (restaurants.length === 0) {
        console.log('No restaurants found to seed dishes for.');
        return;
      }

      const dishesToInsert = [];
      for (const restaurant of restaurants) {
        for (let i = 0; i < 12; i++) {
          const template = DISH_TEMPLATES[i % DISH_TEMPLATES.length];
          dishesToInsert.push({
            ...template,
            restaurant: restaurant._id,
            status: true
          });
        }
      }

      await Dish.insertMany(dishesToInsert);
      console.log(`Successfully seeded ${dishesToInsert.length} dishes.`);
    } else {
      console.log('Dishes already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding dishes:', error.message);
  }
};
