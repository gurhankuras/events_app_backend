import mongoose from "mongoose";
import { UserDoc } from "./user";


interface ConversationAttributes {
    participants: UserDoc[];
}

interface ConversationDoc extends mongoose.Document {
    participants: UserDoc[];
    lastMessage: {
        text: string;
        sender: UserDoc;
        sentAt: Date;
    };
    createdAt: Date
}

interface ConversationModel extends mongoose.Model<ConversationDoc> {
    build(attrs: ConversationAttributes): ConversationDoc
}



/*

const subdocumentSchema = new mongoose.Schema({
  child: {
    type: lastMessageSchema,
    default: () => ({})
  }
});
const Subdoc = mongoose.model('Subdoc', subdocumentSchema);

*/

const lastMessageSchema = new mongoose.Schema({
    text: String,
    sender: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    sentAt: Date
});

let ConversationSchema = new mongoose.Schema({
    lastMessage: {
        type: lastMessageSchema,
        required: false
    },

    participants: {
        type: [mongoose.Types.ObjectId],
        ref: 'User',
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