import mongoose from "mongoose";


interface ConversationAttributes {
    participants: mongoose.Types.ObjectId[];
}

interface ConversationDoc extends mongoose.Document {
    participants: mongoose.Types.ObjectId[];
    lastMessage: {
        text: string;
        senderName: string;
        sentAt: Date;
    };
    createdAt: Date
}

interface ConversationModel extends mongoose.Model<ConversationDoc> {
    build(attrs: ConversationAttributes): ConversationDoc
}



let ConversationSchema = new mongoose.Schema({
    lastMessage: {
        type: {
            text: String,
            senderName: String,
            sentAt: Date
        },
        required: false
    },

    participants: {
        type: [String],
        required: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        },
        versionKey: false,
    },
    
})

ConversationSchema.statics.build = function (attrs: ConversationAttributes) {
    return new Conversation(attrs);
}


const Conversation = mongoose.model<ConversationDoc, ConversationModel>('Conversation', ConversationSchema)


export { Conversation, ConversationDoc }