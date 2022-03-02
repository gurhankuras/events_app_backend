const bcrypt = require("bcrypt");
import mongoose from "mongoose";


interface UserAttributes {
    email: string;
    password: string;
}

interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttributes): UserDoc
}



let userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true
    }
}, {
    toJSON: {
        transform(doc, ret) {
            ret.id = ret._id
            delete ret._id
            delete ret.password
        },
        versionKey: false,
    }
})

userSchema.statics.build = function (attrs: UserAttributes) {
    return new User(attrs);
}

userSchema.pre('save', async function(done) {
    if (this.isModified('password')) {
        const hashedPassword = await bcrypt.hash(this.get('password'), 10);
        this.set('password', hashedPassword)
    }

    done();
})

const User = mongoose.model<UserDoc, UserModel>('User', userSchema)


export { User }