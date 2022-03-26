import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app';
import { Conversation, ConversationDoc } from '../../models/conversation';
import jwt from 'jsonwebtoken'
import { makeUser, signIn } from '../../test/shared-utils';

const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860ea'
const anotherUserId = '507f191e810c19729de860ed'

it("should return 400 when not sending other participant's id in body", async () => {
    const token = signIn()
    const user = await makeUser(userId)
    const otherUser = await makeUser(otherUserId)

    const res = await request(app)
    .post(`/api/chat/conversation`)
    .set('access-token', token)
    .send()
    .expect(400);
})

it("should return 401 when user do not send token", async () => {
    const token = signIn()
    const user = await makeUser(userId)
    const otherUser = await makeUser(otherUserId)

    const res = await request(app)
    .post(`/api/chat/conversation`)
    .send({
        userId: otherUser.id 
    })
    .expect(401);
})

it("should return 201 when user exists", async () => {
    const token = signIn()
    const user = await makeUser(userId)
    const otherUser = await makeUser(otherUserId)

    const res = await request(app)
    .post(`/api/chat/conversation`)
    .set('access-token', token)
    .send({
        userId: otherUser.id 
    })
    .expect(201);
})


it("should return 404 when user not exists", async () => {
    const token = signIn()
    const user = await makeUser(userId)

    const res = await request(app)
    .post(`/api/chat/conversation`)
    .set('access-token', token)
    .send({
        userId: otherUserId
    })
    .expect(404);
})



it("should return 201 with room info", async () => {
    const token = signIn()
    const user = await makeUser(userId)
    const otherUser = await makeUser(otherUserId)

    const res = await request(app)
    .post(`/api/chat/conversation`)
    .set('access-token', token)
    .send({
        userId: otherUser.id 
    })
    .expect(201);

    const room = res.body
    expect(room.participants.length).toEqual(2)
    expect(room.participants.length).toEqual(2)
    expect(room.id).toBeDefined()

})