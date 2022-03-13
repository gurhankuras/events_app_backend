import mongoose from "mongoose";


interface ChatMessageAttributes {
    sender: {
        id: mongoose.Types.ObjectId,
        name: string;
        image: string;
    };
    text: string;
    sentAt: Date;
    conversationId: mongoose.Types.ObjectId;
}

interface ChatMessageDoc extends mongoose.Document {
    sender: {
        id: mongoose.Types.ObjectId,
        name: string;
        image: string;
    };
    text: string;
    sentAt: Date;
    conversationId: mongoose.Types.ObjectId;
}

interface ChatMessageModel extends mongoose.Model<ChatMessageDoc> {
    build(attrs: ChatMessageAttributes): ChatMessageDoc
}



let ChatMessageSchema = new mongoose.Schema({
    sender: {
        type: {
            id: mongoose.Types.ObjectId,
            name: String,
            image: String
        },
        required: true,
    },
    text: {
        type: String
    },
    sentAt: {
        type: Date,
        required: true
    },
    conversationId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        },
        versionKey: false,
    }
})

ChatMessageSchema.statics.build = function (attrs: ChatMessageAttributes) {
    return new ChatMessage(attrs);
}


const ChatMessage = mongoose.model<ChatMessageDoc, ChatMessageModel>('ChatMessage', ChatMessageSchema)


export { ChatMessage }