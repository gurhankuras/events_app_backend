
import express, {Request, Response} from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import { Conversation } from "../models/conversation";
import { ChatMessage } from "../models/chat";
import { json } from 'body-parser'
import { fetchMessagesRouter } from "../routes/fetch-chat-messages";
import { newMessageRouter } from "../routes/new-message";
const app = express();
const server = createServer(app)
const io = new Server(server, { allowEIO3: true });

interface ChatMessage {
    id: string;
    sender: string;
    recipient: string;
    text: string;
    createdAt: Date
}

let dummyMessages: ChatMessage[] = [
    {
        id: 'haha',
        createdAt: new Date(),
        recipient: 'Emre',
        sender: 'Gurhan',
        text: 'Ne de guzel olmus'
    }

]

io.on("connection", (socket) => {
    console.log('connection')
    socket.on("toServer", (data) => {
        console.log(data);
        socket.emit('hello', `${data} - server`)
    })
    socket.on('disconnect', () => {
        console.log('disconnected')
    })
    socket.emit('hello', 'bak ben geldim')
});

app.use(json())

app.use(fetchMessagesRouter)
app.use(newMessageRouter)

app.get("/api/chat", async (request, response) => {
    console.log('api/chat')
    response.send(dummyMessages)
});


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
    server.listen(3000, async () => {
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



