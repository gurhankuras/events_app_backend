import mongoose from "mongoose"
import { ChatBucket } from "../models/chat-bucket"

export function makeValidBody() {
    return {
        text: 'text',
    }
}

export async function makeABucketWith(roomId: string, senderId: string, n: number) {
    const date = new Date()
    let bucket = ChatBucket.build({
        roomId: new mongoose.Types.ObjectId(roomId), 
        creationDate: date
    })

    const savedBucket = await bucket.save()
    let messages = []
    for (let i = 0; i < n; ++i) {
        messages.push({
            sender: senderId,
            sentAt: new Date(),
            text: "Demo",
        })
    }
    // @ts-ignore
    savedBucket.messages =  messages
    savedBucket.count = n
    const finalBucket = await savedBucket.save()
    return finalBucket
}
