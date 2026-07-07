'use strict';

import Client from '../client/client.model.js';

const CLIENT_TEMPLATES = [
  { name: 'María González', email: 'maria.gonzalez@email.com', phone: '5551234567', birthdate: '1990-03-15', gender: 'Femenino', address: 'Calle 10 #45-67', houseNumber: '45', reference: 'Frente al parque' },
  { name: 'Carlos Rodríguez', email: 'carlos.rodriguez@email.com', phone: '5552345678', birthdate: '1985-07-22', gender: 'Masculino', address: 'Av. Principal #123', houseNumber: '123', reference: 'Esquina con calle 5' },
  { name: 'Ana Martínez', email: 'ana.martinez@email.com', phone: '5553456789', birthdate: '1992-11-08', gender: 'Femenino', address: 'Calle 20 #12-34', houseNumber: '12', reference: 'Edificio azul' },
  { name: 'Luis Hernández', email: 'luis.hernandez@email.com', phone: '5554567890', birthdate: '1988-01-30', gender: 'Masculino', address: 'Boulevard Central #567', houseNumber: '567', reference: 'Local comercial' },
  { name: 'Sofía López', email: 'sofia.lopez@email.com', phone: '5555678901', birthdate: '1995-09-12', gender: 'Femenino', address: 'Carrera 15 #89-10', houseNumber: '89', reference: 'Casa blanca con portón negro' },
  { name: 'Jorge Ramírez', email: 'jorge.ramirez@email.com', phone: '5556789012', birthdate: '1987-05-18', gender: 'Masculino', address: 'Av. Los Andes #234', houseNumber: '234', reference: 'Frente a la estación de metro' },
  { name: 'Carmen Torres', email: 'carmen.torres@email.com', phone: '5557890123', birthdate: '1993-12-03', gender: 'Femenino', address: 'Calle 45 #10-20', houseNumber: '10', reference: 'Parqueadero visitante' },
  { name: 'Roberto Flores', email: 'roberto.flores@email.com', phone: '5558901234', birthdate: '1982-04-25', gender: 'Masculino', address: 'Diagonal 30 #5-15', houseNumber: '5', reference: 'Edificio torre norte' },
  { name: 'Patricia Vargas', email: 'patricia.vargas@email.com', phone: '5559012345', birthdate: '1991-08-14', gender: 'Femenino', address: 'Transversal 8 #100-200', houseNumber: '100', reference: 'Centro comercial' },
  { name: 'Fernando Cruz', email: 'fernando.cruz@email.com', phone: '5550123456', birthdate: '1989-02-28', gender: 'Masculino', address: 'Calle 72 #30-40', houseNumber: '30', reference: 'Zona residencial' },
  { name: 'Isabel Mendoza', email: 'isabel.mendoza@email.com', phone: '5551122334', birthdate: '1994-06-17', gender: 'Femenino', address: 'Av. Caracas #67-89', houseNumber: '67', reference: 'Edificio empresarial' },
  { name: 'Diego Herrera', email: 'diego.herrera@email.com', phone: '5552233445', birthdate: '1986-10-09', gender: 'Masculino', address: 'Calle 100 #15-25', houseNumber: '15', reference: 'Frente a universidad' },
  { name: 'Valentina Ríos', email: 'valentina.rios@email.com', phone: '5553344556', birthdate: '1996-12-01', gender: 'Femenino', address: 'Av. Boyacá #45-60', houseNumber: '45', reference: 'Conjunto cerrado' },
  { name: 'Andrés Peña', email: 'andres.pena@email.com', phone: '5554455667', birthdate: '1984-03-20', gender: 'Masculino', address: 'Calle 150 #8-18', houseNumber: '8', reference: 'Casa esquina' },
  { name: 'Camila Soto', email: 'camila.soto@email.com', phone: '5555566778', birthdate: '1997-09-28', gender: 'Femenino', address: 'Carrera 30 #20-30', houseNumber: '20', reference: 'Local 2do piso' },
];

export const seedClientsIfEmpty = async () => {
  try {
    const count = await Client.countDocuments();
    if (count === 0) {
      console.log('Seeding clients...');
      
      const clientsToInsert = CLIENT_TEMPLATES.map((template, index) => ({
        _id: `seed_client_${index.toString().padStart(3, '0')}`,
        ...template,
        birthdate: new Date(template.birthdate),
        addresses: [{
          alias: 'Casa',
          addressLine: template.address,
          houseNumber: template.houseNumber,
          reference: template.reference,
          isDefault: true
        }],
        isActive: true
      }));

      await Client.insertMany(clientsToInsert);
      console.log(`Successfully seeded ${clientsToInsert.length} clients.`);
    } else {
      console.log('Clients already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding clients:', error.message);
  }
};