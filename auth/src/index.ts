import 'express-async-errors'
import mongoose from 'mongoose';
import { app } from './app';
import { logger } from '@gkeventsapp/common';
import { natsWrapper } from './nats-wrapper';


const PORT = 3000
const start = async () => {
    logger.level = 'debug'
    logger.debug('calisti')
    logger.error('demo error')
    logger.warn('demo warning')

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI env value not found!")
    }
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY not provided")
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error("NATS_CLUSTER_ID not provided")
    }
    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL not provided")
    }
    
    
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, 'asdasde', process.env.NATS_URL)
        natsWrapper.client?.on('close', () => {
            logger.debug('NATS connection closed!')
            process.exit()
        })
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())

        await mongoose.connect(process.env.MONGO_URI, {});
        logger.info('Database connected!')  
    } catch (error) {
        logger.error(error)
    }
    app.listen(3000, () => {
        
        logger.info(`🚀 Listening on port ${PORT}`)
    }); 
}

start()

