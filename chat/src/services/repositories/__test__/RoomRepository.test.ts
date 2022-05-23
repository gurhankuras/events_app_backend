import { Conversation } from "../../../models/conversation"
import { makeUser, nowSecondsLater } from "../../../test/shared-utils"
import { LastMessage } from "../base/RoomRepository"
import { RoomNotFound } from "../errors/RoomNotFound"
import { UserNotFound } from "../errors/UserNotFound"
import { roomRepository } from "../MongoDBRoomRepository"
import { userRepository } from "../UserRepository"

const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860eb'
const anotherUserId = '507f191e810c19729de860ed'

describe('createWithTwoUser', () => {
    it('creates room with two person that defaults to not populated', async () => {
        const [userId, otherUserId] = await createTwoUser()
    
        const room = await roomRepository.createWithTwoUser(userId, otherUserId)
    
        expect(room.participants[0].name).toBeUndefined()
    })
    
    it('creates room with not populated two person ', async () => {
        const [userId, otherUserId] = await createTwoUser()
    
        const room = await roomRepository.createWithTwoUser(userId, otherUserId, false)
    
        expect(room.participants[0].name).toBeUndefined()
    })
    
    it('creates room with populated two person ', async () => {
        const [userId, otherUserId] = await createTwoUser()
    
        const room = await roomRepository.createWithTwoUser(userId, otherUserId, true)
    
        expect(room.participants[0].name).toBeDefined()
    })
    
    it('throws UserNotFound when tries to create room with non-existing user id (first param)', async () => {
        const user = await userRepository.create({id: userId, name: "Jane"});
        return expect(roomRepository.createWithTwoUser(user.id, otherUserId, true)).rejects.toThrow(UserNotFound)    
    })
    
    it('throws UserNotFound when tries to create room with non-existing user id (second param)', async () => {
        const user = await userRepository.create({id: userId, name: "Jane"});
        return expect(roomRepository.createWithTwoUser(otherUserId, user.id, true)).rejects.toThrow(UserNotFound)    
    })
})

describe('updateLastMessage', () => {
    const aRoomId = '6231dac6aba6adb436c4988c'

    it("sets a newly created room's last message", async () => {
        const [userId, otherUserId] = await createTwoUser()
        const room = await roomRepository.createWithTwoUser(userId, otherUserId)
        
        expect(room.lastMessage).toBeUndefined()
        
        const message: LastMessage = {senderId: userId, text: "Hello", sentAt: new Date()}
        const result = await roomRepository.updateLastMessage(room.id, message)
        const roomToBeVerified = await Conversation.findById(room.id)
       
        expect(roomToBeVerified?.lastMessage).toBeDefined()
        expect(roomToBeVerified?.lastMessage.sender.toString()).toEqual(message.senderId)
        expect(roomToBeVerified?.lastMessage.text).toEqual(message.text)
        expect(roomToBeVerified?.lastMessage.sentAt).toEqual(message.sentAt)
        expect(result.matchedCount).toEqual(1)
        expect(result.modifiedCount).toEqual(1)
    })

    it("overrides last message", async () => {
        const [userId, otherUserId] = await createTwoUser()
        const room = await roomRepository.createWithTwoUser(userId, otherUserId)

        await roomRepository.updateLastMessage(room.id, {senderId: userId, text: "First message", sentAt: new Date()})
        
        const preconditionRoom = await Conversation.findById(room.id)
        expect(preconditionRoom?.lastMessage).toBeDefined()
        
        const message: LastMessage = {senderId: userId, text: "Hello", sentAt: new Date() }
        const result = await roomRepository.updateLastMessage(room.id, message)
        const roomToBeVerified = await Conversation.findById(room.id)
       
        expect(roomToBeVerified?.lastMessage).toBeDefined()
        expect(roomToBeVerified?.lastMessage.sender.toString()).toEqual(message.senderId)
        expect(roomToBeVerified?.lastMessage.text).toEqual(message.text)
        expect(roomToBeVerified?.lastMessage.sentAt).toEqual(message.sentAt)
        expect(result.matchedCount).toEqual(1)
        expect(result.modifiedCount).toEqual(1)
    })

    it("throws `RoomNotFound` if the room's id don't match", async () => {
        const [userId, _] = await createTwoUser()
        const notExistingRoomId = aRoomId
        const message: LastMessage = { senderId: userId, text: "Hello", sentAt: new Date() }

        return expect(roomRepository.updateLastMessage(notExistingRoomId, message)).rejects.toThrow(RoomNotFound)
    })

    it("throws `RoomNotFound` if the sender id is not one of room's participants", async () => {
        const [userId, otherUserId] = await createTwoUser()
        const room = await roomRepository.createWithTwoUser(userId, otherUserId)
        const userIdNotInTheRoom = anotherUserId
        const message: LastMessage = { senderId: userIdNotInTheRoom, text: "Hello", sentAt: new Date() }

        return expect(roomRepository.updateLastMessage(room.id, message)).rejects.toThrow(RoomNotFound)
    })
    
    
})

describe('getByLatest', () => {
    describe("should return array of rooms that sorted by lastMessage date if any otherwise sorted by room creation date", () => {
        it("without last messages", async () => {
            const user = await makeUser(userId, "John")
            const otherUser = await makeUser(otherUserId, "Jane")
            const anotherUser = await makeUser(anotherUserId, "Joe")
    
            const room1 = await roomRepository.createWithTwoUser(user.id, otherUser.id)
            const room2 = await roomRepository.createWithTwoUser(user.id, anotherUser.id)
    
            const rooms = await roomRepository.getByLatest(user.id, {participants: true, sender: true})
    
            expect(rooms.map(r => r.id)).toEqual([room2.id.toString(), room1.id.toString()])
        })

        it("one with last message, one without last message", async () => {
            const user = await makeUser(userId, "John")
            const otherUser = await makeUser(otherUserId, "Jane")
            const anotherUser = await makeUser(anotherUserId, "Joe")
    
            const room1 = await roomRepository.createWithTwoUser(user.id, otherUser.id)
            const room2 = await roomRepository.createWithTwoUser(user.id, anotherUser.id)
    

            await roomRepository.updateLastMessage(room1.id, {senderId: user.id, sentAt: nowSecondsLater(5), text: "Hello"})
        
            const rooms = await roomRepository.getByLatest(user.id, {participants: true, sender: true})
        
            expect(rooms.map(r => r.id)).toEqual([room1.id.toString(), room2.id.toString()])
        })

        it("with last messages", async () => {
            const user = await makeUser(userId, "John")
            const otherUser = await makeUser(otherUserId, "Jane")
            const anotherUser = await makeUser(anotherUserId, "Joe")
    
            const room1 = await roomRepository.createWithTwoUser(user.id, otherUser.id)
            const room2 = await roomRepository.createWithTwoUser(user.id, anotherUser.id)            
            
            await roomRepository.updateLastMessage(room1.id, {senderId: user.id, sentAt: nowSecondsLater(2), text: "Hello"})
            await roomRepository.updateLastMessage(room2.id, {senderId: user.id, sentAt: nowSecondsLater(5), text: "Hello"})
    
            const rooms = await roomRepository.getByLatest(user.id, {participants: true, sender: true})
    
            expect(rooms.map(r => r.id)).toEqual([room2.id.toString(), room1.id.toString()])
        })
    })
})

describe('getOneRoomUsersInIfAny', () => {
    test('should return null if a room that the users in do not exist', async () => {
        const user = await makeUser(userId, "John")
        const otherUser = await makeUser(otherUserId, "Jane")

        expect(roomRepository.getOneUsersInIfAny(user.id, otherUser.id)).resolves.toEqual(null)
    })

    test('should return room if a room that the users in already exists', async () => {
        const user = await makeUser(userId, "John")
        const otherUser = await makeUser(otherUserId, "Jane")
        const room1 = await roomRepository.createWithTwoUser(user.id, otherUser.id)
        const fetched = await roomRepository.getOneUsersInIfAny(user.id, otherUser.id)
        expect(fetched?.id).toEqual(room1.id.toString())
    })
})

describe('getOneRoomUsersIn', () => {
    test('should create a new one and return it if a room that the users in do not exist', async () => {
        const user = await makeUser(userId, "John")
        const otherUser = await makeUser(otherUserId, "Jane")

        await expect(roomRepository.getOneUsersInIfAny(user.id, otherUser.id)).resolves.toEqual(null)
        await expect(roomRepository.getOneUsersIn(user.id, otherUser.id)).resolves.toBeDefined()
        await expect(roomRepository.getOneUsersInIfAny(user.id, otherUser.id)).resolves.not.toEqual(null)

    })

    test('should return existing one if a room that the users in already exists', async () => {
        const user = await makeUser(userId, "John")
        const otherUser = await makeUser(otherUserId, "Jane")

        expect(roomRepository.getOneUsersInIfAny(user.id, otherUser.id)).resolves.toEqual(null)

        const room1 = await roomRepository.createWithTwoUser(user.id, otherUser.id)
        const room = await roomRepository.getOneUsersIn(user.id, otherUser.id);

        expect(room.id).toEqual(room1.id.toString())
    })

    /*
    test('should return existing one if a room that the users in already exists', async () => {
        const user = await makeUser(userId, "John")
        const otherUser = await makeUser(otherUserId, "Jane")
        //const anotherUser = await makeUser(anotherUserId, "Gurhan")

        expect(roomRepository.getOneUsersInIfAny(user.id, otherUser.id)).resolves.toEqual(null)

        const room1 = await roomRepository.createWithTwoUser(user.id, otherUser.id);
        const room2 = await roomRepository.getOneUsersIn(user.id, anotherUserId)

        console.log(room2);


        expect(room2).toBeNull();
    })
    */
})


async function createTwoUser() {
    const user = await userRepository.create({id: userId, name: "Jane"});
    const otherUser = await userRepository.create({id: otherUserId, name: "Joe"});
    return [user.id, otherUser.id]
}