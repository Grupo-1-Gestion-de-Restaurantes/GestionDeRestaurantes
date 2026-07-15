'use strict';

import Employee from '../employees/employee.model.js';
import Restaurante from '../restaurants/restaurant.model.js';

const SPECIALTIES = ['COCINERO', 'BARTENDER', 'CAMARERO', 'ADMINISTRATIVO', 'OTRO'];

const EMPLOYEE_TEMPLATES = [
  { name: 'Carlos Mendoza', specialty: 'COCINERO' },
  { name: 'Ana Patricia López', specialty: 'COCINERO' },
  { name: 'Roberto García', specialty: 'BARTENDER' },
  { name: 'María Fernanda Torres', specialty: 'BARTENDER' },
  { name: 'Jorge Andrés Ruiz', specialty: 'CAMARERO' },
  { name: 'Paula Valentina Herrera', specialty: 'CAMARERO' },
  { name: 'Diego Alejandro Vargas', specialty: 'CAMARERO' },
  { name: 'Camila Sofía Jiménez', specialty: 'CAMARERO' },
  { name: 'Fernando José Castro', specialty: 'ADMINISTRATIVO' },
  { name: 'Isabela Marcela Rojas', specialty: 'ADMINISTRATIVO' },
  { name: 'Andrés Felipe Moreno', specialty: 'OTRO' },
  { name: 'Valentina Lucía Ortiz', specialty: 'OTRO' },
];

export const seedEmployeesIfEmpty = async () => {
  try {
    const count = await Employee.countDocuments();
    if (count === 0) {
      console.log('Seeding employees...');
      const restaurants = await Restaurante.find({ isActive: true });
      
      if (restaurants.length === 0) {
        console.log('No restaurants found to seed employees for.');
        return;
      }

      const employeesToInsert = [];
      for (const restaurant of restaurants) {
        // Create 4-8 employees per restaurant
        const numEmployees = Math.floor(Math.random() * 5) + 4;
        for (let i = 0; i < numEmployees; i++) {
          const template = EMPLOYEE_TEMPLATES[i % EMPLOYEE_TEMPLATES.length];
          employeesToInsert.push({
            userId: `emp_${restaurant._id.toString().slice(-6)}_${i.toString().padStart(2, '0')}`,
            fullName: `${template.name} ${restaurant.name.split(' ')[0]}`,
            restaurant: restaurant._id,
            specialty: template.specialty,
            isActive: true
          });
        }
      }

      await Employee.insertMany(employeesToInsert);
      console.log(`Successfully seeded ${employeesToInsert.length} employees.`);
    } else {
      console.log('Employees already exist, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding employees:', error.message);
  }
};