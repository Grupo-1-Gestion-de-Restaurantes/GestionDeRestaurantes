'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { errorHandler } from '../middlewares/handle-errors.js';
import restaurantRoutes from '../src/restaurants/restaurant.routes.js';
import reservationRoutes from '../src/reservations/reservation.routes.js'
import tableRoutes from '../src/table/table.routes.js';
import clientRoutes from '../src/client/client.routes.js';
import dishRoutes from '../src/dishes/dish.routes.js';
import employeeRoutes from '../src/employees/employee.routes.js';
import eventRoutes from '../src/events/events.routes.js';
import orderRoutes from '../src/orders/order.routes.js';
import invoiceRoutes from '../src/invoice/invoice.routes.js';
import promotionsRoutes from '../src/promotions/promotions.routes.js';
import reportRoutes from '../src/reports/reports.routes.js';
import inventoryRoutes from '../src/inventories/inventory.routes.js';
import commentRoutes from '../src/comments/comment.routes.js';

const BASE_PATH = '/gestionDeRestaurantes/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(requestLimit);
    app.use(morgan('dev'));
}

const routes = (app) => {

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Gestion Restaurantes API'
        });
    });

    app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);
    app.use(`${BASE_PATH}/tables`, tableRoutes);
    app.use(`${BASE_PATH}/clients`, clientRoutes);
    app.use(`${BASE_PATH}/reservations`, reservationRoutes);
    app.use(`${BASE_PATH}/dishes`, dishRoutes);
    app.use(`${BASE_PATH}/employees`, employeeRoutes);
    app.use(`${BASE_PATH}/events`, eventRoutes);
    app.use(`${BASE_PATH}/orders`, orderRoutes);
    app.use(`${BASE_PATH}/invoices`, invoiceRoutes);
    app.use(`${BASE_PATH}/promotions`, promotionsRoutes);
    app.use(`${BASE_PATH}/reports`, reportRoutes);
    app.use(`${BASE_PATH}/inventories`, inventoryRoutes);
    app.use(`${BASE_PATH}/comments`, commentRoutes);
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en la API'
        });
    });

    app.use(errorHandler);
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT;

    app.set('trust proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        routes(app);
        


        app.listen(PORT, () => {
            console.log(`Gestion Restaurantes server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        });

    } catch (error) {
        console.error(`Error starting Server: ${error.message}`);
        process.exit(1);
    }
};
