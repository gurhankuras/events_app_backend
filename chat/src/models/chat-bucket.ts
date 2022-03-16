/*
{
    _id: "conversationId_1"
    messages: [
       {
        sender: "3dsfd343",
        sentAt: ISODate("2019-01-31T10:00:00.000Z")
        text: ""
       },
       {
        sender: "3dsfd343",
        sentAt: ISODate("2019-01-31T10:00:00.000Z")
        text: ""
       },
       {
        sender: "3dsfd343",
        sentAt: ISODate("2019-01-31T10:00:00.000Z")
        text: ""
       }
    ],
   count: 30
} 
*/

import mongoose from "mongoose";


interface ChatBucketAttributes {
    roomId: mongoose.Types.ObjectId,
    creationDate: Date;
}

interface ChatBucketDoc extends mongoose.Document {
    messages: {
        sender: mongoose.Types.ObjectId;
        text: string;
        sentAt: Date;
        image: string;
    }[];
    creationDate: Date;
    count: number;
    roomId: mongoose.Types.ObjectId,

}

interface ChatBucketModel extends mongoose.Model<ChatBucketDoc> {
    build(attrs: ChatBucketAttributes): ChatBucketDoc
}



let ChatBucketSchema = new mongoose.Schema({
    roomId: {
        type: mongoose.Types.ObjectId,
        required: true
    },

    messages: {
        type: [{
            sender: mongoose.Types.ObjectId,
            text: String,
            sentAt: Date,
            image: String
        }],
        required: false,
        default: []
    },
    count: {
        type: Number,
        required: false,
        default: 0,
    },
    creationDate: {
        type: Date,
        //required: true
    }
})

ChatBucketSchema.statics.build = function (attrs: ChatBucketAttributes) {
    return new ChatBucket(attrs);
}


const ChatBucket = mongoose.model<ChatBucketDoc, ChatBucketModel>('ChatBucket', ChatBucketSchema)


export { ChatBucket }