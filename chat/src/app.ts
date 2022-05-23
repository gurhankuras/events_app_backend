import express, { Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import 'express-async-errors'
import { json } from 'body-parser'
import { fetchMessagesRouter } from "./routes/fetch-messages";
import { newMessageRouter } from "./routes/new-message";
import { CustomError, logger, NotFoundError } from "@gkeventsapp/common";
import { fetchRoomsRouter } from "./routes/fetch-rooms";
import { createConversationRouter } from "./routes/create-conversation";
import { fetchUsersRouter } from "./routes/fetch-users";
import { MySocket } from "./socket/my-socket";
import { ClientEvent } from "./socket/events/client-events";
import { handleSocketMessage } from "./socket/handlers/handle-socket-message";
import { currentSocketUser } from "./socket/middlewares/current-socket-user";
import { roomJoiner } from "./socket/middlewares/room-joiner";

export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.debug(`Something went wrong: ${error.message}`, )

    if (error instanceof CustomError) {
        return res.status(error.statusCode).send(
            error.serializeErrors()
        )
    }

    console.log(error);

    return res.status(400).send(
        [
            { message: "Something went wrong" }
        ]
    );
} 

const app = express();
const server = createServer(app)
const io = new Server(server, { allowEIO3: true });
//export let firstOne: string | undefined

io.use(currentSocketUser)
io.use(roomJoiner)
io.on("connection", (socket: MySocket) => {
    //if (!firstOne) {
    //    firstOne = socket.id
    //}
    io.allSockets().then(sockets => console.log(sockets))
    socket.on(ClientEvent.SEND, async (data) => {
        console.log(data);
        let message = JSON.parse(data)
        await handleSocketMessage(socket.roomId!, message, socket.currentUser!, socket)
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

