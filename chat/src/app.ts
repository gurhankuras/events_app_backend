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
import { fetchUsersRouter } from "./routes/fetch-users";
import { MySocket } from "./socket/my-socket";
import { ClientEvent } from "./socket/events/client-events";
import { handleSocketMessage } from "./socket/handlers/handle-socket-message";
import { currentSocketUser } from "./socket/middlewares/current-socket-user";

const app = express();
const server = createServer(app)
const io = new Server(server, { allowEIO3: true });

io.use(currentSocketUser)

io.on("connection", (socket: MySocket) => {
    socket.on(ClientEvent.SEND, async (data) => {
        console.log(data);
        let message = JSON.parse(data)
        handleSocketMessage(socket.roomId!, message, socket.currentUser!)
    })
    socket.on('disconnect', () => {
        console.log('disconnected')
    })
});


app.use(json())

app.use(fetchMessagesRouter)
app.use(newMessageRouter)
app.use(fetchRoomsRouter)
app.use(createConversationRouter)
app.use(fetchUsersRouter)

app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler)

export {io, server, app}

