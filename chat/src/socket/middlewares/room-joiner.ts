import { logger } from "@gkeventsapp/common"
import { ExtendedError } from "socket.io/dist/namespace"
import { io } from "../../app"
import { Conversation } from "../../models/conversation"
import { roomRepository } from "../../services/repositories/MongoDBRoomRepository"
import { ServerEvent } from "../events/server-events"
import { MySocket } from "../my-socket"

export async function roomJoiner(socket: MySocket, next: (err?: ExtendedError | undefined) => void) {
    logger.info("Entered roomJoiner")
    const roomId = socket.roomId
    const currentUserId = socket.currentUser!.id as string
   
    
    if (roomId) {
        const room = await Conversation.findById(roomId)
        //console.log(room)
        const found = room?.participants.find((user) => {
            // @ts-ignore
            let id = <string> user;
            return id === currentUserId
        })
        console.log(room)
        console.log(found);
        if (found) {
            socket.join(roomId)
            return next()
        }
        console.log("DEAD END #1")
        return next()
    }
    
    console.log("DEAD END #2")
    return next()
}