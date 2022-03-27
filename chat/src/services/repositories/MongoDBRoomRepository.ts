import mongoose from "mongoose";
import { Conversation } from "../../models/conversation";
import { LastMessage, RoomRepository } from "./base/RoomRepository";
import { RoomNotFound } from "./errors/RoomNotFound";
import { UserNotFound } from "./errors/UserNotFound";
import { UserRepository, userRepository } from "./UserRepository";


export class MongoDBRoomRepository implements RoomRepository {
    
    constructor(private userRepository: UserRepository) {

    }

    async getByLatest(userId: string, options: {participants: boolean, sender: boolean}) {
        const query = Conversation.find( {
            participants: { $all: [ new mongoose.Types.ObjectId(userId) ] } 
        })
        .sort({"lastMessage.sentAt": -1, createdAt: -1})

        if (options.participants) {
            query.populate('participants')
        }
        if (options.sender) {
            query.populate('lastMessage.sender')
        }

        return query
    }

    /**
     * 
     * @param roomId The id of room to be updated 
     * @param message The message that the user sent
     * @returns update operation's result
     */
    async updateLastMessage(roomId: string, message: LastMessage) {
        let conversation = await Conversation.findOne( {
            _id: roomId,  
            participants: { $all: [ new mongoose.Types.ObjectId(message.senderId) ] } 
        })
    
        if (!conversation) {
            throw new RoomNotFound(roomId, message.senderId);
        }
     
        // TODO: merge finding and updating conversation
        let b = await Conversation.updateOne({_id: new mongoose.Types.ObjectId(roomId)}, {
            lastMessage: {
                sender: new mongoose.Types.ObjectId(message.senderId),
                sentAt: message.sentAt,
                text: message.text
            }
        })

        return b
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




export const roomRepository = new MongoDBRoomRepository(userRepository) 