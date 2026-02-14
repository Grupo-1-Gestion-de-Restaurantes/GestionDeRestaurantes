'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import restaurantRoutes from '../src/restaurant.routes.js';

const BASE_PATH = '/kinalSportsAdmin/v1';

const middlewares = (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));
};

const routes = (app) => {

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Gestion Restaurantes API'
        });
    });

    app.use(`${BASE_PATH}/restaurants`, restaurantRoutes);

    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint no encontrado en la API'
        });
    });
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3000;

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
