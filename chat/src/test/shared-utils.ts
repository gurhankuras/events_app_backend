import mongoose from 'mongoose';
import jwt from 'jsonwebtoken'
import { User, UserDoc } from '../models/user';
import { Conversation, ConversationDoc } from '../models/conversation';
import { ChatBucket } from '../models/chat-bucket';


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

export async function makeUser(userId: string, name: string = "Gurhan"): Promise<UserDoc> {
    const user = User.build({
        _id: userId,
        name: name
    })

    await user.save()
    return user;
}





export async function makeTwoRoom() {
    const user = await makeUser(userId);
    const otherUser = await makeUser(otherUserId);
    const anotherUser = await makeUser(anotherUserId);

    const firstRoom = await makeRoom(user, otherUser);
    const secondRoom = await makeRoom(user, anotherUser);
    return {firstRoom, secondRoom}
}



export function iso(date: Date): string {
    return date.toISOString()
}



export function nowSecondsLater(seconds: number) {
    return secondsLater(new Date(), seconds)
}
export function secondsLater(date: Date, seconds: number) {
    let milliseconds = date.getTime()
    return new Date(milliseconds + (seconds * 1000))
}

export async function addLastMessage(room: ConversationDoc, { nowPlus = 0 }: { nowPlus: number }) {
    let milliseconds = new Date().getTime()
    const date = new Date(milliseconds + (nowPlus * 1000))

    room.lastMessage = {
        sender: User.build({_id: userId, name: 'Amanda'}),
        sentAt: date,
        text: 'text'
    }
    
    await room.save();
}


export async function makeABucketWith(roomId: string, senderId: string, n: number) {
    const date = new Date()
    let bucket = ChatBucket.build({
        roomId: new mongoose.Types.ObjectId(roomId), 
        creationDate: date
    })

    const savedBucket = await bucket.save()
    let messages = []
    messages.push({
        sender: senderId,
        sentAt: date,
        text: "Demo",
    })
    for (let i = 1; i < n; ++i) {
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