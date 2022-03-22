import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'
import { User, UserDoc } from '../models/user';
import { Conversation, ConversationDoc } from '../models/conversation';


const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860eb'
const anotherUserId = '507f191e810c19729de860ed'
const email = 'test@test.com'


export function signIn(): string {
    const userJwt = jwt.sign({
          id: userId,
          email: email
    }, process.env.JWT_KEY!, { expiresIn: 60 * 60 })
    return userJwt
  }



export async function makeRoom(user: UserDoc, otherUser: UserDoc): Promise<ConversationDoc> {
    let room = Conversation.build({
        participants: [
            user,
            otherUser    
        ]
    })
    const savedRoom = await room.save()
    return savedRoom
}

export async function makeUser(userId: string): Promise<UserDoc> {
    const user = User.build({
        _id: new mongoose.Types.ObjectId(userId),
        name: "Gurhan"
    })

    await user.save()
    return user;
}



export function id(room: mongoose.Document): string {
    return room._id.toString()
}

export async function makeTwoRoom() {
    const user = await makeUser(userId);
    const otherUser = await makeUser(otherUserId);
    const anotherUser = await makeUser(anotherUserId);

    const firstRoom = await makeRoom(user, otherUser);
    const secondRoom = await makeRoom(user, anotherUser);
    return {firstRoom, secondRoom}
}

export function ids(docs: mongoose.Document[]): string[] {
    return docs.map(doc => id(doc))
}

export function iso(date: Date): string {
    return date.toISOString()
}



export async function addLastMessage(room: ConversationDoc, { nowPlus = 0 }: { nowPlus: number }) {
    let milliseconds = new Date().getTime()
    const date = new Date(milliseconds + (nowPlus * 1000))

    room.lastMessage = {
        sender: User.build({_id: new mongoose.Types.ObjectId(userId), name: 'Amanda'}),
        sentAt: date,
        text: 'text'
    }
    
    await room.save();
}
