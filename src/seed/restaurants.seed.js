'use strict';

import Restaurante from '../restaurants/restaurant.model.js';

const PARTNERS = [
  { name: "McDonald's", address: "Av. Principal 123", categories: "Casual", openingTime: "07:00", closingTime: "23:00", phone: "12345678", photo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800" },
  { name: "Taco Bell", address: "Calle Secundaria 456", categories: "Casual", openingTime: "10:00", closingTime: "22:00", phone: "23456789", photo: "https://images.unsplash.com/photo-1599974597221-a51cf78130f2?w=800" },
  { name: "Wendy's", address: "Bulevar Central 789", categories: "Casual", openingTime: "09:00", closingTime: "21:00", phone: "34567890", photo: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?w=800" },
  { name: "Domino's Pizza", address: "Av. Las Pizzas 101", categories: "Casual", openingTime: "11:00", closingTime: "23:59", phone: "45678901", photo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800" },
  { name: "KFC", address: "Av. El Pollo 202", categories: "Casual", openingTime: "10:00", closingTime: "22:00", phone: "56789012", photo: "https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=800" },
  { name: "MrBeast Burgers", address: "Cloud Kitchen 303", categories: "Casual", openingTime: "11:00", closingTime: "23:00", phone: "67890123", photo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800" },
  { name: "Pizza Hut", address: "Av. Italia 404", categories: "Casual", openingTime: "11:00", closingTime: "22:00", phone: "78901234", photo: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=800" },
  { name: "Starbucks", address: "Plaza Café 505", categories: "Gourmet", openingTime: "06:00", closingTime: "21:00", phone: "89012345", photo: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800" },
  { name: "Subway", address: "Calle El Sandwich 606", categories: "Casual", openingTime: "08:00", closingTime: "20:00", phone: "90123456", photo: "https://images.unsplash.com/photo-1509722747041-619f3830c00d?w=800" },
  { name: "Arla", address: "Sector Lácteo 707", categories: "Gourmet", openingTime: "08:00", closingTime: "18:00", phone: "11223344", photo: "https://images.unsplash.com/photo-1550583760-586910d7c05d?w=800" },
  { name: "Gloria Jean's", address: "Av. Aroma 808", categories: "Gourmet", openingTime: "07:00", closingTime: "22:00", phone: "22334455", photo: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800" },
  { name: "Comidas Peruanas", address: "Av. El Sabor 909", categories: "Gourmet", openingTime: "12:00", closingTime: "22:00", phone: "33445566", photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800" }
];

export const seedRestaurantsIfEmpty = async () => {
  try {
    const count = await Restaurante.countDocuments();
    if (count === 0) {
      console.log('Seeding restaurants...');
      await Restaurante.insertMany(PARTNERS.map(p => ({
        ...p,
        description: `Bienvenido a ${p.name}, donde servimos lo mejor de nuestra especialidad.`,
        averagePrice: p.categories === "Gourmet" ? 25 : 12,
        capacity: 50,
        rating: 4.5 + Math.random() * 0.5,
        etaMin: 15 + Math.floor(Math.random() * 30)
      })));
      console.log('Restaurants seeded successfully.');
    } else {
      console.log('Restaurants already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding restaurants:', error.message);
  }
};
