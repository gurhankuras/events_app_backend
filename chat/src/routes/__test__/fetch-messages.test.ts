import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app';
import { Conversation } from '../../models/conversation';
import { ChatBucket } from '../../models/chat-bucket';

const aRoomId = '6231dac6aba6adb436c4988c'
const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860eb'


describe('request validation errors', () => {
    it("should return 400 when sending invalid 'after' query", async () => {
        function makeURL(after: string) {
            return `/api/chat/rooms/${aRoomId}/messages?after=${after}`
        }

        // date format is not ISO
        // @ts-ignore
        var url = makeURL(new Date())
        await request(app)
                .get(url)
                .send()
                .expect(400);

        // date is empty
        var url = makeURL('')
        await request(app)
                .get(url)
                .send()
                .expect(400);
    })

    it("should return 400 when sending invalid 'page' query", async () => {
        function makeURL(page: any) {
            return `/api/chat/rooms/${aRoomId}/messages?page=${page}`
        }

        var url = makeURL(-1)
        await request(app)
                .get(url)
                .send()
                .expect(400);

        var url = makeURL('dummy')
        await request(app)
                .get(url)
                .send()
                .expect(400);
    })

    it("should return 400 when sending invalid 'limit' query", async () => {
        function makeURL(limit: any) {
            return `/api/chat/rooms/${aRoomId}/messages?limit=${limit}`
        }

        var url = makeURL(0)
        await request(app)
                .get(url)
                .send()
                .expect(400);

        var url = makeURL('dummy')
        await request(app)
                .get(url)
                .send()
                .expect(400);
    })
    
})

// TODO: add auth and related tests
describe('auth errors', () => {
    it("should return 200 with empty array when has no messages yet", async () => {
        const room = await makeRoom(userId, otherUserId);
        
        const response = await request(app)
                .get(`/api/chat/rooms/${id(room)}/messages`)
                .send()
                .expect(200);
    
        expect(response.body).toEqual([])
    })
})

describe('in controller', () => {
    it("should return 200 with empty array when has no messages yet", async () => {
        const room = await makeRoom(userId, otherUserId);
        
        const response = await request(app)
                .get(`/api/chat/rooms/${id(room)}/messages`)
                .send()
                .expect(200);
    
        expect(response.body).toEqual([])
    })
    
    it("should return 200 with empty array when has no messages yet", async () => {
        const room = await makeRoom(userId, otherUserId);
        
        await request(app)
            .post(`/api/chat/rooms/${id(room)}/messages`)
            .send({
                sender: userId,
                text: 'text'
            })
            .expect(200);
    
        const response = await request(app)
                .get(`/api/chat/rooms/${id(room)}/messages`)
                .send()
                .expect(200);
    
        const buckets = response.body as Array<any> 
        expect(buckets.length).toEqual(1)
    })
    
    it("should return 200 with an array containing only one bucket that is last when not sending queries (default)", async () => {
        const firstBucket = await makeABucketWith(aRoomId, userId, 30)
        const secondBucket = await makeABucketWith(aRoomId, userId, 30)
       
    
        const response = await request(app)
                .get(`/api/chat/rooms/${aRoomId}/messages`)
                .send()
                .expect(200);
      
        const buckets = response.body as Array<any> 
    
        expect(buckets.length).toEqual(1)
        expect(id(buckets[0])).toEqual(id(secondBucket))
    })
    
    it("should return 200 with buckets sorted by creation date", async () => {
        const firstBucket = await makeABucketWith(aRoomId, userId, 30)
        const secondBucket = await makeABucketWith(aRoomId, userId, 30)
        const thirdBucket = await makeABucketWith(aRoomId, userId, 30)
    
    
        const response = await request(app)
                .get(`/api/chat/rooms/${aRoomId}/messages?limit=3`)
                .send()
                .expect(200);
      
        const buckets = response.body as Array<any> 
        expect(buckets.map(b => b._id)).toEqual([id(thirdBucket), id(secondBucket), id(firstBucket)])
    })
    
    it("should return 200 with buckets created after the specified timestamp", async () => {
        const firstBucket = await makeABucketWith(aRoomId, userId, 30)
        const secondBucket = await makeABucketWith(aRoomId, userId, 30)
        const thirdBucket = await makeABucketWith(aRoomId, userId, 30)
    
        const thresholdTimestamp = iso(secondBucket.creationDate)
        
        const response = await request(app)
                .get(`/api/chat/rooms/${aRoomId}/messages?after=${thresholdTimestamp}`)
                .send()
                .expect(200);
      
        const buckets = response.body as Array<any> 
        expect(buckets[0]._id).toEqual(id(thirdBucket))
    })
    
    it("tests limit query", async () => {
        const firstBucket = await makeABucketWith(aRoomId, userId, 30)
        const secondBucket = await makeABucketWith(aRoomId, userId, 30)
        const thirdBucket = await makeABucketWith(aRoomId, userId, 30)
        const forthBucket = await makeABucketWith(aRoomId, userId, 30)
    
        const limit = 4
        const response = await request(app)
                .get(`/api/chat/rooms/${aRoomId}/messages?limit=${limit}`)
                .send()
                .expect(200);
      
        const buckets = response.body as Array<any> 
        expect(buckets.length).toEqual(limit)
    })
    
    it("tests page query", async () => {
        const firstBucket = await makeABucketWith(aRoomId, userId, 30)
        const secondBucket = await makeABucketWith(aRoomId, userId, 30)
        const thirdBucket = await makeABucketWith(aRoomId, userId, 30)
        const forthBucket = await makeABucketWith(aRoomId, userId, 30)
    
        const page = 1
        const response = await request(app)
                .get(`/api/chat/rooms/${aRoomId}/messages?page=${page}&limit=2`)
                .send()
                .expect(200);
        
        const buckets = response.body as Array<any> 
    
        expect(buckets.length).toEqual(2)
        expect(ids(buckets)).toEqual([id(secondBucket), id(firstBucket)])
    })
})




async function makeABucketWith(roomId: string, senderId: string, n: number) {
    const date = new Date()
    let bucket = ChatBucket.build({
        roomId: new mongoose.Types.ObjectId(roomId), 
        creationDate: date
    })

    const savedBucket = await bucket.save()
    let messages = []
    messages.push({
        sender: new mongoose.Types.ObjectId(senderId),
        sentAt: date,
        text: "Demo",
    })
    for (let i = 1; i < n; ++i) {
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


// TODO: centralize common functions
async function makeRoom(userId: string, otherUserId: string) {
    const room = Conversation.build({participants: [
        new mongoose.Types.ObjectId(userId),
        new mongoose.Types.ObjectId(otherUserId),
    ]})
    const savedRoom = await room.save()
    return savedRoom
}

function id(doc: mongoose.Document): string {
    return doc._id.toString()
}

function ids(docs: mongoose.Document[]): string[] {
    return docs.map(doc => id(doc))
}

function iso(date: Date) {
    return date.toISOString()
}