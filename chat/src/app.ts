
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import 'express-async-errors'
import { json } from 'body-parser'
import { fetchMessagesRouter } from "./routes/fetch-messages";
import { newMessageRouter } from "./routes/new-message";
import { errorHandler, logger, NotFoundError } from "@gkeventsapp/common";
import { fetchRoomsRouter } from "./routes/fetch-rooms";
import { createConversationRouter } from "./routes/create-conversation";
import { fetchUsersRouter } from "./routes/fetch-users";

const app = express();
const server = createServer(app)
const io = new Server(server, { allowEIO3: true });
export enum ClientEvent {
    SEND = "client:send"
}

export enum ServerEvent {
    SEND = "server:send"
}




app.use(json())
app.use((req, res, next) => {
    //console.log(req.headers)
    next()
})
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

