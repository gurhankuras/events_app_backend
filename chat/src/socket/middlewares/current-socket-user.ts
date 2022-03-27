// next: (err?: ExtendedError | undefined) => void) => void
import jwt from 'jsonwebtoken'

import { logger } from "@gkeventsapp/common";
import { ExtendedError } from "socket.io/dist/namespace";
import { MySocket } from "../my-socket";
import { SocketUserPayload } from '../socket-user-payload';

export function currentSocketUser(socket: MySocket, next: (err?: ExtendedError | undefined) => void) {
    logger.info('a socket arrived')
    const headers = socket.handshake.headers
    const roomId = headers['room'] as string
    const accessToken = headers['access-token'] as string

    try {
        let userPayload = jwt.verify(accessToken, process.env.JWT_KEY!) as SocketUserPayload
        socket.currentUser = userPayload
        socket.roomId = roomId
    } catch (error) {
        
    }
    logger.info(`connection access-token: ${headers['access-token']}\nroomId: ${headers['room']}`)
    if (roomId) {
        socket.join(roomId)
    }
    next()
}