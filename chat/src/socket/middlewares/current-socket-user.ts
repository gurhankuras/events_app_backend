// next: (err?: ExtendedError | undefined) => void) => void
import jwt from 'jsonwebtoken'

import { logger, NotFoundError } from "@gkeventsapp/common";
import { ExtendedError } from "socket.io/dist/namespace";
import { MySocket } from "../my-socket";
import { SocketUserPayload } from '../socket-user-payload';
import { RoomNotFound } from '../../services/repositories/errors/RoomNotFound';
import { roomRepository } from '../../services/repositories/MongoDBRoomRepository';
import { Conversation } from '../../models/conversation';
import { io } from '../../app';
import { ServerEvent } from '../events/server-events';


export function currentSocketUser(socket: MySocket, next: (err?: ExtendedError | undefined) => void) {
    logger.info("Entered currentSocketUser")
    const headers = socket.handshake.headers
    const roomId = headers['room'] as string | undefined
    const accessToken = headers['access-token'] as string | undefined
    const roomCreationRequestWith = headers['with'] as string | undefined
    logger.info(`connection access-token: ${headers['access-token']}\nroomId: ${headers['room']}`)
    if (accessToken) {
        try {
            let userPayload = jwt.verify(accessToken, process.env.JWT_KEY!) as SocketUserPayload
            socket.currentUser = userPayload
            socket.roomId = roomId
            socket.roomCreationRequestWith = roomCreationRequestWith
            return next()
        } catch (error) {
            console.log(error)
            return next(new NotFoundError())
        }
    }    
}

