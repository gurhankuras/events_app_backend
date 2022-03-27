import mongoose from "mongoose"
import { ChatBucket } from "../../models/chat-bucket"
import { GetSortedByCreationParams, Message, MessageRepository } from "./base/MessageRepository"
import { randomBytes } from 'crypto'
import { NotFoundError } from "@gkeventsapp/common"
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
/*
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
    */

    async add(roomId: string, message: Message) {
        // TODO: instead of nonce, generate objectid and assign 
        const nonce = randomBytes(5).toString('hex');

        const doc = await ChatBucket.findOneAndUpdate({roomId: new mongoose.Types.ObjectId(roomId), count: { $lt: 30 }, creationDate: {$lt: message.sentAt}}, {
            "$push": {
                "messages": {
                    sender: new mongoose.Types.ObjectId(message.sender),
                    sentAt: message.sentAt,
                    text: message.text,
                    image: message.image,
                    nonce: nonce
                }
            },
                "$inc": {"count": 1},
                "$setOnInsert": { "creationDate": message.sentAt }
            },
            {
                upsert: true,
                new: true,
                fields: {'messages': 1},
            }
        ).populate('messages.sender')
        const messages = doc.toJSON().messages
        for(let i = messages.length - 1; i >= 0; --i) {
            // @ts-ignore
            if (messages[i].nonce == nonce) {
                return messages[i]
            }
        }
        return null;        
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