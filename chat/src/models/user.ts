import mongoose from "mongoose";


interface UserAttributes {
    _id: string;
    name: string;
    image?: string;
}

export interface UserDoc extends mongoose.Document {
    name: string;
    image: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttributes): UserDoc
}



let UserSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: false,
    },
},
{
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
        },
        versionKey: false,
    }
}
)

UserSchema.statics.build = function (attrs: UserAttributes) {
    return new User(attrs);
}


const User = mongoose.model<UserDoc, UserModel>('User', UserSchema)


export { User }