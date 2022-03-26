import mongoose from "mongoose";
import { Conversation, ConversationDoc } from "../../models/conversation";
import { User, UserDoc } from "../../models/user";
import { UserRepository, userRepository } from "./UserRepository";


export class UserNotFound extends Error {
    constructor() {
        super("User not found")
    }
}

export class RoomRepository {
    
    constructor(private userRepository: UserRepository) {

    }
    
    async createWithTwoUser(userId: string, otherUserId: string, populated: boolean = false) {
        const userTask = this.userRepository.findById(userId)
        const otherUserTask = this.userRepository.findById(otherUserId)
        
        const user = await userTask
        if (!user) {
            throw new UserNotFound()
        }

        const otherUser = await otherUserTask
        if (!otherUser) {
            throw new UserNotFound()
        }

        const room = 
        Conversation.build({
            participants: [
                user,
                otherUser   
            ]
        })

        const createWithTwoUserdRoom = await room.save()
        if (populated) {
            const populatedRoom = await createWithTwoUserdRoom.populate('participants')
            return populatedRoom.toJSON()
        }
        return createWithTwoUserdRoom.toJSON()
    }
}




export const roomRepository = new RoomRepository(userRepository) 