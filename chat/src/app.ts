
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import 'express-async-errors'
import { json } from 'body-parser'
import { fetchMessagesRouter } from "./routes/fetch-messages";
import { newMessageRouter } from "./routes/new-message";
import { errorHandler, NotFoundError } from "@gkeventsapp/common";
import { fetchRoomsRouter } from "./routes/fetch-rooms";
import { createConversationRouter } from "./routes/create-conversation";

const app = express();
const server = createServer(app)
const io = new Server(server, { allowEIO3: true });


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
app.use(fetchRoomsRouter)
app.use(createConversationRouter)

app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler)

export {io, server, app}

