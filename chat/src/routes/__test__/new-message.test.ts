import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app';
import { ChatBucket } from '../../models/chat-bucket';
import { Conversation } from '../../models/conversation';
import { makeRoom, makeUser } from '../../test/utils';

const userId = '507f191e810c19729de860ea'
const aRoomId = '6231dac6aba6adb436c4988c'
const otherUserId = '507f191e810c19729de860eb'

// TODO: after adding auth fix the tests

describe('with invalid body/query/params', () => {
    it("should return 400 when empty body is sent", async () => {
        await request(app)
                .post(`/api/chat/rooms/${aRoomId}/messages`)
                .send({})
                .expect(400);
    })

    it("should return 400 when sender is invalid", async () => {
        let body = makeValidBodyWith(userId);
        
        body.sender = ''
        await request(app)
                .post(`/api/chat/rooms/${aRoomId}/messages`)
                .send(body)
                .expect(400);

        // I bypass the typescript type system because I need to test that what if user sends from another type
        // @ts-ignore
        body.sender = 12
        await request(app)
                .post(`/api/chat/rooms/${aRoomId}/messages`)
                .send(body)
                .expect(400);

         // @ts-ignore
         body.sender = undefined
         await request(app)
                 .post(`/api/chat/rooms/${aRoomId}/messages`)
                 .send(body)
                 .expect(400);
    })

    it("should return 400 when text is invalid", async () => {
        let body = makeValidBodyWith(userId);

         // @ts-ignore
         body.text = undefined
         await request(app)
                 .post(`/api/chat/rooms/${aRoomId}/messages`)
                 .send(body)
                 .expect(400);
    })

    it("should return 404 when roomId is not found as param", async () => {
        let body = makeValidBodyWith(userId);

         await request(app)
                 .post(`/api/chat/rooms/messages`)
                 .send(body)
                 .expect(404);
    })
})


describe('with valid body/query/params', () => {
    it("should return 401 when the user is not in the room what he/she want to send a message to", async () => {
        let body = makeValidBodyWith(userId);
        let response = await request(app)
                .post(`/api/chat/rooms/${aRoomId}/messages`)
                .send(body)
                .expect(401);
    })
    
    it("should return 200 when the user can send a message to the room what he/she refers to", async () => {
        let body = makeValidBodyWith(userId);
        let user = await makeUser(userId);
        let otherUser = await makeUser(otherUserId)
        let room = await makeRoom(user, otherUser)        
        await request(app)
                .post(`/api/chat/rooms/${room._id.toString()}/messages`)
                .send(body)
                .expect(200);
    })
    
    it("should save message the user sent", async () => {
        let body = makeValidBodyWith(userId);
        let user = await makeUser(userId);
        let otherUser = await makeUser(otherUserId)
        let room = await makeRoom(user, otherUser)

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
        let user = await makeUser(userId);
        let otherUser = await makeUser(otherUserId)
        let room = await makeRoom(user, otherUser)
      
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

    it("should create a bucket and add this message to the bucket when there are not any related bucket", async () => {
        let body = makeValidBodyWith(userId);
        let user = await makeUser(userId);
        let otherUser = await makeUser(otherUserId)
        let room = await makeRoom(user, otherUser)
        
        const messagesBeforeRequest = await ChatBucket.findOne({roomId: room._id})
        expect(messagesBeforeRequest).toBeNull()

        await request(app)
                .post(`/api/chat/rooms/${room._id.toString()}/messages`)
                .send(body)
                .expect(200);
    

        const messages = await ChatBucket.findOne({roomId: room._id})
        
        expect(messages).toBeDefined()
        expect(messages?.count).toEqual(1)
    })


    it("should increment bucket's count when new message added", async () => {
        let body = makeValidBodyWith(userId);
        let user = await makeUser(userId);
        let otherUser = await makeUser(otherUserId)
        let room = await makeRoom(user, otherUser)
        let bucket = await makeABucketWith(room._id.toString(), userId, 2);

        await request(app)
                .post(`/api/chat/rooms/${room._id.toString()}/messages`)
                .send(body)
                .expect(200);
    

        const messages = await ChatBucket.findOne({roomId: room._id})
        
        expect(messages).toBeDefined()
        expect(messages?.count).toEqual(3)
    })

    it("should create a new bucket when a bucket reached its capacity", async () => {
        const BUCKET_CAPACITY = 30
        let body = makeValidBodyWith(userId);
        //let room = await makeARoomWithUser(userId);
        let user = await makeUser(userId);
        let otherUser = await makeUser(otherUserId)
        let room = await makeRoom(user, otherUser)

        let bucket = await makeABucketWith(room._id.toString(), userId, BUCKET_CAPACITY);

        await request(app)
                .post(`/api/chat/rooms/${room._id.toString()}/messages`)
                .send(body)
                .expect(200);
    

        const messages = await ChatBucket.find({roomId: room._id})
        
        expect(messages?.length).toEqual(2)
        expect(messages[1].count).toEqual(1)
    })

    it("sets recent message of room after sending first message to room", async () => {
        let body = makeValidBodyWith(userId);
        let user = await makeUser(userId);
        let otherUser = await makeUser(otherUserId)
        let room = await makeRoom(user, otherUser)

        await request(app)
                .post(`/api/chat/rooms/${room._id.toString()}/messages`)
                .send(body)
                .expect(200);
    

        const conv = await Conversation.findById(room._id)
        console.log(conv)
        //const bucket = await ChatBucket.findOne({roomId: room._id})
        expect(conv?.lastMessage).toBeDefined()
        //expect(bucket?.messages.length).toEqual(1)
    })

})


function makeValidBodyWith(sender: string) {
    return {
        sender: sender,
        text: 'text',
    }
}

/*
async function makeARoomWithUser(user: UserDoc) {
    const room = new Conversation({ participants: [
        new mongoose.Types.ObjectId(userId)
    ]})

    const savedRoom = await room.save()
    return savedRoom
}
*/



async function makeABucketWith(roomId: string, senderId: string, n: number) {
    const date = new Date()
    let bucket = ChatBucket.build({
        roomId: new mongoose.Types.ObjectId(roomId), 
        creationDate: date
    })

    const savedBucket = await bucket.save()
    let messages = []
    for (let i = 0; i < n; ++i) {
        messages.push({
            sender: new mongoose.Types.ObjectId(senderId),
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


describe('makeABucketWith', () => {
    it("messages's length should be equal to bucket count", async () => {
        let user = await makeUser(userId);
        let otherUser = await makeUser(otherUserId)
        let room = await makeRoom(user, otherUser)
        let bucket = await makeABucketWith(room._id.toString(), userId, 10);

        expect(bucket.messages.length).toEqual(bucket.count)

    })
})





// TODO: there are more tests related to conversation's last message and message