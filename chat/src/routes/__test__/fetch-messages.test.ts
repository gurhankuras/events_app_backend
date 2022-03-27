import mongoose from 'mongoose';
import request from 'supertest'
import { app } from '../../app';
import { ChatBucket } from '../../models/chat-bucket';
import { id, ids, iso, makeABucketWith, makeRoom, makeUser, signIn } from '../../test/shared-utils';

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
    it("should return 200 with empty array when has no messages yet3", async () => {
        const user = await makeUser(userId);
        const otherUser = await makeUser(otherUserId);
        const room = await makeRoom(user, otherUser);
        
        const response = await request(app)
                .get(`/api/chat/rooms/${room.id}/messages`)
                .send()
                .expect(200);
    
        expect(response.body).toEqual([])
    })
})

describe('in controller', () => {
    it("should return 200 with empty array when has no messages yet1", async () => {
        const user = await makeUser(userId);
        const otherUser = await makeUser(otherUserId);
        const room = await makeRoom(user, otherUser);
        
        const response = await request(app)
                .get(`/api/chat/rooms/${room.id}/messages`)
                .send()
                .expect(200);
    
        expect(response.body).toEqual([])
    })
    
    it("should return 200 with empty array when has no messages yet2", async () => {
        const token = signIn()
        const user = await makeUser(userId);
        const otherUser = await makeUser(otherUserId);
        const room = await makeRoom(user, otherUser);
        
        await request(app)
            .post(`/api/chat/rooms/${room.id}/messages`)
            .set('access-token', token)
            .send({
                text: 'text'
            })
            .expect(201);
    
        const response = await request(app)
                .get(`/api/chat/rooms/${room.id}/messages`)
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
        expect(buckets[0].id).toEqual(id(secondBucket))
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
        expect(buckets.map(b => b.id)).toEqual([thirdBucket.id, secondBucket.id, firstBucket.id])
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
        expect(buckets[0].id).toEqual(thirdBucket.id)
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
        expect(buckets.map(doc => doc.id)).toEqual([secondBucket.id, firstBucket.id])
    })
})





