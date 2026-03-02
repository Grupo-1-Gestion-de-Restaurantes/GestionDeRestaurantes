# Sistema Gestión de Restaurantes API - Grupo 1

Este proyecto es el servidor principal desarrollado en Node.js y MongoDB para el Sistema de Gestión de Restaurantes. Se encarga de la operación centralizada de sucursales, mesas, reservaciones, platillos, órdenes y facturación, delegando la autenticación y el manejo de roles a un microservicio externo construido en .NET.

## Tecnologías Utilizadas

El sistema está construido sobre el ecosistema de JavaScript utilizando **Node.js** con el framework **Express**. La persistencia de datos relacional y documental se maneja mediante **MongoDB** y **Mongoose**. Para la seguridad, se implementa validación estricta de **JSON Web Tokens (JWT)**, limitadores de peticiones con Express Rate Limit y cabeceras de seguridad con Helmet. Además, incluye comunicación en tiempo real para notificaciones mediante **Socket.io** y documentación interactiva autogenerada con **Swagger (OpenAPI)**.

## Instalación y Configuración

1. Clonar el repositorio en el entorno local.
2. Ejecutar `pnpm install` para instalar todas las dependencias listadas en el `package.json`.
3. Crear un archivo `.env` en la raíz, guiándose por el esquema proporcionado en la sección de Variables de Entorno.
4. Asegurarse de tener el servicio de base de datos MongoDB en ejecución local o proporcionar una URI de Mongo Atlas.
5. Levantar el servicio externo de AuthService (.NET) para que la validación y emisión de tokens funcione correctamente.
6. Ejecutar el comando `pnpm run dev` para iniciar el servidor con recarga en caliente a través de Nodemon.

## Variables de Entorno (.env)

El archivo de configuración debe contener las siguientes claves para el correcto funcionamiento del servidor:

```env
PORT=3007
URI_MONGO=mongodb://localhost:27017/DBGestionRestaurantes
JWT_SECRET=tu_secreto_jwt_compartido_aqui
JWT_ISSUER=AuthServiceGestionRestaurantes
JWT_AUDIENCE=GestionRestaurantesMicroservices
```
*(Nota: Añade las credenciales de Cloudinary u otros servicios externos que estés utilizando para el manejo de imágenes).*

## Características Principales

**Funciones de Administrador**
El sistema permite la administración multi-sucursal. Los administradores pueden registrar nuevos restaurantes (incluyendo fotografías y datos de contacto) y estructurar sus planos físicos creando mesas con capacidades específicas. Gestionan el catálogo de platillos del menú, el inventario de ingredientes en bodega (con alertas de stock bajo) y pueden programar promociones o eventos especiales. Además, cuentan con un potente motor de analítica para generar reportes generales sobre ventas, platillos más populares y ocupación por restaurante.

**Funciones de Cliente y Empleado**
Los usuarios clientes pueden explorar el menú digital, realizar reservaciones de mesas validando la disponibilidad del restaurante en tiempo real, y dejar reseñas o calificaciones sobre su experiencia. Los empleados utilizan el sistema para ingresar órdenes a cocina, actualizar el estado de los pedidos (Pendiente, En Preparación, Entregado), y emitir la factura final (Invoice) una vez concluido el servicio. Todo esto complementado con un sistema de notificaciones integrado para alertar sobre confirmaciones de reserva o cambios de estado.

## Documentación
En la entrega se adjuntan colecciones de Postman. Para ir a la documentación con swager acceda a : [swagger](http://localhost:3006/api-docs/)
** edite el puerto según lo haya puesto en el .env


## Rutas Principales (Endpoints)

*Nota: La ruta base para todos los endpoints es `/gestionDeRestaurantes/v1`*

| Módulo | Método | Endpoint | Descripción |
|---|---|---|---|
| **Restaurantes** | POST | `/restaurants/create` | (Admin) Registra una nueva sucursal con imagen (Form-Data) |
| **Mesas** | POST | `/tables/create` | (Admin) Crea y asigna una mesa con su capacidad a un restaurante |
| **Mesas** | PUT | `/tables/:id/availability` | Modifica el estado de disponibilidad en tiempo real (Libre/Ocupada) |
| **Reservaciones** | POST | `/reservations/create` | Registra una reservación de mesa validando disponibilidad y horarios |
| **Reservaciones** | GET | `/reservations/my-reservations` | Obtiene el historial de reservas del usuario logueado |
| **Órdenes** | POST | `/orders/create` | Genera un pedido de platillos asignado a una mesa activa |
| **Órdenes** | PUT | `/orders/:id/status` | Actualiza el flujo del pedido (Ej. De 'PENDING' a 'READY') |
| **Facturas** | GET | `/invoices/myInvoices` | Obtiene el historial de consumos y facturación del cliente |
| **Platillos** | POST | `/dishes` | (Admin) Agrega un nuevo platillo al menú digital |
| **Reportes** | GET | `/reports/generalReport` | (Admin) Obtiene estadísticas globales de ventas y usuarios |