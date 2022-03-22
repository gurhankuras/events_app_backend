import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app';
import { Conversation, ConversationDoc } from '../../models/conversation';
import jwt from 'jsonwebtoken'
import { makeUser, signIn } from '../../test/utils';

const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860ea'


it("should return 401 when user do not send token", async () => {
    const token = signIn()
    const user = await makeUser(userId)
    
    const res = await request(app)
    .post(`/api/chat/conversation`)
    
    .send()
    .expect(401);
})

it("should return 201 when user exists", async () => {
    const token = signIn()
    const user = await makeUser(userId)

    const res = await request(app)
    .post(`/api/chat/conversation`)
    .set('access-token', token)
    .send()
    .expect(201);
})


it("should return 404 when user not exists", async () => {
    const token = signIn()
    const user = await makeUser(otherUserId)

    const res = await request(app)
    .post(`/api/chat/conversation`)
    .set('access-token', token)
    .send()
    .expect(404);
})

it("should return 201 with room info", async () => {
    const token = signIn()
    const user = await makeUser(userId)

    const res = await request(app)
    .post(`/api/chat/conversation`)
    .set('access-token', token)
    .send()
    .expect(201);

    const room = res.body
    console.log(room)
    expect(room.participants.length).toEqual(2)
    expect(room.participants.length).toEqual(2)
    expect(room.id).toBeDefined()

})