import mongoose from 'mongoose';
import 'express-async-errors'

import { server } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { UserCreatedListener } from "./events/listeners/user-created-listener";
import { logger } from '@gkeventsapp/common';

const PORT = 3000

const start = async () => {
    console.log('chat works!')
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI env value not found!")
    }
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY not provided")
    }
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error("NATS_CLUSTER_ID not provided")
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error("NATS_CLIENT_ID not provided")
    }
    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL not provided")
    }
    
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client?.on('close', () => {
            logger.debug('NATS connection closed!')
            process.exit()
        })
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())
        new UserCreatedListener(natsWrapper.client).listen()
        await mongoose.connect(process.env.MONGO_URI, {});
        logger.info('Database connected!')  
    } catch (error) {
        console.log(error)
    }
    server.listen(PORT, async () => {
        logger.info(`🚀 Listening on port ${PORT}`);
    });
    
    /*
    app.listen(3000, () => {
        if (!process.env.JWT_KEY) {
            throw new Error("JWT_KEY not provided")
        }
        console.log(`🚀 Listening on port ${PORT}`)
    });
    */ 
}

start()



