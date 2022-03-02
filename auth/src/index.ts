import 'express-async-errors'
import mongoose from 'mongoose';
import { app } from './app';
import { logger } from './utils/logger';

const PORT = 3000
const start = async () => {
    logger.level = 'debug'
    logger.debug('calisti')
    logger.error('demo error')
    logger.warn('demo warning')
    try {
        await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {});
        logger.info('Database connected! -auth')  
    } catch (error) {
        logger.error(error)
    }
    app.listen(3000, () => {
        if (!process.env.JWT_KEY) {
            throw new Error("JWT_KEY not provided")
        }
        logger.info(`🚀 Listening on port ${PORT}`)
    }); 
}

start()

