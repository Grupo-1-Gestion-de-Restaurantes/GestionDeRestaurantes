'use strict';

import Event from '../events/event.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

const EVENT_PHOTOS = [
  "https://images.unsplash.com/photo-1514525253361-bee8718a7439?w=800",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800"
];

export const seedEventsIfEmpty = async () => {
  try {
    const count = await Event.countDocuments();
    if (count === 0) {
      console.log('Seeding events...');
      const restaurants = await Restaurante.find();
      
      const eventsToInsert = [];
      const eventTypes = ['CENA_TEMATICA', 'DEGUSTACION', 'FESTIVAL', 'OTRO'];
      const names = [
        'Noche de Jazz y Cena',
        'Degustación de Vinos Premium',
        'Festival Gastronómico Local',
        'Cena Bajo las Estrellas',
        'Taller de Cocina Italiana'
      ];

      for (const restaurant of restaurants) {
        for (let i = 0; i < 3; i++) {
          eventsToInsert.push({
            name: `${names[i % names.length]} en ${restaurant.name}`,
            description: `Acompáñanos en una experiencia gastronómica sin igual. Disfruta de los mejores platillos y un ambiente excepcional en el corazón de la ciudad.`,
            dateTime: new Date(Date.now() + (i + 1) * 5 * 24 * 60 * 60 * 1000), // En los próximos días
            restaurant: restaurant._id,
            capacity: 20 + (i * 10),
            price: 125 + (i * 75),
            typeEvent: eventTypes[i % eventTypes.length],
            attendees: [],
            isActive: true,
            photo: EVENT_PHOTOS[i % EVENT_PHOTOS.length]
          });
        }
      }

      await Event.insertMany(eventsToInsert);
      console.log(`Successfully seeded ${eventsToInsert.length} events.`);
    } else {
      console.log('Events already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding events:', error.message);
  }
};
