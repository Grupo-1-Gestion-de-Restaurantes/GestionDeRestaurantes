'use strict';

import mongoose from "mongoose";

export const dbConnection = async () =>{
    try {
        mongoose.connection.on('error', () =>{
            console.log('MongoDB | no se pudo conectar a mongoDB');
            mongoose.disconnect();
        });
        mongoose.connection.on('conecting', () =>{
            console.log('MongoDB | intentando conectar a mongoDB');
        });
        mongoose.connection.on('connected', () =>{
            console.log('MongoDB | conectando a mongoDB');
        });
        mongoose.connection.on('open', () =>{
            console.log('MongoDB | conectado a la base de datos DBGestionRestaurantes');
        });
        mongoose.connection.on('reconnected', () =>{
            console.log('MongoDB | reconectando a mongoDB');
        });
        mongoose.connection.on('disconnected', () =>{
            console.log('MongoDB | desconectando a mongoDB');
        });

        await mongoose.connect(process.env.URI_MONGO,{
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        });
    } catch (error) {
        console.log(`Error al conectar la db: ${error}`)
    }
}

const gracefulSutdown = async (signal) =>{
    console.log(`MongoDB | Received ${signal}. Closing database connection...`);
    try {
        await mongoose.connection.close();
        console.log('MongoDB | Database connection closed succesfully');
        process.exit(0);
    } catch (error) {
        console.log('MongoDB | Error during graceful shutdown:', error.message);
        process.exit(1);
    }
}

process.on('SIGINT', () => gracefulSutdown('SIGINT'));
process.on('SIGTERM', () => gracefulSutdown('SIGTERM'));
process.on('SIGURS2', () => gracefulSutdown('SIGURS2'));