import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app';
import { ChatBucket } from '../../models/chat-bucket';
import { Conversation } from '../../models/conversation';

const userId = '507f191e810c19729de860ea'
const aRoomId = '6231dac6aba6adb436c4988c'
const email = 'test@test.com'

/*
function signIn(): string {
  const userJwt = jwt.sign({
        id: id,
        email: email
  }, process.env.JWT_KEY!, { expiresIn: 60 * 60 })
  return userJwt
}
*/

// TODO: after adding auth fix the tests

async function makeARoomWithUser(userId: string) {
    const room = new Conversation({ participants: [
        new mongoose.Types.ObjectId(userId)
    ]})

    const savedRoom = await room.save()
    return savedRoom
}

function makeValidBodyWith(sender: string) {
    return {
        sender: sender,
        text: 'text',
    }
}

it("should return 400 error when empty body is sent", async () => {
    let response = await request(app)
            .post(`/api/chat/rooms/${aRoomId}/messages`)
            .send({})
            .expect(400);
    console.log(response.body)
})

it("should return 401 when the user is not in the room what he/she want to send a message to", async () => {
    let body = makeValidBodyWith(userId);
    let response = await request(app)
            .post(`/api/chat/rooms/${aRoomId}/messages`)
            .send(body)
            .expect(401);
    console.log(response.body)
})

it("should return 200 when the user can send a message to the room what he/she refers to", async () => {
    let body = makeValidBodyWith(userId);
    let room = await makeARoomWithUser(userId);
    console.log(room)
    console.log(room._id)
    let response = await request(app)
            .post(`/api/chat/rooms/${room._id.toString()}/messages`)
            .send(body)
            .expect(200);
    console.log(response.body)
})

it("should save message the user sent", async () => {
    let body = makeValidBodyWith(userId);
    let room = await makeARoomWithUser(userId);
    console.log(room)
    console.log(room._id)
    await request(app)
            .post(`/api/chat/rooms/${room._id.toString()}/messages`)
            .send(body)
            .expect(200);

    const messages = await ChatBucket.findOne({roomId: room._id})
    const messageUserSent = messages?.messages[0] 

    expect(messageUserSent?.sender.toString()).toEqual(userId)
    expect(messageUserSent?.text).toEqual(body.text)
})

it("should save the message as conversation's last message", async () => {
    let body = makeValidBodyWith(userId);
    let room = await makeARoomWithUser(userId);
    console.log(room)
    console.log(room._id)
    await request(app)
            .post(`/api/chat/rooms/${room._id.toString()}/messages`)
            .send(body)
            .expect(200);

    const conversation = await Conversation.findOne({_id: room._id})
    const lastMessage = conversation?.lastMessage

    // TODO: when fixed schema of database make more expectation here and refactor as a new expect function
    expect(lastMessage).toBeDefined()
    expect(lastMessage?.text).toEqual(body.text)
})

// TODO: there are more tests related to conversation's last message and message