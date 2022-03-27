import request from 'supertest'
import { app } from '../../app';
import { ChatBucket } from '../../models/chat-bucket';
import { Conversation, ConversationDoc } from '../../models/conversation';
import { UserDoc } from '../../models/user';
import { makeABucketWith, makeValidBody } from '../../test/new-message-utils';
import { makeRoom, makeUser, signIn } from '../../test/shared-utils';

const userId = '507f191e810c19729de860ec'
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


    it("should return 400 when text is invalid", async () => {
        
        let body = makeValidBody();

         // @ts-ignore
         body.text = undefined
         await request(app)
                 .post(`/api/chat/rooms/${aRoomId}/messages`)
                 .send(body)
                 .expect(400);
    })

    it("should return 404 when roomId is not found as param", async () => {
        let body = makeValidBody();

         await request(app)
                 .post(`/api/chat/rooms/messages`)
                 .send(body)
                 .expect(404);
    })
})


describe('with auth and valid body/query/params', () => {
    let token: string | null
    let otherUser: UserDoc | null
    let user: UserDoc | null
    let room: ConversationDoc | null
    let body: {text: string}

    beforeEach(async () => {
        token = signIn()
        user = await makeUser(userId);
        otherUser = await makeUser(otherUserId)
        room = await makeRoom(user, otherUser)
        body = makeValidBody()
    })

    afterEach(() => {
        token = null
        user = null
        otherUser = null
        room = null
    })

    it("should return 401 when the user is not in the room what he/she want to send a message to", async () => {
        await request(app)
                .post(`/api/chat/rooms/${aRoomId}/messages`)
                .send(body)
                .expect(401);
    })
    
    it("should return 200 when the user can send a message to the room what he/she refers to", async () => {
        await request(app)
                .post(`/api/chat/rooms/${room!.id}/messages`)
                .set('access-token', token!)
                .send(body)
                .expect(201);
    })
    
    it("should save message the user sent", async () => {

        await request(app)
                .post(`/api/chat/rooms/${room!._id.toString()}/messages`)
                .set('access-token', token!)
                .send(body)
                .expect(201);
    
        const messages = await ChatBucket.findOne({roomId: room!._id})
        const messageUserSent = messages?.messages[0] 
        
        expect(messageUserSent?.sender.toString()).toEqual(userId)
        expect(messageUserSent?.text).toEqual(body.text)
    })
    
    it("should save the message as conversation's last message", async () => {

      
        await request(app)
                .post(`/api/chat/rooms/${room!._id.toString()}/messages`)
                .set('access-token', token!)
                .send(body)
                .expect(201);
    
        const conversation = await Conversation.findOne({_id: room!._id})
        const lastMessage = conversation?.lastMessage
    
        // TODO: when fixed schema of database make more expectation here and refactor as a new expect function
        expect(lastMessage).toBeDefined()
        expect(lastMessage?.text).toEqual(body.text)
    })

    it("should create a bucket and add this message to the bucket when there are no buckets of room", async () => {
        
        const messagesBeforeRequest = await ChatBucket.findOne({roomId: room!._id})
        expect(messagesBeforeRequest).toBeNull()

        await request(app)
                .post(`/api/chat/rooms/${room!._id.toString()}/messages`)
                .set('access-token', token!)
                .send(body)
                .expect(201);
    

        const messages = await ChatBucket.findOne({roomId: room!._id})
        
        expect(messages).toBeDefined()
        expect(messages?.count).toEqual(1)
    })


    it("should increment bucket's count when new message added", async () => {

        await makeABucketWith(room!._id.toString(), userId, 2);

        await request(app)
                .post(`/api/chat/rooms/${room!._id.toString()}/messages`)
                .set('access-token', token!)
                .send(body)
                .expect(201);
    

        const messages = await ChatBucket.findOne({roomId: room!._id})
        
        expect(messages).toBeDefined()
        expect(messages?.count).toEqual(3)
    })

    it("should create a new bucket when a bucket reached its capacity", async () => {
        const BUCKET_CAPACITY = 30

        await makeABucketWith(room!._id.toString(), userId, BUCKET_CAPACITY);

        await request(app)
                .post(`/api/chat/rooms/${room!._id.toString()}/messages`)
                .set('access-token', token!)
                .send(body)
                .expect(201);
    

        const messages = await ChatBucket.find({roomId: room!._id})
        
        expect(messages?.length).toEqual(2)
        expect(messages[1].count).toEqual(1)
    })

    it("sets recent message of room after sending first message to room", async () => {

        await request(app)
                .post(`/api/chat/rooms/${room!._id.toString()}/messages`)
                .set('access-token', token!)
                .send(body)
                .expect(201);
    
        const conv = await Conversation.findById(room!._id)
        expect(conv?.lastMessage).toBeDefined()
    })

})

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