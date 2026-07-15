'use strict';

import Restaurant from '../restaurants/restaurant.model.js';
import Dish from '../dishes/dish.model.js';
import Inventory from '../inventories/inventory.model.js';
import Table from '../table/table.model.js';
import Promotion from '../promotions/promotions.model.js';
import Event from '../events/event.model.js';
import Client from '../client/client.model.js';
import Order from '../orders/order.model.js';
import Invoice from '../invoice/invoice.model.js';
import Comment from '../comments/comment.model.js';
import Notification from '../notifications/notification.model.js';

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

const DISH_TEMPLATES = [
    // ENTRADAS
    { name: 'Nachos con Queso', description: 'Totopos bañados en queso cheddar fundido con jalapeños y crema', price: 85, dishType: 'ENTRADA', ingredients: ['Totopos', 'Queso Cheddar', 'Jalapeños', 'Crema'] },
    { name: 'Alitas BBQ', description: 'Alitas de pollo glaseadas en salsa barbacoa casera', price: 95, dishType: 'ENTRADA', ingredients: ['Pollo', 'Salsa BBQ', 'Aceite Vegetal', 'Sal'] },
    { name: 'Ensalada César', description: 'Lechuga romana, crutones, parmesano, pollo a la parrilla y aderezo césar', price: 75, dishType: 'ENTRADA', ingredients: ['Lechuga', 'Pollo', 'Queso Mozzarella', 'Pan de Hamburguesa', 'Aceite Vegetal'] },
    { name: 'Sopa de Tortilla', description: 'Caldo de tomate con tiras de tortilla, aguacate, queso y crema', price: 70, dishType: 'ENTRADA', ingredients: ['Tomate', 'Tortillas', 'Aguacate', 'Queso Cheddar', 'Crema'] },
    { name: 'Ceviche Mixto', description: 'Pescado y camarón marinado en limón con cebolla morada y cilantro', price: 120, dishType: 'ENTRADA', ingredients: ['Pescado', 'Cebolla', 'Limón', 'Cilantro'] },

    // PLATOS FUERTES
    { name: 'Hamburguesa Clásica', description: 'Carne 180g, lechuga, tomate, cebolla, queso cheddar, papas fritas', price: 110, dishType: 'PLATO_FUERTE', ingredients: ['Carne de Res', 'Pan de Hamburguesa', 'Lechuga', 'Tomate', 'Cebolla', 'Queso Cheddar', 'Papa', 'Aceite Vegetal'] },
    { name: 'Hamburguesa BBQ Bacon', description: 'Carne 180g, bacon crujiente, aros de cebolla, queso cheddar, salsa BBQ', price: 135, dishType: 'PLATO_FUERTE', ingredients: ['Carne de Res', 'Pan de Hamburguesa', 'Queso Cheddar', 'Cebolla', 'Salsa BBQ', 'Aceite Vegetal'] },
    { name: 'Pizza Pepperoni', description: 'Masa artesanal, salsa pomodoro, mozzarella, pepperoni, orégano', price: 145, dishType: 'PLATO_FUERTE', ingredients: ['Harina', 'Tomate', 'Queso Mozzarella', 'Pepperoni', 'Aceite Vegetal', 'Orégano'] },
    { name: 'Pasta Carbonara', description: 'Espagueti con salsa cremosa de huevo, panceta, parmesano y pimienta', price: 125, dishType: 'PLATO_FUERTE', ingredients: ['Harina', 'Huevo', 'Queso Mozzarella', 'Bacon', 'Pimienta', 'Aceite Vegetal'] },
    { name: 'Filete de Res', description: 'Corte fino 250g a la parrilla con papas al horno y vegetales salteados', price: 195, dishType: 'PLATO_FUERTE', ingredients: ['Carne de Res', 'Papa', 'Tomate', 'Cebolla', 'Aceite Vegetal', 'Sal', 'Pimienta'] },
    { name: 'Pollo a la Plancha', description: 'Pechuga marinada con hierbas, puré de papa y ensalada mixta', price: 115, dishType: 'PLATO_FUERTE', ingredients: ['Pollo', 'Papa', 'Lechuga', 'Tomate', 'Cebolla', 'Aceite Vegetal', 'Sal'] },
    { name: 'Salmón al Horno', description: 'Filete de salmón con costra de hierbas, arroz blanco y espárragos', price: 185, dishType: 'PLATO_FUERTE', ingredients: ['Pescado', 'Arroz', 'Aceite Vegetal', 'Sal', 'Pimienta', 'Hierbas'] },
    { name: 'Tacos al Pastor', description: '3 tacos de cerdo marinado con piña, cebolla, cilantro y salsa', price: 95, dishType: 'PLATO_FUERTE', ingredients: ['Carne de Res', 'Tortillas', 'Piña', 'Cebolla', 'Cilantro', 'Salsa'] },
    { name: 'Burrito Bowl', description: 'Arroz, frijoles negros, pollo, guacamole, pico de gallo, queso y crema', price: 120, dishType: 'PLATO_FUERTE', ingredients: ['Arroz', 'Frijoles', 'Pollo', 'Aguacate', 'Tomate', 'Cebolla', 'Queso Cheddar', 'Crema'] },

    // POSTRES
    { name: 'Brownie con Helado', description: 'Brownie tibio de chocolate, helado de vainilla, salsa de chocolate y nueces', price: 65, dishType: 'POSTRE', ingredients: ['Harina', 'Chocolate', 'Huevo', 'Mantequilla', 'Azúcar', 'Helado', 'Nueces'] },
    { name: 'Cheesecake de Fresa', description: 'Base de galleta, crema de queso, mermelada de fresa y frutos rojos', price: 70, dishType: 'POSTRE', ingredients: ['Galleta', 'Queso Mozzarella', 'Fresa', 'Mermelada', 'Frutos Rojos'] },
    { name: 'Flan Casero', description: 'Flan de huevo con caramelo líquido y coco rallado', price: 50, dishType: 'POSTRE', ingredients: ['Huevo', 'Leche', 'Azúcar', 'Caramelo', 'Coco'] },
    { name: 'Helado Artesanal', description: '3 bolas: vainilla, chocolate, fresa con toppings a elección', price: 55, dishType: 'POSTRE', ingredients: ['Leche', 'Crema', 'Vainilla', 'Chocolate', 'Fresa', 'Toppings'] },

    // BEBIDAS
    { name: 'Limonada Natural', description: 'Jugo de limón fresco, agua mineral, menta y azúcar de caña', price: 35, dishType: 'BEBIDA', ingredients: ['Limón', 'Agua Mineral', 'Menta', 'Azúcar'] },
    { name: 'Café Americano', description: 'Café de grano 100% arábica, servido caliente', price: 25, dishType: 'BEBIDA', ingredients: ['Café', 'Agua'] },
    { name: 'Cerveza Artesanal', description: 'IPA local 355ml, 6.5% alc.', price: 55, dishType: 'BEBIDA', ingredients: ['Cerveza Artesanal'] },
    { name: 'Vino Tinto Copa', description: 'Selección de la casa, copa 150ml', price: 65, dishType: 'BEBIDA', ingredients: ['Vino Tinto'] },
    { name: 'Agua Mineral', description: 'Botella 500ml con gas', price: 20, dishType: 'BEBIDA', ingredients: ['Agua Mineral'] },
    { name: 'Refresco de Cola', description: 'Lata 355ml', price: 25, dishType: 'BEBIDA', ingredients: ['Refresco'] },
    { name: 'Té Frío', description: 'Té negro con limón y miel, servido frío', price: 30, dishType: 'BEBIDA', ingredients: ['Té', 'Limón', 'Miel', 'Agua'] },
];

const TABLE_LOCATIONS = ['Terraza', 'Salón Principal', 'VIP', 'Bar', 'Jardín'];

const PROMOTION_TEMPLATES = [
    { title: '2x1 en Entradas', description: 'Pide una entrada y la segunda es gratis', discount: 50, scope: 'PEDIDOS', type: 'ENTRADA' },
    { title: 'Hamburguesa + Papas + Refresco', description: 'Combo completo con 20% descuento', discount: 20, scope: 'PEDIDOS', type: 'PLATO_FUERTE' },
    { title: 'Pizza Familiar + 2 Refrescos', description: 'Pizza grande + 2 refrescos por precio especial', discount: 15, scope: 'PEDIDOS', type: 'PLATO_FUERTE' },
    { title: 'Postre Gratis en Cumpleaños', description: 'Muestra tu INE y recibe un postre gratis', discount: 100, scope: 'PEDIDOS', type: 'POSTRE' },
    { title: 'Happy Hour 2x1 Cervezas', description: 'De 4pm a 7pm, paga 1 lleva 2 cervezas', discount: 50, scope: 'PEDIDOS', type: 'BEBIDA' },
    { title: 'Descuento Eventos Privados', description: '15% off en reservación de salón para eventos', discount: 15, scope: 'EVENTOS', type: 'EVENTO' },
    { title: 'Menú Degustación Pareja', description: 'Entrada + 2 Platos Fuertes + Postre + Botella Vino', discount: 25, scope: 'PEDIDOS', type: 'PLATO_FUERTE' },
    { title: 'Niños Comen Gratis', description: 'Domingos: 1 plato fuerte infantil gratis por cada adulto', discount: 100, scope: 'PEDIDOS', type: 'PLATO_FUERTE' },
];

const EVENT_TEMPLATES = [
    { name: 'Noche de Jazz', description: 'Disfruta de jazz en vivo con nuestro menú especial', type: 'MUSICA_EN_VIVO', capacity: 50, price: 150, daysOffset: 7 },
    { name: 'Cata de Vinos', description: 'Degustación de 5 vinos seleccionados con maridaje', type: 'CATA_VINOS', capacity: 30, price: 350, daysOffset: 14 },
    { name: 'Cena de San Valentín', description: 'Menú romántico de 4 tiempos con música ambiental', type: 'CENA_ROMANTICA', capacity: 40, price: 450, daysOffset: 21 },
    { name: 'Festival de Tacos', description: 'Barra libre de tacos al pastor, carnitas y barbacoa', type: 'FESTIVAL', capacity: 80, price: 200, daysOffset: 10 },
    { name: 'Noche de Trivia', description: 'Trivia temática con premios y bebidas 2x1', type: 'TRIVIA', capacity: 60, price: 100, daysOffset: 5 },
];

const CLIENT_TEMPLATES = [
    { name: 'María González', email: 'maria.gonzalez@email.com', phone: '5551234567', birthdate: '1990-03-15', gender: 'Femenino' },
    { name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', phone: '5552345678', birthdate: '1985-07-22', gender: 'Masculino' },
    { name: 'Ana Martínez', email: 'ana.martinez@email.com', phone: '5553456789', birthdate: '1992-11-08', gender: 'Femenino' },
    { name: 'Luis Hernández', email: 'luis.hernandez@email.com', phone: '5554567890', birthdate: '1988-01-30', gender: 'Masculino' },
    { name: 'Sofía López', email: 'sofia.lopez@email.com', phone: '5555678901', birthdate: '1995-09-12', gender: 'Femenino' },
    { name: 'Jorge Ramírez', email: 'jorge.ramirez@email.com', phone: '5556789012', birthdate: '1987-05-18', gender: 'Masculino' },
    { name: 'Carmen Torres', email: 'carmen.torres@email.com', phone: '5557890123', birthdate: '1993-12-03', gender: 'Femenino' },
    { name: 'Roberto Flores', email: 'roberto.flores@email.com', phone: '5558901234', birthdate: '1982-04-25', gender: 'Masculino' },
    { name: 'Patricia Vargas', email: 'patricia.vargas@email.com', phone: '5559012345', birthdate: '1991-08-14', gender: 'Femenino' },
    { name: 'Fernando Cruz', email: 'fernando.cruz@email.com', phone: '5550123456', birthdate: '1989-02-28', gender: 'Masculino' },
];

const DELIVERY_ALIASES = ['Casa', 'Trabajo', 'Otro', 'N/A'];

const ORDER_STATUSES = ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'LISTO_PARA_RECOGER', 'ENTREGADO', 'CANCELADO'];
const PAYMENT_METHODS = ['EFECTIVO', 'TARJETA'];
const DELIVERY_TYPES = ['DOMICILIO', 'RECOGER'];

const COMMENT_TEMPLATES = [
    { review: 5, comment: '¡Excelente comida y servicio! Volveré sin duda.' },
    { review: 4, comment: 'Muy buena la hamburguesa, las papas un poco frías pero rico todo.' },
    { review: 5, comment: 'El mejor lugar para cenar en familia. Ambiente genial.' },
    { review: 4, comment: 'Buena relación calidad-precio. El postre de brownie espectacular.' },
    { review: 3, comment: 'La comida está bien pero tardaron mucho en traer la cuenta.' },
    { review: 5, comment: 'Increíble la pizza, masa perfecta e ingredientes frescos.' },
    { review: 4, comment: 'Buen servicio, el personal muy atento. Recomendado.' },
    { review: 3, comment: 'Normal, nada del otro mundo. Precios un poco altos.' },
    { review: 5, comment: '¡Me encanta este lugar! Los tacos al pastor son los mejores.' },
    { review: 4, comment: 'Muy rico todo, el salmón estaba en su punto exacto.' },
];

export const seedRelatedData = async () => {
    try {
        console.log('--- Starting Related Data Seeding ---');

        const restaurants = await Restaurant.find({ isActive: true });
        if (restaurants.length === 0) {
            console.log('No active restaurants found. Skipping related data seeding.');
            return;
        }

        for (const restaurant of restaurants) {
            console.log(`\n--- Seeding data for: ${restaurant.name} (${restaurant._id}) ---`);

            // 1. INVENTORY
            console.log('  Seeding Inventory...');
            const inventoryItems = [];
            for (const template of INVENTORY_TEMPLATES) {
                const item = await Inventory.findOneAndUpdate(
                    { restaurant: restaurant._id, name: template.name },
                    { ...template, restaurant: restaurant._id, isActive: true },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                inventoryItems.push(item);
            }
            console.log(`    Created/Updated ${inventoryItems.length} inventory items`);

            // Helper to find inventory item by name
            const findInv = (name) => inventoryItems.find(i => i.name === name);

            // 2. DISHES
            console.log('  Seeding Dishes...');
            const dishes = [];
            for (const template of DISH_TEMPLATES) {
                // Build ingredients array referencing inventory
                const ingredients = template.ingredients
                    .map(ingName => {
                        const inv = findInv(ingName);
                        if (!inv) return null;
                        return {
                            inventoryItem: inv._id,
                            quantityUsed: Math.round((Math.random() * 2 + 0.1) * 100) / 100
                        };
                    })
                    .filter(Boolean);

                // Generate unique name per restaurant to avoid unique constraint issues
                const uniqueName = `${template.name} - ${restaurant.name}`;

                const dish = await Dish.findOneAndUpdate(
                    { restaurant: restaurant._id, name: uniqueName },
                    {
                        name: uniqueName,
                        description: template.description,
                        price: template.price,
                        dishType: template.dishType,
                        ingredients,
                        restaurant: restaurant._id,
                        photo: 'https://res.cloudinary.com/degzwfdz3/image/upload/v1771700198/no-photo_orrdvt.avif',
                        isActive: true
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                dishes.push(dish);
            }
            console.log(`    Created/Updated ${dishes.length} dishes`);

            // 3. TABLES
            console.log('  Seeding Tables...');
            const tables = [];
            for (let i = 1; i <= 10; i++) {
                const tableNum = `T-${i.toString().padStart(2, '0')}`;
                const table = await Table.findOneAndUpdate(
                    { restaurant: restaurant._id, tableNumber: tableNum },
                    {
                        restaurant: restaurant._id,
                        tableNumber: tableNum,
                        capacity: Math.floor(Math.random() * 6) + 2, // 2-8
                        location: TABLE_LOCATIONS[Math.floor(Math.random() * TABLE_LOCATIONS.length)],
                        tableAvailability: true,
                        isActive: true,
                        availability: [
                            { day: 'Lunes', startTime: '12:00', endTime: '22:00' },
                            { day: 'Martes', startTime: '12:00', endTime: '22:00' },
                            { day: 'Miércoles', startTime: '12:00', endTime: '22:00' },
                            { day: 'Jueves', startTime: '12:00', endTime: '22:00' },
                            { day: 'Viernes', startTime: '12:00', endTime: '23:00' },
                            { day: 'Sábado', startTime: '13:00', endTime: '23:00' },
                            { day: 'Domingo', startTime: '13:00', endTime: '21:00' }
                        ]
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                tables.push(table);
            }
            console.log(`    Created/Updated ${tables.length} tables`);

            // 4. PROMOTIONS
            console.log('  Seeding Promotions...');
            const dishIds = dishes.map(d => d._id);
            const promotions = [];
            for (let i = 0; i < PROMOTION_TEMPLATES.length; i++) {
                const t = PROMOTION_TEMPLATES[i];
                const promo = await Promotion.findOneAndUpdate(
                    { restaurant: restaurant._id, title: t.title },
                    {
                        title: t.title,
                        description: t.description,
                        discountPercentage: t.discount,
                        restaurant: restaurant._id,
                        dishesApplicables: dishIds.slice(0, 3),
                        scope: t.scope,
                        startDate: new Date(),
                        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
                        status: 'APPROVED',
                        isOneTimeUse: false,
                        isActive: true
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                promotions.push(promo);
            }
            console.log(`    Created/Updated ${promotions.length} promotions`);

            // 5. EVENTS
            console.log('  Seeding Events...');
            const events = [];
            for (const t of EVENT_TEMPLATES) {
                const eventDate = new Date();
                eventDate.setDate(eventDate.getDate() + t.daysOffset);
                eventDate.setHours(19, 0, 0, 0);

                const event = await Event.findOneAndUpdate(
                    { restaurant: restaurant._id, name: t.name },
                    {
                        name: t.name,
                        description: t.description,
                        typeEvent: t.type,
                        dateTime: eventDate,
                        restaurant: restaurant._id,
                        capacity: t.capacity,
                        price: t.price,
                        additionalServices: [],
                        assignedTables: tables.slice(0, 3).map(t => t._id),
                        specialDishes: dishIds.slice(0, 3),
                        assignedEmployees: [],
                        isActive: true
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                events.push(event);
            }
            console.log(`    Created/Updated ${events.length} events`);

            // 6. CLIENTS
            console.log('  Seeding Clients...');
            const clients = [];
            for (let i = 0; i < CLIENT_TEMPLATES.length; i++) {
                const t = CLIENT_TEMPLATES[i];
                const clientId = `client_${restaurant._id.toString().slice(-6)}_${i.toString().padStart(2, '0')}`;

                const client = await Client.findOneAndUpdate(
                    { _id: clientId },
                    {
                        _id: clientId,
                        name: t.name,
                        email: t.email,
                        phone: t.phone,
                        birthdate: new Date(t.birthdate),
                        gender: t.gender,
                        addresses: [
                            {
                                alias: 'Casa',
                                addressLine: `Calle ${Math.floor(Math.random() * 100) + 1} #${Math.floor(Math.random() * 500) + 1}`,
                                houseNumber: `${Math.floor(Math.random() * 100) + 1}`,
                                reference: 'Entre calles principales',
                                isDefault: true
                            }
                        ],
                        isActive: true
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                clients.push(client);
            }
            console.log(`    Created/Updated ${clients.length} clients`);

            // 7. ORDERS
            console.log('  Seeding Orders...');
            const orders = [];
            for (let i = 0; i < 15; i++) {
                const client = clients[Math.floor(Math.random() * clients.length)];
                const orderDishes = dishes
                    .sort(() => 0.5 - Math.random())
                    .slice(0, Math.floor(Math.random() * 4) + 1); // 1-4 items

                const items = orderDishes.map(d => ({
                    productId: d._id,
                    name: d.name,
                    price: d.price,
                    quantity: Math.floor(Math.random() * 3) + 1,
                    subtotal: d.price * (Math.floor(Math.random() * 3) + 1)
                }));

                const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
                const status = ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)];
                const deliveryType = DELIVERY_TYPES[Math.floor(Math.random() * DELIVERY_TYPES.length)];
                const paymentMethod = PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)];

                const order = await Order.findOneAndUpdate(
                    { restaurant: restaurant._id, client: client._id, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
                    {
                        client: client._id,
                        restaurant: restaurant._id,
                        deliveryType,
                        items,
                        total: subtotal,
                        deliveryAddress: {
                            alias: DELIVERY_ALIASES[Math.floor(Math.random() * DELIVERY_ALIASES.length)],
                            addressLine: client.addresses[0]?.addressLine || 'Dirección por defecto',
                            houseNumber: client.addresses[0]?.houseNumber || '123',
                            reference: client.addresses[0]?.reference || 'Sin referencia'
                        },
                        status,
                        paymentMethod,
                        isActive: true
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                orders.push(order);
            }
            console.log(`    Created/Updated ${orders.length} orders`);

            // 8. INVOICES
            console.log('  Seeding Invoices...');
            const invoices = [];
            for (let i = 0; i < orders.length; i++) {
                const order = orders[i];
                if (!order) continue;

                const invoiceNumber = `INV-${restaurant._id.toString().slice(-6)}-${Date.now().toString().slice(-6)}-${i.toString().padStart(3, '0')}`;

                const invoice = await Invoice.findOneAndUpdate(
                    { invoiceNumber },
                    {
                        invoiceNumber,
                        order: order._id,
                        client: order.client,
                        clientName: clients.find(c => c._id === order.client)?.name || 'Cliente',
                        restaurant: restaurant._id,
                        restaurantName: restaurant.name,
                        items: order.items.map(item => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                            subtotal: item.subtotal
                        })),
                        total: order.total,
                        paymentMethod: order.paymentMethod,
                        issuedAt: order.createdAt
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                invoices.push(invoice);
            }
            console.log(`    Created/Updated ${invoices.length} invoices`);

            // 9. COMMENTS
            console.log('  Seeding Comments...');
            const comments = [];
            for (let i = 0; i < 12; i++) {
                const client = clients[Math.floor(Math.random() * clients.length)];
                const dish = dishes[Math.floor(Math.random() * dishes.length)];
                const t = COMMENT_TEMPLATES[Math.floor(Math.random() * COMMENT_TEMPLATES.length)];

                const comment = await Comment.findOneAndUpdate(
                    { clientId: client._id, dishId: dish._id, restaurantId: restaurant._id },
                    {
                        review: t.review,
                        comment: t.comment,
                        restaurantId: restaurant._id,
                        dishId: dish._id,
                        clientId: client._id,
                        isActive: true
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                comments.push(comment);
            }
            console.log(`    Created/Updated ${comments.length} comments`);

            // 10. NOTIFICATIONS
            console.log('  Seeding Notifications...');
            const notifications = [];
            const notificationTypes = [
                { type: 'PEDIDO_RECIBIDO', title: 'Pedido Recibido', message: 'Tu pedido ha sido recibido y está pendiente de confirmación' },
                { type: 'PEDIDO_CONFIRMADO', title: 'Pedido Confirmado', message: 'Tu pedido ha sido confirmado y está en preparación' },
                { type: 'PEDIDO_EN_PREPARACION', title: 'Pedido en Preparación', message: 'Tu pedido está siendo preparado en la cocina' },
                { type: 'PEDIDO_LISTO', title: 'Pedido Listo', message: 'Tu pedido está listo para recoger/entregar' },
                { type: 'PEDIDO_ENTREGADO', title: 'Pedido Entregado', message: 'Tu pedido ha sido entregado exitosamente' },
                { type: 'RESERVACION_RECIBIDA', title: 'Reservación Recibida', message: 'Tu reservación ha sido registrada y está pendiente de confirmación' },
                { type: 'RESERVACION_CONFIRMADA', title: 'Reservación Confirmada', message: 'Tu reservación ha sido confirmada. ¡Te esperamos!' }
            ];

            for (let i = 0; i < 20; i++) {
                const order = orders[Math.floor(Math.random() * orders.length)];
                const client = clients.find(c => c._id === order?.client);
                const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];

                const notification = await Notification.findOneAndUpdate(
                    { referenceId: order?._id, type: type.type },
                    {
                        recipient: client?._id || 'system',
                        type: type.type,
                        title: type.title,
                        message: type.message,
                        referenceId: order?._id,
                        referenceType: 'Order',
                        isRead: Math.random() > 0.5
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
                notifications.push(notification);
            }
            console.log(`    Created/Updated ${notifications.length} notifications`);

            console.log(`\n✅ Completed seeding for ${restaurant.name}`);
        }

        console.log('\n--- All Related Data Seeding Completed ---');
    } catch (error) {
        console.error('Error during related data seeding:', error);
        throw error;
    }
};