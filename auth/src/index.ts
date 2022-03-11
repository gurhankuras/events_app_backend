import 'express-async-errors'
import mongoose from 'mongoose';
import { app } from './app';
import { logger } from '@gkeventsapp/common';

const PORT = 3000
const start = async () => {
    logger.level = 'debug'
    logger.debug('calisti')
    logger.error('demo error')
    logger.warn('demo warning')

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI env value not found!")
    }
    
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
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

