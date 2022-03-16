import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app';
import { Conversation, ConversationDoc } from '../../models/conversation';
import jwt from 'jsonwebtoken'

function signIn(): string {
    const userJwt = jwt.sign({
          id: userId,
          email: email
    }, process.env.JWT_KEY!, { expiresIn: 60 * 60 })
    return userJwt
  }

const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860eb'
const anotherUserId = '507f191e810c19729de860ec'
const email = 'test@test.com'

it("should return 401 when token not provided", async () => {
    await request(app)
    .get(`/api/chat/rooms?userId=${userId}`)
    .send()
    .expect(401);
})

it("should return 401 when authorized user tries to access other user's messages", async () => {
    await request(app)
    .get(`/api/chat/rooms?userId=${otherUserId}`)
    .set('access-token', signIn())
    .send()
    .expect(401);
})

it("should return empty array when there is no room the user in", async () => {
    const response = await makeRequest()
    expect(response.body).toEqual([])
})

it("should return array of rooms when there is at least one room the user in", async () => {
    await makeRoom(userId, otherUserId);
    const response = await makeRequest()
    expect(response.body.length).toEqual(1)
})

it("should return array of rooms when there is at least one room the user in", async () => {
    await makeRoom(userId, otherUserId);
    await makeRoom(userId, anotherUserId);
    const response = await makeRequest()
    expect(response.body.length).toEqual(2)
})

describe("should return array of rooms that sorted by lastMessage date if any otherwise sorted by room creation date", () => {
    it("without last messages", async () => {
        const {firstRoom, secondRoom}  = await makeTwoRoom()
        const response = await makeRequest()
        const rooms = response.body as Array<any>
    
        expect(rooms.map(r => r.id)).toEqual([id(secondRoom), id(firstRoom)])
    })

    it("one with last message, one without last message", async () => {
        const {firstRoom, secondRoom}  = await makeTwoRoom()
        await addLastMessage(firstRoom, {nowPlus: 5})
    
        const response = await makeRequest()
        const rooms = response.body as Array<any>
    
        expect(rooms.map(r => r.id)).toEqual([id(firstRoom), id(secondRoom)])
    })

    it("with last messages", async () => {
        const {firstRoom, secondRoom}  = await makeTwoRoom()
        await addLastMessage(firstRoom, {nowPlus: 5})
        await addLastMessage(secondRoom, {nowPlus: 2})
    
        const response = await makeRequest()
        const rooms = response.body as Array<any>

        expect(rooms.map(r => r.id)).toEqual([id(firstRoom), id(secondRoom)])
    })
})

async function makeRoom(userId: string, otherUserId: string) {
    const room = Conversation.build({participants: [
        new mongoose.Types.ObjectId(userId),
        new mongoose.Types.ObjectId(otherUserId),
    ]})
    const savedRoom = await room.save()
    return savedRoom
}



function id(room: ConversationDoc): string {
    return room._id.toString()
}

async function makeTwoRoom() {
    const firstRoom = await makeRoom(userId, otherUserId);
    const secondRoom = await makeRoom(userId, anotherUserId);
    return {firstRoom, secondRoom}
}

// makes a request to fetch current signed-in  users's messages
async function makeRequest() {
    const token = signIn()
    const response = await request(app)
                .get(`/api/chat/rooms?userId=${userId}`)
                .set('access-token', token)
                .send()
                .expect(200);
    return response
}


async function addLastMessage(room: ConversationDoc, { nowPlus = 0 }: { nowPlus: number }) {
    let milliseconds = new Date().getTime()
    const date = new Date(milliseconds + (nowPlus * 1000))

    room.lastMessage = {
        senderName: 'Amanda',
        sentAt: date,
        text: 'text'
    }
    
    await room.save();
}