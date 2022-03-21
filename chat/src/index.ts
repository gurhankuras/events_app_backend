
import express, {Request, Response} from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import 'express-async-errors'

import { Conversation } from "./models/conversation";
import { ChatMessage } from "./models/chat-single";
import { json } from 'body-parser'
import { fetchMessagesRouter } from "./routes/fetch-messages";
import { newMessageRouter } from "./routes/new-message";
import { errorHandler, logger, NotFoundError } from "@gkeventsapp/common";
import { fetchRoomsRouter } from "./routes/fetch-rooms";
import { server } from "./app";
import { natsWrapper } from "./nats-wrapper";
import { UserCreatedListener } from "./events/listeners/user-created-listener";

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
    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL not provided")
    }
    
    try {
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, 'oodsfds', process.env.NATS_URL)
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
        logger.info("🚀 Listening on port :%s...", "3000");
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



