'use strict';

import Comment from '../comments/comment.model.js';
import Client from '../client/client.model.js';
import Dish from '../dishes/dish.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

const COMMENT_TEMPLATES = [
  { review: 5, comment: '¡Excelente comida y servicio! Volveré sin duda.' },
  { review: 4, comment: 'Muy buena la hamburguesa, las papas un poco frías pero rico todo.' },
  { review: 5, comment: 'El mejor lugar para cenar en familia. Ambiente genial.' },
  { review: 4, comment: 'Buena relación calidad-precio. El postre de brownie espectacular.' },
  { review: 3, comment: 'La comida está bien pero tardaron mucho en traer la cuenta.' },
  { review: 5, comment: '¡Increíble la pizza, masa perfecta e ingredientes frescos!' },
  { review: 4, comment: 'Buen servicio, el personal muy atento. Recomendado.' },
  { review: 3, comment: 'Normal, nada del otro mundo. Precios un poco altos.' },
  { review: 5, comment: '¡Me encanta este lugar! Los tacos al pastor son los mejores.' },
  { review: 4, comment: 'Muy rico todo, el salmón estaba en su punto exacto.' },
  { review: 5, comment: 'Mejor restaurante de la zona. El risotto de setas brutal.' },
  { review: 4, comment: 'Bien, pero la espera fue larga. La comida compensó.' },
  { review: 5, comment: 'Experiencia increíble, el chef salió a saludar. Volveremos.' },
  { review: 3, comment: 'La comida buena pero el local muy ruidoso.' },
  { review: 4, comment: 'Muy recomendable para ir con amigos. Las alitas riquísimas.' },
];

export const seedCommentsIfEmpty = async () => {
  try {
    const count = await Comment.countDocuments();
    if (count === 0) {
      console.log('Seeding comments...');
      
      const clients = await Client.find({ isActive: true });
      const dishes = await Dish.find({ isActive: true });
      const restaurants = await Restaurante.find({ isActive: true });
      
      if (clients.length === 0 || dishes.length === 0 || restaurants.length === 0) {
        console.log('Missing required data (clients, dishes, or restaurants). Skipping comments seed.');
        return;
      }

      const commentsToInsert = [];
      for (let i = 0; i < COMMENT_TEMPLATES.length; i++) {
        const template = COMMENT_TEMPLATES[i];
        const client = clients[i % clients.length];
        const dish = dishes[i % dishes.length];
        const restaurant = restaurants[i % restaurants.length];
        
        commentsToInsert.push({
          review: template.review,
          comment: template.comment,
          restaurantId: restaurant._id,
          dishId: dish._id,
          clientId: client._id,
          isActive: true
        });
      }

      await Comment.insertMany(commentsToInsert);
      console.log(`Successfully seeded ${commentsToInsert.length} comments.`);
    } else {
      console.log('Comments already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding comments:', error.message);
  }
};