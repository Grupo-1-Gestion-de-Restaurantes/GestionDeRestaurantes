'use strict';

import Reservation from '../reservations/reservation.model.js';
import Client from '../client/client.model.js';
import Table from '../table/table.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

const RESERVATION_STATUSES = ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'];
const SPECIAL_REQUESTS = [
  'Alergia a mariscos',
  'Silla para bebé',
  'Mesa cerca de ventana',
  'Sin gluten',
  'Vegetariano',
  'Aniversario - decoración especial',
  'Cumpleaños - postre con vela',
  'Acceso para silla de ruedas',
  'Ruido mínimo',
  ''
];

export const seedReservationsIfEmpty = async () => {
  try {
    const count = await Reservation.countDocuments();
    if (count === 0) {
      console.log('Seeding reservations...');
      
      const clients = await Client.find({ isActive: true });
      const tables = await Table.find({ isActive: true, tableAvailability: true }).populate('restaurant');
      const restaurants = await Restaurante.find({ isActive: true });
      
      if (clients.length === 0 || tables.length === 0 || restaurants.length === 0) {
        console.log('Missing required data (clients, tables, or restaurants). Skipping reservations seed.');
        return;
      }

      const reservationsToInsert = [];
      const now = new Date();
      
      for (let i = 0; i < 30; i++) {
        const client = clients[i % clients.length];
        const table = tables[i % tables.length];
        const restaurant = restaurants[i % restaurants.length];
        
        // Create reservation dates: some past, some future
        const daysOffset = Math.floor(Math.random() * 60) - 15; // -15 to +45 days
        const reservationDate = new Date(now);
        reservationDate.setDate(reservationDate.getDate() + daysOffset);
        reservationDate.setHours(Math.floor(Math.random() * 6) + 12, Math.floor(Math.random() * 4) * 15, 0, 0); // 12:00-18:45
        
        const numberOfPeople = Math.min(Math.floor(Math.random() * 8) + 1, table.capacity);
        const status = RESERVATION_STATUSES[Math.floor(Math.random() * RESERVATION_STATUSES.length)];
        
        // Future reservations should be PENDIENTE or CONFIRMADA
        const finalStatus = reservationDate > now 
          ? (Math.random() > 0.5 ? 'PENDIENTE' : 'CONFIRMADA')
          : status;

        reservationsToInsert.push({
          client: client._id,
          restaurant: restaurant._id,
          table: table._id,
          reservationDate,
          numberOfPeople,
          durationInMinutes: [60, 90, 120][Math.floor(Math.random() * 3)],
          status: finalStatus,
          specialRequests: SPECIAL_REQUESTS[Math.floor(Math.random() * SPECIAL_REQUESTS.length)],
          isActive: true
        });
      }

      await Reservation.insertMany(reservationsToInsert);
      console.log(`Successfully seeded ${reservationsToInsert.length} reservations.`);
    } else {
      console.log('Reservations already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding reservations:', error.message);
  }
};