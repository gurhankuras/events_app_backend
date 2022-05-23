import { io } from "../../app"
import { Conversation } from "../../models/conversation"
import { messageRepository } from "../../services/repositories/MongoDBMessageRepository"
import { roomRepository } from "../../services/repositories/MongoDBRoomRepository"
import { ServerEvent } from "../events/server-events"
import { MySocket } from "../my-socket"
import { SocketUserPayload } from "../socket-user-payload"

export async function handleSocketMessage(roomId: string, message: any, user: SocketUserPayload, socket: MySocket) {
    const date = new Date()
    const savedMessage = await messageRepository.add(roomId, {text: message.text, sender: user.id, sentAt: date})
    console.log("ROOM ID: ", roomId);
    //console.log(savedMessage)
    await roomRepository.updateLastMessage(roomId, {text: message.text, senderId: user.id, sentAt: date})
    io.to(roomId).emit(ServerEvent.SEND, JSON.stringify(savedMessage))
    const room = await Conversation.findById(roomId)
    console.log("NIYE BURADA")
    console.log(room)
    console.log(ServerEvent.ROOM_UPDATED)

    /*
    if (firstOne) {
        const sent = io.to(firstOne).emit(ServerEvent.ROOM_UPDATED, JSON.stringify(room))
        console.log(sent)
    }
    */
  
}