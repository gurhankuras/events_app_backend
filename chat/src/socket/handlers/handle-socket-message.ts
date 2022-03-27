import { io } from "../../app"
import { messageRepository } from "../../services/repositories/MongoDBMessageRepository"
import { roomRepository } from "../../services/repositories/MongoDBRoomRepository"
import { ServerEvent } from "../events/server-events"
import { SocketUserPayload } from "../socket-user-payload"

export async function handleSocketMessage(roomId: string, message: any, user: SocketUserPayload) {
    const date = new Date()
    const savedMessage = await messageRepository.add(roomId, {text: message.text, sender: user.id, sentAt: date})
    console.log(savedMessage)
    await roomRepository.updateLastMessage(roomId, {text: message.text, senderId: user.id, sentAt: date})
    io.to(roomId).emit(ServerEvent.SEND, JSON.stringify(savedMessage))
}