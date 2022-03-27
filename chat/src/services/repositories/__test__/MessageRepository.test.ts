import { iso, makeABucketWith, makeRoom, makeUser } from "../../../test/shared-utils";
import { roomRepository } from "../MongoDBRoomRepository";

import { messageRepository } from "../MongoDBMessageRepository";
import { ChatBucket } from "../../../models/chat-bucket";

const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860eb'
const aRoomId = '6231dac6aba6adb436c4988c'

describe('paginatedByCreation', () => {
    it("should return empty array when there are no messages yet", async () => {
        const user = await makeUser(userId);
        const otherUser = await makeUser(otherUserId);
        const room = await roomRepository.createWithTwoUser(user.id, otherUser.id, false)
        
        const messages = await messageRepository.paginatedByCreation({roomId: room.id})
        expect(messages).toEqual([])
    })
    
    
    it("should return a bucket with one messages after adding a message", async () => {
        const user = await makeUser(userId);
        const otherUser = await makeUser(otherUserId);
        const room = await makeRoom(user, otherUser);
        
        await messageRepository.add(room.id, {text: "Hello", sender: user.id, sentAt: new Date()});
        const messageBlocks = await messageRepository.paginatedByCreation({roomId: room.id})
    
        expect(messageBlocks.length).toEqual(1)
        expect(messageBlocks[0]?.messages.length).toEqual(1)
    })
    
    
    it("should return buckets sorted by creation date", async () => {
        const firstBucket = await makeABucketWith(aRoomId, userId, 30)
        const secondBucket = await makeABucketWith(aRoomId, userId, 30)
        const thirdBucket = await makeABucketWith(aRoomId, userId, 30)
        const options = { limit: 3 }
    
        const messageBlocks = await messageRepository.paginatedByCreation({roomId: aRoomId, options: options})
      
        expect(messageBlocks.map(b => b.id)).toEqual([thirdBucket.id, secondBucket.id, firstBucket.id])
    })
    
    it("should return 200 with buckets created after the specified timestamp", async () => {
        const firstBucket = await makeABucketWith(aRoomId, userId, 30)
        const secondBucket = await makeABucketWith(aRoomId, userId, 30)
        const thirdBucket = await makeABucketWith(aRoomId, userId, 30)
    
        const thresholdTimestamp = iso(secondBucket.creationDate)
        const options = { after: thresholdTimestamp }
    
        const messageBlocks = await messageRepository.paginatedByCreation({roomId: aRoomId, options: options})
      
        expect(messageBlocks[0].id).toEqual(thirdBucket.id)
        expect(messageBlocks.length).toEqual(1)
    })
    
    
    
    it("should return correct quantity according to limit option", async () => {
        await makeABucketWith(aRoomId, userId, 30)
        await makeABucketWith(aRoomId, userId, 30)
        await makeABucketWith(aRoomId, userId, 30)
        await makeABucketWith(aRoomId, userId, 30)
    
        const options = { limit: 4 }
    
        const messageBlocks = await messageRepository.paginatedByCreation({roomId: aRoomId, options: options})
    
        expect(messageBlocks.length).toEqual(options.limit)
    })
    
    it("should return correct portion according to page option", async () => {
        const firstBucket = await makeABucketWith(aRoomId, userId, 30)
        const secondBucket = await makeABucketWith(aRoomId, userId, 30)
        const _ = await makeABucketWith(aRoomId, userId, 30)
        const __ = await makeABucketWith(aRoomId, userId, 30)
    
        const options = {page: 1, limit: 2}
        const messageBlocks = await messageRepository.paginatedByCreation({roomId: aRoomId, options: options})
       
        expect(messageBlocks.length).toEqual(2)
        expect(messageBlocks.map(doc => doc.id)).toEqual([secondBucket.id, firstBucket.id])
    })
    
})


describe('add', () => {

    it("should add the message", async () => {
        const user = await makeUser(userId);
        const otherUser = await makeUser(otherUserId)
        const room = await roomRepository.createWithTwoUser(user.id, otherUser.id, false)
        const text = "hello"
        
        await messageRepository.add(room.id, {text: text, sender: user.id, sentAt: new Date()});

        const messages = await ChatBucket.findOne({roomId: room.id})
        const messageUserSent = messages?.messages[0] 
        
        expect(messageUserSent?.sender.toString()).toEqual(userId)
        expect(messageUserSent?.text).toEqual(text)
    })
})


