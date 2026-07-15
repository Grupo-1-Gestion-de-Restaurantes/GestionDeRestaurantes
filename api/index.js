import dotenv from 'dotenv';
import { createApp } from '../configs/app.js';

dotenv.config();

let appPromise = null;

const getApp = () => {
    if (!appPromise) {
        appPromise = createApp();
    }
    return appPromise;
};

export default async function handler(req, res) {
    const app = await getApp();
    return app(req, res);
}
