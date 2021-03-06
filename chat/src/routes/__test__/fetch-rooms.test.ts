import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app';
import { Conversation, ConversationDoc } from '../../models/conversation';
import jwt from 'jsonwebtoken'
import { addLastMessage, makeRoom, makeTwoRoom, makeUser, signIn } from '../../test/shared-utils';


const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860eb'
const anotherUserId = '507f191e810c19729de860ed'
const email = 'test@test.com'

// makes a request to fetch current signed-in  users's messages
async function makeRequest() {
    const token = signIn()
    const response = await request(app)
                .get(`/api/chat/rooms`)
                .set('access-token', token)
                .send()
                .expect(200);
    return response
}

it("should return 401 when token not provided", async () => {
    await request(app)
    .get(`/api/chat/rooms`)
    .send()
    .expect(401);
})


it("should return empty array when there is no room the user in", async () => {
    const response = await makeRequest()
    expect(response.body).toEqual([])
})

it("should return array of rooms when there is at least one room the user in", async () => {
    const user = await makeUser(userId);
    const otherUser = await makeUser(otherUserId);
    await makeRoom(user, otherUser);
    const response = await makeRequest()
    expect(response.body.length).toEqual(1)
})

it("should return array of rooms when there is at least one room the user in", async () => {
    const {firstRoom, secondRoom} = await makeTwoRoom();
    const response = await makeRequest()
    expect(response.body.length).toEqual(2)
})

describe("should return array of rooms that sorted by lastMessage date if any otherwise sorted by room creation date", () => {
    it("without last messages", async () => {
        const {firstRoom, secondRoom}  = await makeTwoRoom()
        const response = await makeRequest()
        const rooms = response.body as Array<any>
    
        expect(rooms.map(r => r.id)).toEqual([secondRoom._id.toString(), firstRoom._id.toString()])
    })

    
    it("one with last message, one without last message", async () => {
        const {firstRoom, secondRoom}  = await makeTwoRoom()
        await addLastMessage(firstRoom, {nowPlus: 5})
    
        const response = await makeRequest()
        const rooms = response.body as Array<any>
    
        expect(rooms.map(r => r.id)).toEqual([firstRoom._id.toString(), secondRoom._id.toString()])
    })

    it("with last messages", async () => {
        const {firstRoom, secondRoom}  = await makeTwoRoom()
        await addLastMessage(firstRoom, {nowPlus: 5})
        await addLastMessage(secondRoom, {nowPlus: 2})
    
        const response = await makeRequest()
        const rooms = response.body as Array<any>

        expect(rooms.map(r => r.id)).toEqual([firstRoom._id.toString(), secondRoom._id.toString()])
    })
    
})


