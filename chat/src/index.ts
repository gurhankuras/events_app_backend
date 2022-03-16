
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
import { errorHandler, NotFoundError } from "@gkeventsapp/common";
import { fetchRoomsRouter } from "./routes/fetch-rooms";
import { server } from "./app";

const PORT = 3000

const start = async () => {
    console.log('chat works!')
    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI env value not found!")
    }
    
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log('Database connected! -chat')  
    } catch (error) {
        console.log(error)
    }
    server.listen(PORT, async () => {
        console.log("Listening on port :%s...", "3000");
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



