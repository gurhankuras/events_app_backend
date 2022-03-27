import mongoose from "mongoose"
import { ChatBucket } from "../../models/chat-bucket"
import { GetSortedByCreationParams, Message, MessageRepository } from "./base/MessageRepository"

type _GetSortedByCreationParams = {
    filter: any,
    limit?: number,
    page?: number, 
}

class MongoDBMessageRepository implements MessageRepository {
    async paginatedByCreation({roomId, options = {limit: 1, page: 0}}: GetSortedByCreationParams) {
        const {limit, page, after} = options
        
        let filter: any = { roomId: new mongoose.Types.ObjectId(roomId) }
        if (after) {
            filter.creationDate = {$gt: after}
        }

        return this._paginatedByCreation({filter: filter, limit: limit, page: page})
    }

    async add(roomId: string, message: Message) {
        const result = ChatBucket.updateOne({roomId: new mongoose.Types.ObjectId(roomId), count: { $lt: 30 }, creationDate: {$lt: message.sentAt}}, {
            "$push": {
                "messages": {
                    sender: new mongoose.Types.ObjectId(message.sender),
                    sentAt: message.sentAt,
                    text: message.text,
                    image: message.image,
                }
            },
                "$inc": {"count": 1},
                "$setOnInsert": { "creationDate": message.sentAt }
            },
            {upsert: true}
        )
        return result
    }

    private async _paginatedByCreation({filter, limit = 1, page = 0}: _GetSortedByCreationParams) {
        const chats = await ChatBucket.find(filter)
        .sort({creationDate: -1})
        .skip(page * limit)
        .limit(limit)
        .populate('messages.sender')

        return chats
    }
}

export const messageRepository = new MongoDBMessageRepository()