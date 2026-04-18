import dotenv from 'dotenv';
dotenv.config();

export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Sistema de Gestión de Restaurantes - API REST',
        version: '1.0.0',
        description: `
## Descripción General

Esta es la documentación oficial de la API REST para el **Sistema de Gestión de Restaurantes** desarrollado por el Grupo 1. El sistema proporciona una solución integral para la administración completa de restaurantes, cubriendo todos los aspectos operativos desde la gestión de mesas y reservaciones hasta la facturación y reportes.

## Módulos Disponibles

La API está organizada en los siguientes módulos:

| Módulo | Descripción |
|--------|-------------|
| Restaurantes | Gestión de sucursales, configuración y parámetros operativos |
| Mesas | Administración de mesas, capacidad y disponibilidad |
| Clientes | Perfiles de clientes, direcciones e historial |
| Reservaciones | Sistema de reservaciones con validación de disponibilidad |
| Platillos | Menú digital con categorías, precios e imágenes |
| Empleados | Gestión de personal por especialidades y roles |
| Eventos | Programación de eventos especiales y capacidades |
| Órdenes | Sistema de pedidos para mesa y domicilio |
| Facturación | Generación y consulta de facturas electrónicas |
| Promociones | Descuentos y ofertas promocionales |
| Inventarios | Control de insumos y alertas de stock |
| Comentarios | Reseñas y calificaciones de clientes |
| Notificaciones | Sistema de notificaciones en tiempo real |
| Reportes | Estadísticas y métricas del negocio |

## Autenticación

Todos los endpoints requieren autenticación mediante **token JWT** proporcionado por el AuthService de .NET. El token debe enviarse en el header Authorization con el formato:

\`\`\`
Authorization: Bearer <tu_token_jwt>
\`\`\`

## Tecnologías

- **Backend:** Node.js con Express
- **Base de Datos:** MongoDB con Mongoose
- **Autenticación:** JWT vía AuthService externo (.NET)
- **Almacenamiento de Imágenes:** Cloudinary
        `
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT || 3000}/gestionDeRestaurantes/v1`,
            description: 'Ruta base del servidor local'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Ingresa el token JWT proporcionado por el AuthService de .NET'
            }
        },
        schemas: {
            // ==========================================
            // MODELOS
            // ==========================================
            Restaurant: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    name: { type: 'string', example: 'Restaurante El Gourmet' },
                    address: { type: 'string', example: 'Calle Real 4-55, Zona 10' },
                    categories: { type: 'string', enum: ['Gourmet', 'Casual'], example: 'Gourmet' },
                    description: { type: 'string', example: 'Especialidad en comida internacional.' },
                    openingTime: { type: 'string', example: '09:00' },
                    closingTime: { type: 'string', example: '22:00' },
                    averagePrice: { type: 'number', example: 150 },
                    phone: { type: 'string', example: '22334455' },
                    photo: { type: 'string', example: 'https://cloudinary.com/photo.jpg' },
                    status: { type: 'string', enum: ['Abierto', 'Cerrado', 'En Mantenimiento'], example: 'Abierto' },
                    isActive: { type: 'boolean', example: true },
                    rating: { type: 'number', minimum: 1, maximum: 5, example: 4.5 },
                    capacity: { type: 'number', example: 100 },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Table: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    tableNumber: { type: 'string', example: '10' },
                    capacity: { type: 'number', minimum: 1, maximum: 20, example: 4 },
                    location: { type: 'string', enum: ['Terraza', 'Salón Principal', 'VIP', 'Bar', 'Jardín'], example: 'Salón Principal' },
                    availability: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                day: { type: 'string', enum: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'] },
                                startTime: { type: 'string', example: '09:00' },
                                endTime: { type: 'string', example: '22:00' }
                            }
                        }
                    },
                    tableAvailability: { type: 'boolean', example: true },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Client: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    name: { type: 'string', example: 'Juan Pérez' },
                    email: { type: 'string', example: 'juan@correo.com' },
                    phone: { type: 'string', example: '55443322' },
                    birthdate: { type: 'string', format: 'date', example: '1990-01-15' },
                    gender: { type: 'string', enum: ['Masculino', 'Femenino', 'Otro'], example: 'Masculino' },
                    addresses: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                alias: { type: 'string', enum: ['Casa', 'Trabajo', 'Otro'], example: 'Casa' },
                                addressLine: { type: 'string', example: 'Avenida Siempre Viva 123' },
                                houseNumber: { type: 'string', example: '123' },
                                securityInfo: { type: 'string', example: 'Casa blanca con puerta verde' },
                                reference: { type: 'string', example: 'Frente al parque' },
                                isDefault: { type: 'boolean', example: true }
                            }
                        }
                    },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Reservation: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    client: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    table: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    reservationDate: { type: 'string', format: 'date-time', example: '2026-10-15T19:30:00Z' },
                    numberOfPeople: { type: 'number', example: 4 },
                    status: { type: 'string', enum: ['PENDIENTE', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO'], example: 'PENDIENTE' },
                    durationInMinutes: { type: 'number', example: 90 },
                    specialRequests: { type: 'string', example: 'Mesa cerca de la ventana' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Dish: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    name: { type: 'string', example: 'Pizza Margherita' },
                    description: { type: 'string', example: 'Tomate, mozzarella fresca y albahaca.' },
                    price: { type: 'number', example: 85.00 },
                    dishType: { type: 'string', enum: ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA'], example: 'PLATO_FUERTE' },
                    ingredients: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                inventoryItem: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                                quantityUsed: { type: 'number', example: 200 }
                            }
                        }
                    },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    photo: { type: 'string', example: 'https://cloudinary.com/dish.jpg' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Employee: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    userId: { type: 'string', example: 'auth0|123456' },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    specialty: { type: 'string', enum: ['COCINERO', 'BARTENDER', 'CAMARERO', 'ADMINISTRATIVO', 'OTRO'], example: 'CAMARERO' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Event: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    name: { type: 'string', example: 'Noche de Jazz' },
                    description: { type: 'string', example: 'Música en vivo y menú especial de mariscos.' },
                    typeEvent: { type: 'string', enum: ['CENA_TEMATICA', 'DEGUSTACION', 'FESTIVAL', 'OTRO'], example: 'CENA_TEMATICA' },
                    capacity: { type: 'number', example: 50 },
                    price: { type: 'number', example: 250 },
                    attendees: {
                        type: 'array',
                        items: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' }
                    },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    assignedTables: {
                        type: 'array',
                        items: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' }
                    },
                    specialDishes: {
                        type: 'array',
                        items: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' }
                    },
                    assignedEmployees: {
                        type: 'array',
                        items: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' }
                    },
                    additionalServices: {
                        type: 'array',
                        items: { type: 'string', enum: ['MUSICA_EN_VIVO', 'DECORACION_ESPECIAL', 'FOTOGRAFIA', 'OTRO'] }
                    },
                    dateTime: { type: 'string', format: 'date-time', example: '2026-12-24T20:00:00Z' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Order: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    client: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    deliveryType: { type: 'string', enum: ['DOMICILIO', 'RECOGER'], example: 'DOMICILIO' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                productId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                                name: { type: 'string', example: 'Pizza Margherita' },
                                price: { type: 'number', example: 85.00 },
                                quantity: { type: 'number', example: 2 },
                                subtotal: { type: 'number', example: 170.00 }
                            }
                        }
                    },
                    total: { type: 'number', example: 170.00 },
                    deliveryAddress: {
                        type: 'object',
                        properties: {
                            alias: { type: 'string', enum: ['Casa', 'Trabajo', 'Otro', 'N/A'], example: 'Casa' },
                            addressLine: { type: 'string', example: 'Avenida Siempre Viva 123' },
                            houseNumber: { type: 'string', example: '123' },
                            securityInfo: { type: 'string', example: 'Casa blanca' },
                            reference: { type: 'string', example: 'Frente al parque' }
                        }
                    },
                    status: { type: 'string', enum: ['PENDIENTE', 'CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'LISTO_PARA_RECOGER', 'ENTREGADO', 'CANCELADO'], example: 'PENDIENTE' },
                    paymentMethod: { type: 'string', enum: ['EFECTIVO', 'TARJETA'], example: 'TARJETA' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Invoice: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    invoiceNumber: { type: 'string', example: 'FAC-2024-001' },
                    order: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    client: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    clientName: { type: 'string', example: 'Juan Pérez' },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    restaurantName: { type: 'string', example: 'Restaurante El Gourmet' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string', example: 'Pizza Margherita' },
                                quantity: { type: 'number', example: 2 },
                                price: { type: 'number', example: 85.00 },
                                subtotal: { type: 'number', example: 170.00 }
                            }
                        }
                    },
                    total: { type: 'number', example: 170.00 },
                    paymentMethod: { type: 'string', example: 'TARJETA' },
                    issuedAt: { type: 'string', format: 'date-time' }
                }
            },
            Promotion: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    title: { type: 'string', example: 'Summer Deal 2024' },
                    description: { type: 'string', example: '2x1 en bebidas nacionales de lunes a viernes.' },
                    discountPercentage: { type: 'number', minimum: 0, maximum: 100, example: 50 },
                    dishesApplicables: {
                        type: 'array',
                        items: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' }
                    },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    scope: { type: 'string', enum: ['EVENTOS', 'PEDIDOS', 'GENERAL'], example: 'GENERAL' },
                    startDate: { type: 'string', format: 'date', example: '2026-06-01' },
                    endDate: { type: 'string', format: 'date', example: '2026-08-31' },
                    status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED'], example: 'PENDING' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Inventory: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    name: { type: 'string', example: 'Harina de Trigo' },
                    quantity: { type: 'number', example: 50 },
                    unit: { type: 'string', enum: ['KG', 'LITRO', 'UNIDAD', 'GRAMO', 'MILILITRO'], example: 'KG' },
                    minStock: { type: 'number', minimum: 1, example: 10 },
                    restaurant: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Comment: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    review: { type: 'number', minimum: 1, maximum: 5, example: 5 },
                    comment: { type: 'string', example: 'Excelente servicio y comida.' },
                    restaurantId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    dishId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    isActive: { type: 'boolean', example: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            Notification: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    recipient: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    type: {
                        type: 'string',
                        enum: [
                            'RESERVACION_RECIBIDA',
                            'RESERVACION_CONFIRMADA',
                            'RESERVACION_CANCELADA',
                            'RESERVACION_COMPLETADA',
                            'RESERVACION_NO_ASISTIO',
                            'PEDIDO_RECIBIDO',
                            'PEDIDO_CONFIRMADO',
                            'PEDIDO_EN_PREPARACION',
                            'PEDIDO_LISTO',
                            'PEDIDO_ENTREGADO',
                            'PEDIDO_CANCELADO'
                        ],
                        example: 'RESERVACION_CONFIRMADA'
                    },
                    title: { type: 'string', example: 'Reservación Confirmada' },
                    message: { type: 'string', example: 'Tu reservación ha sido confirmada para el 15 de octubre' },
                    referenceId: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                    referenceType: { type: 'string', enum: ['Reservation', 'Order'], example: 'Reservation' },
                    isRead: { type: 'boolean', example: false },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        // ==========================================
        // 1. RESTAURANTES
        // ==========================================
        '/restaurants/create': {
            post: {
                tags: ['Restaurantes'],
                summary: 'Registrar una nueva sucursal',
                description: 'Crea un nuevo restaurante en el sistema. Incluye la subida de una imagen representativa.',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['name', 'address', 'phone'],
                                properties: {
                                    name: { type: 'string', example: 'Restaurante El Gourmet' },
                                    address: { type: 'string', example: 'Calle Real 4-55, Zona 10' },
                                    phone: { type: 'string', example: '22334455' },
                                    description: { type: 'string', example: 'Especialidad en comida internacional.' },
                                    image: { type: 'string', format: 'binary', description: 'Imagen de la fachada o logo' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Restaurante creado exitosamente.' },
                    400: { description: 'Error en la validación de los datos o en la carga de imagen.' }
                }
            }
        },
        '/restaurants/get': {
            get: {
                tags: ['Restaurantes'],
                summary: 'Listar todos los restaurantes',
                description: 'Obtiene el listado general de sucursales activas en el sistema.',
                responses: {
                    200: { description: 'Lista de restaurantes obtenida.' }
                }
            }
        },
        '/restaurants/{id}': {
            get: {
                tags: ['Restaurantes'],
                summary: 'Obtener detalle de restaurante por ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles de la sucursal obtenidos.' },
                    404: { description: 'Restaurante no encontrado.' }
                }
            },
            put: {
                tags: ['Restaurantes'],
                summary: 'Actualizar restaurante',
                description: 'Permite modificar los datos generales y la imagen de una sucursal existente.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    address: { type: 'string' },
                                    phone: { type: 'string' },
                                    image: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Restaurante actualizado correctamente.' }
                }
            },
            delete: {
                tags: ['Restaurantes'],
                summary: 'Cambiar estado del restaurante',
                description: 'Realiza una baja lógica o reactivación de la sucursal.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Estado del restaurante modificado exitosamente.' }
                }
            }
        },
        '/restaurants/{id}/activity': {
            get: {
                tags: ['Restaurantes'],
                summary: 'Reporte de actividad de la sucursal',
                description: 'Obtiene métricas de ocupación, pedidos realizados y flujo operativo del restaurante.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Reporte de actividad generado.' }
                }
            }
        },
        '/restaurants/{id}/clients': {
            get: {
                tags: ['Restaurantes'],
                summary: 'Reporte de clientes de la sucursal',
                description: 'Obtiene datos sobre los clientes que han visitado o realizado pedidos en esta sucursal específica.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Datos de clientes obtenidos correctamente.' }
                }
            }
        },
        // ==========================================
        // 2. MESAS
        // ==========================================
        '/tables/get': {
            get: {
                tags: ['Mesas'],
                summary: 'Listar todas las mesas',
                description: 'Obtiene el listado completo de mesas registradas en el sistema.',
                responses: {
                    200: { description: 'Lista de mesas obtenida exitosamente.' }
                }
            }
        },
        '/tables/create': {
            post: {
                tags: ['Mesas'],
                summary: 'Crear una nueva mesa',
                description: 'Registra una mesa y la asigna a una sucursal específica.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['restaurantId', 'capacity', 'tableNumber'],
                                properties: {
                                    restaurantId: { type: 'string', example: 'ID_DEL_RESTAURANTE' },
                                    capacity: { type: 'number', example: 4 },
                                    tableNumber: { type: 'number', example: 10 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Mesa creada y asignada.' },
                    400: { description: 'Error en la validación de datos.' }
                }
            }
        },
        '/tables/restaurant/{restaurantId}': {
            get: {
                tags: ['Mesas'],
                summary: 'Listar mesas por restaurante',
                description: 'Filtra y devuelve todas las mesas pertenecientes a una sucursal específica.',
                parameters: [
                    {
                        name: 'restaurantId',
                        in: 'path',
                        required: true,
                        description: 'ID de la sucursal',
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Mesas de la sucursal obtenidas.' },
                    404: { description: 'Restaurante no encontrado.' }
                }
            }
        },
        '/tables/{id}': {
            get: {
                tags: ['Mesas'],
                summary: 'Obtener detalle de mesa',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles de la mesa obtenidos.' },
                    404: { description: 'Mesa no encontrada.' }
                }
            },
            put: {
                tags: ['Mesas'],
                summary: 'Actualizar mesa',
                description: 'Permite modificar la capacidad o el número de una mesa existente.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    capacity: { type: 'number' },
                                    tableNumber: { type: 'number' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Mesa actualizada correctamente.' }
                }
            }
        },
        '/tables/{id}/activate': {
            put: {
                tags: ['Mesas'],
                summary: 'Activar mesa',
                description: 'Habilita la mesa para ser utilizada en el sistema.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Mesa activada.' }
                }
            }
        },
        '/tables/{id}/deactivate': {
            put: {
                tags: ['Mesas'],
                summary: 'Desactivar mesa',
                description: 'Inhabilita la mesa (Baja lógica).',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Mesa desactivada.' }
                }
            }
        },
        '/tables/{id}/availability': {
            put: {
                tags: ['Mesas'],
                summary: 'Cambiar disponibilidad (Ocupar/Liberar)',
                description: 'Actualiza el estado de disponibilidad actual de la mesa.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['tableAvailability'],
                                properties: {
                                    tableAvailability: {
                                        type: 'boolean',
                                        example: false,
                                        description: 'true para Libre, false para Ocupada'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Disponibilidad actualizada.' }
                }
            }
        },

        // ==========================================
        // 3. CLIENTES
        // ==========================================
        '/clients/create': {
            post: {
                tags: ['Clientes'],
                summary: 'Registrar un nuevo cliente',
                description: 'Crea un perfil de cliente en el sistema para gestionar sus pedidos y facturación.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'email', 'nit'],
                                properties: {
                                    name: { type: 'string', example: 'Consumidor Final' },
                                    email: { type: 'string', example: 'cliente@correo.com' },
                                    nit: { type: 'string', example: '1234567-8' },
                                    phone: { type: 'string', example: '55443322' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Cliente registrado exitosamente.' },
                    400: { description: 'Error en la validación de los datos.' }
                }
            }
        },
        '/clients/get': {
            get: {
                tags: ['Clientes'],
                summary: 'Listar todos los clientes',
                description: 'Obtiene el listado general de clientes registrados en el sistema.',
                responses: {
                    200: { description: 'Lista de clientes obtenida.' }
                }
            }
        },
        '/clients/myInfo': {
            get: {
                tags: ['Clientes'],
                summary: 'Obtener mi información de perfil',
                description: 'Recupera los datos del cliente asociado al token JWT actual.',
                responses: {
                    200: { description: 'Información de perfil obtenida.' },
                    401: { description: 'No autorizado.' }
                }
            }
        },
        '/clients/update': {
            put: {
                tags: ['Clientes'],
                summary: 'Actualizar mis datos',
                description: 'Permite al cliente logueado actualizar su información de contacto.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    phone: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Datos actualizados correctamente.' }
                }
            }
        },
        '/clients/addAddress': {
            put: {
                tags: ['Clientes'],
                summary: 'Agregar dirección de entrega',
                description: 'Registra una nueva dirección en el perfil del cliente para servicios a domicilio.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['address'],
                                properties: {
                                    address: { type: 'string', example: 'Avenida Siempre Viva 123, Zona 10' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Dirección agregada exitosamente.' }
                }
            }
        },
        '/clients/{id}': {
            get: {
                tags: ['Clientes'],
                summary: 'Obtener cliente por ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles del cliente obtenidos.' },
                    404: { description: 'Cliente no encontrado.' }
                }
            }
        },
        '/clients/{id}/activate': {
            put: {
                tags: ['Clientes'],
                summary: 'Activar cuenta de cliente',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Cliente activado.' }
                }
            }
        },
        '/clients/{id}/deactivate': {
            put: {
                tags: ['Clientes'],
                summary: 'Desactivar cuenta de cliente',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Cliente desactivado.' }
                }
            }
        },

        // ==========================================
        // 4. RESERVACIONES
        // ==========================================
        '/reservations/create': {
            post: {
                tags: ['Reservaciones'],
                summary: 'Crear una nueva reservación',
                description: 'Registra una solicitud de mesa para una fecha y hora específica. Valida disponibilidad automáticamente.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['tableId', 'date', 'time', 'peopleCount'],
                                properties: {
                                    tableId: { type: 'string', example: 'ID_DE_LA_MESA' },
                                    date: { type: 'string', format: 'date', example: '2026-10-15' },
                                    time: { type: 'string', example: '19:30' },
                                    peopleCount: { type: 'number', example: 4 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Reservación creada exitosamente' },
                    400: { description: 'Error de validación (Fecha pasada o mesa ocupada)' }
                }
            }
        },
        '/reservations/get': {
            get: {
                tags: ['Reservaciones'],
                summary: 'Listar todas las reservaciones',
                description: 'Obtiene el listado global de reservas del sistema. Uso administrativo.',
                responses: {
                    200: { description: 'Lista de reservaciones obtenida' }
                }
            }
        },
        '/reservations/my-reservations': {
            get: {
                tags: ['Reservaciones'],
                summary: 'Obtener mis reservaciones',
                description: 'Recupera únicamente las reservas asociadas al usuario autenticado mediante el Token JWT.',
                responses: {
                    200: { description: 'Historial personal de reservas obtenido' },
                    401: { description: 'No autorizado - Falta Token JWT' }
                }
            }
        },
        '/reservations/{id}': {
            get: {
                tags: ['Reservaciones'],
                summary: 'Obtener reservación por ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalle de la reservación' },
                    404: { description: 'Reservación no encontrada' }
                }
            },
            put: {
                tags: ['Reservaciones'],
                summary: 'Actualizar datos de la reservación',
                description: 'Permite modificar la fecha, hora o cantidad de personas de una reserva existente.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    date: { type: 'string', format: 'date' },
                                    time: { type: 'string' },
                                    peopleCount: { type: 'number' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Reservación actualizada correctamente' }
                }
            }
        },
        '/reservations/status/{id}': {
            put: {
                tags: ['Reservaciones'],
                summary: 'Actualizar estado operativo',
                description: 'Cambia el estado de la reserva (ej. CONFIRMED, CANCELLED).',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: {
                                    status: { type: 'string', example: 'CONFIRMED' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Estado actualizado' }
                }
            }
        },
        '/reservations/{id}/activate': {
            put: {
                tags: ['Reservaciones'],
                summary: 'Activar reservación',
                description: 'Habilita lógicamente una reservación desactivada.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Reservación activada' }
                }
            }
        },
        '/reservations/{id}/deactivate': {
            put: {
                tags: ['Reservaciones'],
                summary: 'Desactivar reservación',
                description: 'Realiza una baja lógica de la reservación.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Reservación desactivada' }
                }
            }
        },

        // ==========================================
        // 5. PLATILLOS (DISHES)
        // ==========================================
        '/dishes': {
            get: {
                tags: ['Platillos'],
                summary: 'Obtener todos los platillos',
                description: 'Recupera el menú completo de platillos registrados. Requiere Token JWT.',
                responses: {
                    200: {
                        description: 'Menú obtenido exitosamente',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        dishes: { type: 'array', items: { type: 'object' } }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'No autorizado' }
                }
            },
            post: {
                tags: ['Platillos'],
                summary: 'Crear un nuevo platillo',
                description: 'Registra un platillo en el menú. Utiliza Form-Data para procesar la imagen del plato.',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['name', 'price', 'category'],
                                properties: {
                                    name: { type: 'string', example: 'Pizza Margherita' },
                                    description: { type: 'string', example: 'Tomate, mozzarella fresca y albahaca.' },
                                    price: { type: 'number', example: 85.00 },
                                    category: { type: 'string', example: 'Pizzas' },
                                    photo: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'Imagen ilustrativa del platillo'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Platillo creado exitosamente' },
                    400: { description: 'Error en la validación de los campos o archivo' }
                }
            }
        },
        '/dishes/{id}': {
            get: {
                tags: ['Platillos'],
                summary: 'Obtener platillo por ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles del platillo' },
                    404: { description: 'Platillo no encontrado' }
                }
            },
            put: {
                tags: ['Platillos'],
                summary: 'Actualizar platillo',
                description: 'Permite modificar los datos y la imagen de un platillo existente.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    price: { type: 'number' },
                                    category: { type: 'string' },
                                    photo: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Platillo actualizado correctamente' }
                }
            },
            patch: {
                tags: ['Platillos'],
                summary: 'Cambiar disponibilidad del platillo',
                description: 'Permite activar o desactivar un plato del menú (Baja lógica).',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Estado del platillo actualizado' }
                }
            }
        },
        // ==========================================
        // 6. EMPLEADOS
        // ==========================================
        '/employees': {
            get: {
                tags: ['Empleados'],
                summary: 'Listar todos los empleados',
                description: 'Obtiene la lista completa del personal del restaurante. Requiere Token JWT.',
                responses: {
                    200: { description: 'Lista de empleados obtenida exitosamente' },
                    401: { description: 'No autorizado - Token no proporcionado' }
                }
            },
            post: {
                tags: ['Empleados'],
                summary: 'Registrar nuevo empleado',
                description: 'Crea un perfil de empleado. Esta acción utiliza Form-Data porque envía una imagen al AuthService y Cloudinary.',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                required: ['name', 'surname', 'email', 'password', 'role'],
                                properties: {
                                    name: { type: 'string', example: 'Juan' },
                                    surname: { type: 'string', example: 'Pérez' },
                                    email: { type: 'string', example: 'juan.perez@restaurante.com' },
                                    password: { type: 'string', example: 'Password123!' },
                                    phone: { type: 'string', example: '44332211' },
                                    role: { type: 'string', example: 'EMPLOYEE_ROLE', description: 'Rol asignado en el AuthService' },
                                    profilePicture: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'Foto de perfil del empleado'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Empleado registrado y sincronizado con AuthService' },
                    400: { description: 'Error en la validación de datos o archivo' }
                }
            }
        },
        '/employees/{id}': {
            get: {
                tags: ['Empleados'],
                summary: 'Obtener empleado por ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles del empleado obtenidos' },
                    404: { description: 'Empleado no encontrado' }
                }
            },
            put: {
                tags: ['Empleados'],
                summary: 'Actualizar datos del empleado',
                description: 'Permite modificar la información laboral o personal del empleado.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    phone: { type: 'string' },
                                    role: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Empleado actualizado correctamente' }
                }
            },
            patch: {
                tags: ['Empleados'],
                summary: 'Cambiar estado laboral',
                description: 'Activa o desactiva la cuenta del empleado (Baja lógica).',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Estado del empleado actualizado' }
                }
            }
        },
        // ==========================================
        // 7. EVENTOS
        // ==========================================
        '/events': {
            get: {
                tags: ['Eventos'],
                summary: 'Listar todos los eventos',
                description: 'Recupera la lista completa de eventos programados en los distintos restaurantes.',
                responses: {
                    200: { description: 'Lista de eventos obtenida exitosamente' }
                }
            },
            post: {
                tags: ['Eventos'],
                summary: 'Crear un nuevo evento',
                description: 'Registra una actividad especial (conciertos, catas, festividades) asociada a un restaurante.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'description', 'date', 'restaurantId'],
                                properties: {
                                    title: { type: 'string', example: 'Noche de Jazz' },
                                    description: { type: 'string', example: 'Música en vivo y menú especial de mariscos.' },
                                    date: { type: 'string', format: 'date-time', example: '2024-12-24T20:00:00Z' },
                                    restaurantId: { type: 'string', example: 'ID_DEL_RESTAURANTE' },
                                    capacity: { type: 'number', example: 50 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Evento creado exitosamente' },
                    400: { description: 'Error en los datos de entrada' }
                }
            }
        },
        '/events/{id}': {
            get: {
                tags: ['Eventos'],
                summary: 'Obtener detalles de un evento',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles del evento obtenidos' },
                    404: { description: 'Evento no encontrado' }
                }
            },
            put: {
                tags: ['Eventos'],
                summary: 'Actualizar información del evento',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    description: { type: 'string' },
                                    date: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Evento actualizado correctamente' }
                }
            },
            patch: {
                tags: ['Eventos'],
                summary: 'Cambiar estado del evento',
                description: 'Permite activar, desactivar o cancelar un evento lógicamente.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Estado del evento modificado' }
                }
            }
        },
        '/events/{id}/subscribe': {
            patch: {
                tags: ['Eventos'],
                summary: 'Suscribirse a un evento',
                description: 'Asocia al usuario autenticado (vía Token) a la lista de asistentes del evento.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Suscripción realizada con éxito' },
                    400: { description: 'El evento ya no tiene cupo o ya pasó' },
                    401: { description: 'No autorizado - Se requiere Token JWT' }
                }
            }
        },
        // ==========================================
        // 8. ÓRDENES (ORDERS)
        // ==========================================
        '/orders/create': {
            post: {
                tags: ['Órdenes'],
                summary: 'Crear una nueva orden',
                description: 'Registra un pedido de alimentos y bebidas para una mesa específica.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['table', 'items'],
                                properties: {
                                    table: { type: 'string', example: 'ID_DE_LA_MESA' },
                                    items: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                dish: { type: 'string', example: 'ID_DEL_PLATILLO' },
                                                quantity: { type: 'number', example: 2 },
                                                notes: { type: 'string', example: 'Sin cebolla' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Orden creada exitosamente y enviada a cocina' },
                    400: { description: 'Error en la validación de los productos o mesa' }
                }
            }
        },
        '/orders/getMyOrders': {
            get: {
                tags: ['Órdenes'],
                summary: 'Obtener mis órdenes',
                description: 'Lista el historial de pedidos realizados por el usuario autenticado.',
                responses: {
                    200: {
                        description: 'Lista de órdenes obtenida',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        orders: { type: 'array', items: { type: 'object' } }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'No autorizado' }
                }
            }
        },
        '/orders/{id}': {
            get: {
                tags: ['Órdenes'],
                summary: 'Obtener detalle de orden por ID',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID único de la orden',
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Detalle de la orden obtenido' },
                    404: { description: 'Orden no encontrada' }
                }
            }
        },
        '/orders/{id}/status': {
            put: {
                tags: ['Órdenes'],
                summary: 'Actualizar estado de la orden',
                description: 'Permite cambiar el estado del pedido (ej. PENDIENTE, EN_PREPARACION, LISTO, ENTREGADO).',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['status'],
                                properties: {
                                    status: {
                                        type: 'string',
                                        enum: ['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'],
                                        example: 'READY'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Estado de la orden actualizado exitosamente' },
                    400: { description: 'Estado no válido' }
                }
            }
        },
        // ==========================================
        // 9. FACTURACIÓN (INVOICES)
        // ==========================================
        '/invoices/myInvoices': {
            get: {
                tags: ['Facturación'],
                summary: 'Obtener mis facturas',
                description: 'Recupera el historial de facturas emitidas para el usuario autenticado basado en su token JWT.',
                responses: {
                    200: {
                        description: 'Lista de facturas obtenida exitosamente',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        invoices: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                                                    invoiceNumber: { type: 'string', example: 'FAC-2024-001' },
                                                    total: { type: 'number', example: 150.75 },
                                                    date: { type: 'string', format: 'date-time' },
                                                    restaurant: { type: 'string', example: 'Restaurante Central' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'No autorizado - Token inválido o no proporcionado' }
                }
            }
        },
        '/invoices/{id}': {
            get: {
                tags: ['Facturación'],
                summary: 'Obtener detalle de factura por ID',
                description: 'Consulta la información detallada de una factura específica, incluyendo los ítems consumidos.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID de la factura a consultar',
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Detalle de la factura obtenido',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        invoice: {
                                            type: 'object',
                                            properties: {
                                                total: { type: 'number' },
                                                nit: { type: 'string', example: 'CF' },
                                                items: { type: 'array', items: { type: 'object' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Factura no encontrada' }
                }
            }
        },

        // ==========================================
        // 10. PROMOCIONES
        // ==========================================
        '/promotions/get': {
            get: {
                tags: ['Promociones'],
                summary: 'Obtener todas las promociones',
                description: 'Recupera la lista de promociones registradas, con opción de filtrar por estado.',
                responses: {
                    200: { description: 'Lista de promociones obtenida exitosamente' }
                }
            }
        },
        '/promotions/create': {
            post: {
                tags: ['Promociones'],
                summary: 'Crear una nueva promoción',
                description: 'Registra una oferta o descuento especial asociándola a un restaurante o platillo.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'description', 'discountPercentage', 'startDate', 'endDate'],
                                properties: {
                                    title: { type: 'string', example: 'Summer Deal 2024' },
                                    description: { type: 'string', example: '2x1 en bebidas nacionales de lunes a viernes.' },
                                    discountPercentage: { type: 'number', example: 50 },
                                    startDate: { type: 'string', format: 'date', example: '2024-06-01' },
                                    endDate: { type: 'string', format: 'date', example: '2024-08-31' },
                                    restaurantId: { type: 'string', example: 'ID_DEL_RESTAURANTE' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Promoción creada exitosamente' },
                    400: { description: 'Error en la validación de los datos enviados' }
                }
            }
        },
        '/promotions/{id}': {
            get: {
                tags: ['Promociones'],
                summary: 'Obtener promoción por ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles de la promoción' },
                    404: { description: 'Promoción no encontrada' }
                }
            },
            put: {
                tags: ['Promociones'],
                summary: 'Actualizar promoción',
                description: 'Modifica los datos generales de una promoción existente.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    title: { type: 'string' },
                                    discountPercentage: { type: 'number' },
                                    endDate: { type: 'string', format: 'date' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Promoción actualizada correctamente' }
                }
            }
        },
        '/promotions/status/{id}': {
            patch: {
                tags: ['Promociones'],
                summary: 'Actualizar estado de vigencia',
                description: 'Permite actualizar manualmente si una promoción sigue vigente o ha expirado.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', example: 'EXPIRED' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Estado de vigencia actualizado' }
                }
            }
        },
        '/promotions/{id}/activate': {
            put: {
                tags: ['Promociones'],
                summary: 'Activar promoción',
                description: 'Habilita lógicamente la promoción para que sea visible por los clientes.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Promoción activada' }
                }
            }
        },
        '/promotions/{id}/desactivate': {
            put: {
                tags: ['Promociones'],
                summary: 'Desactivar promoción',
                description: 'Inhabilita lógicamente la promoción.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Promoción desactivada' }
                }
            }
        },
        // ==========================================
        // 11. REPORTES Y ESTADÍSTICAS
        // ==========================================
        '/reports/generalReport': {
            get: {
                tags: ['Reportes'],
                summary: 'Obtener reporte general del sistema',
                description: 'Genera un informe global que incluye métricas de todos los restaurantes, ventas totales y estadísticas de usuarios.',
                responses: {
                    200: {
                        description: 'Reporte general generado exitosamente',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        data: {
                                            type: 'object',
                                            properties: {
                                                totalSales: { type: 'number', example: 15000.50 },
                                                activeRestaurants: { type: 'number', example: 8 },
                                                totalReservations: { type: 'number', example: 120 }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'No autorizado' },
                    403: { description: 'Prohibido - Se requieren permisos de Administrador' }
                }
            }
        },
        '/reports/restaurantReport/{id}': {
            get: {
                tags: ['Reportes'],
                summary: 'Obtener reporte específico de un restaurante',
                description: 'Genera estadísticas detalladas de una sucursal específica, como platillos más vendidos y flujo de clientes.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID del restaurante a consultar',
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Reporte de sucursal generado',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        restaurantName: { type: 'string', example: 'Restaurante Central' },
                                        stats: {
                                            type: 'object',
                                            properties: {
                                                dailyOrders: { type: 'number', example: 45 },
                                                popularDish: { type: 'string', example: 'Pizza Especial' }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    404: { description: 'Restaurante no encontrado' }
                }
            }
        },

        // ==========================================
        // 12. INVENTARIOS
        // ==========================================
        '/inventories': {
            get: {
                tags: ['Inventarios'],
                summary: 'Listar inventario completo',
                description: 'Obtiene todos los artículos registrados en el inventario del restaurante.',
                responses: {
                    200: { description: 'Lista de inventario obtenida' }
                }
            },
            post: {
                tags: ['Inventarios'],
                summary: 'Crear nuevo artículo en inventario',
                description: 'Registra un nuevo insumo o producto en el sistema de suministros.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['name', 'stock', 'unit'],
                                properties: {
                                    name: { type: 'string', example: 'Harina de Trigo' },
                                    description: { type: 'string', example: 'Insumo para panadería' },
                                    stock: { type: 'number', example: 50 },
                                    unit: { type: 'string', example: 'Kg' },
                                    lowStockThreshold: { type: 'number', example: 10 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Artículo creado exitosamente' },
                    400: { description: 'Error en la validación de datos' }
                }
            }
        },
        '/inventories/{id}': {
            get: {
                tags: ['Inventarios'],
                summary: 'Obtener artículo por ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles del artículo de inventario' },
                    404: { description: 'Artículo no encontrado' }
                }
            },
            put: {
                tags: ['Inventarios'],
                summary: 'Actualizar información del artículo',
                description: 'Permite modificar nombre, unidad o descripción de un insumo.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    name: { type: 'string' },
                                    unit: { type: 'string' },
                                    description: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Información actualizada correctamente' }
                }
            }
        },
        '/inventories/{id}/status': {
            patch: {
                tags: ['Inventarios'],
                summary: 'Cambiar estado del artículo',
                description: 'Activa o desactiva un artículo del inventario (disponibilidad lógica).',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Estado del artículo actualizado' }
                }
            }
        },
        '/inventories/{id}/stock': {
            patch: {
                tags: ['Inventarios'],
                summary: 'Actualizar niveles de stock',
                description: 'Ajusta la cantidad disponible de un insumo específico.',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['stock'],
                                properties: {
                                    stock: { type: 'number', example: 100 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Stock actualizado exitosamente' }
                }
            }
        },

        // ==========================================
        // 13. COMENTARIOS Y RESEÑAS
        // ==========================================
        '/comments': {
            get: {
                tags: ['Comentarios'],
                summary: 'Obtener todos los comentarios',
                description: 'Lista general de todos los comentarios registrados en el sistema.',
                responses: {
                    200: { description: 'Lista de comentarios obtenida' }
                }
            },
            post: {
                tags: ['Comentarios'],
                summary: 'Crear un nuevo comentario',
                description: 'Permite a un usuario registrar una reseña. Debe enviarse el ID del restaurante o del platillo al que va dirigido.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['text', 'rating'],
                                properties: {
                                    text: { type: 'string', example: 'Excelente servicio y comida.' },
                                    rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
                                    restaurant: { type: 'string', example: 'ID_DEL_RESTAURANTE' },
                                    dish: { type: 'string', example: 'ID_DEL_PLATILLO' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Comentario creado exitosamente' },
                    400: { description: 'Datos de entrada inválidos' }
                }
            }
        },
        '/comments/{id}': {
            get: {
                tags: ['Comentarios'],
                summary: 'Obtener comentario por ID',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Detalles del comentario' },
                    404: { description: 'Comentario no encontrado' }
                }
            },
            put: {
                tags: ['Comentarios'],
                summary: 'Actualizar contenido de un comentario',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    text: { type: 'string', example: 'Contenido actualizado de la reseña.' },
                                    rating: { type: 'number', example: 4 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Comentario actualizado' }
                }
            }
        },
        '/comments/dish/{dishId}': {
            get: {
                tags: ['Comentarios'],
                summary: 'Listar comentarios de un platillo',
                parameters: [
                    { name: 'dishId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Reseñas del platillo obtenidas' }
                }
            }
        },
        '/comments/restaurant/{restaurantId}': {
            get: {
                tags: ['Comentarios'],
                summary: 'Listar comentarios de un restaurante',
                parameters: [
                    { name: 'restaurantId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Reseñas de la sucursal obtenidas' }
                }
            }
        },
        '/comments/activate/{id}': {
            put: {
                tags: ['Comentarios'],
                summary: 'Activar comentario',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Comentario habilitado' }
                }
            }
        },
        '/comments/desactivate/{id}': {
            put: {
                tags: ['Comentarios'],
                summary: 'Desactivar comentario',
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: { description: 'Comentario inhabilitado' }
                }
            }
        },
        // ==========================================
        // 14. NOTIFICACIONES
        // ==========================================
        '/notifications': {
            get: {
                tags: ['Notificaciones'],
                summary: 'Obtener mis notificaciones',
                description: 'Recupera el historial completo de notificaciones del usuario autenticado.',
                responses: {
                    200: {
                        description: 'Lista de notificaciones obtenida exitosamente',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        notifications: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    _id: { type: 'string', example: '65f1a2b3c4d5e6f7a8b9c0d1' },
                                                    message: { type: 'string', example: 'Tu reservación ha sido confirmada' },
                                                    read: { type: 'boolean', example: false },
                                                    createdAt: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    401: { description: 'No autorizado - Token JWT no proporcionado o inválido' }
                }
            }
        },
        '/notifications/unread-count': {
            get: {
                tags: ['Notificaciones'],
                summary: 'Contar notificaciones no leídas',
                description: 'Devuelve la cantidad total de notificaciones que el usuario aún no ha visto.',
                responses: {
                    200: {
                        description: 'Conteo obtenido',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        unreadCount: { type: 'number', example: 5 }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/notifications/read-all': {
            put: {
                tags: ['Notificaciones'],
                summary: 'Marcar todas como leídas',
                description: 'Actualiza el estado de todas las notificaciones del usuario a "leído".',
                responses: {
                    200: {
                        description: 'Todas las notificaciones marcadas como leídas',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string', example: 'Notificaciones actualizadas' }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/notifications/{id}/read': {
            put: {
                tags: ['Notificaciones'],
                summary: 'Marcar una notificación como leída',
                description: 'Cambia el estado de una notificación específica mediante su ID.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID de la notificación',
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Notificación marcada como leída' },
                    404: { description: 'Notificación no encontrada' }
                }
            }
        },
        '/notifications/{id}': {
            delete: {
                tags: ['Notificaciones'],
                summary: 'Eliminar notificación',
                description: 'Elimina permanentemente una notificación del historial del usuario.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'ID de la notificación a eliminar',
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: { description: 'Notificación eliminada exitosamente' },
                    404: { description: 'Notificación no encontrada' }
                }
            }
        }
    }
};