'use strict';

import PartnerLead from '../partners/partner.model.js';

const PARTNER_TEMPLATES = [
  { restaurantName: 'La Trattoria Italiana', contactName: 'Giovanni Rossi', email: 'giovanni@trattoria.com', phone: '3101234567', cityAddress: 'Calle 85 #12-34', city: 'Bogotá', capacity: 60, categories: 'Gourmet', openingTime: '12:00', closingTime: '23:00', message: 'Restaurante familiar con recetas tradicionales italianas' },
  { restaurantName: 'El Rincón Mexicano', contactName: 'Carlos Mendoza', email: 'carlos@esquinamex.com', phone: '3159876543', cityAddress: 'Av. 68 #45-67', city: 'Medellín', capacity: 80, categories: 'Casual', openingTime: '11:00', closingTime: '22:00', message: 'Auténtica comida mexicana con ingredientes frescos' },
  { restaurantName: 'Sushi Zen', contactName: 'Kenji Tanaka', email: 'kenji@sushizen.co', phone: '3204567890', cityAddress: 'Cra 11 #93-45', city: 'Bogotá', capacity: 50, categories: 'Gourmet', openingTime: '12:00', closingTime: '22:30', message: 'Sushi tradicional japonés con pescados del día' },
  { restaurantName: 'Parrilla Argentina', contactName: 'Diego Fernández', email: 'diego@parrillaarg.com', phone: '3182345678', cityAddress: 'Calle 100 #15-20', city: 'Cali', capacity: 100, categories: 'Casual', openingTime: '13:00', closingTime: '00:00', message: 'Carnes a la parrilla estilo argentino, cortes premium' },
  { restaurantName: 'Veggie Delight', contactName: 'Laura Gómez', email: 'laura@veggiedelight.co', phone: '3123456789', cityAddress: 'Av. Circunvalar #20-30', city: 'Barranquilla', capacity: 40, categories: 'Gourmet', openingTime: '08:00', closingTime: '20:00', message: 'Cocina 100% vegetal y orgánica, menú saludable' },
  { restaurantName: 'Marisquería El Puerto', contactName: 'Roberto Silva', email: 'roberto@elpuerto.com', phone: '3178901234', cityAddress: 'Carrera 5 #50-60', city: 'Cartagena', capacity: 120, categories: 'Casual', openingTime: '11:00', closingTime: '23:00', message: 'Mariscos frescos del Caribe, ceviches y arroces' },
  { restaurantName: 'Café Colonial', contactName: 'Isabel Martínez', email: 'isabel@cafecolonial.com', phone: '3145678901', cityAddress: 'Plaza Principal #5', city: 'Pereira', capacity: 30, categories: 'Gourmet', openingTime: '06:30', closingTime: '20:00', message: 'Café de especialidad y repostería artesanal' },
  { restaurantName: 'Burger House', contactName: 'Miguel Torres', email: 'miguel@burgerhouse.co', phone: '3112345678', cityAddress: 'Calle 45 #80-90', city: 'Bucaramanga', capacity: 70, categories: 'Casual', openingTime: '12:00', closingTime: '22:00', message: 'Hamburguesas artesanales con carne 100% angus' },
];

export const seedPartnersIfEmpty = async () => {
  try {
    const count = await PartnerLead.countDocuments();
    if (count === 0) {
      console.log('Seeding partner leads...');
      
      const partnersToInsert = PARTNER_TEMPLATES.map((template, index) => ({
        ...template,
        userId: `partner_user_${index.toString().padStart(3, '0')}`,
        status: ['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'][Math.floor(Math.random() * 4)]
      }));

      await PartnerLead.insertMany(partnersToInsert);
      console.log(`Successfully seeded ${partnersToInsert.length} partner leads.`);
    } else {
      console.log('Partner leads already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding partner leads:', error.message);
  }
};