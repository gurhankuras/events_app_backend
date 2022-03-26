import { roomRepository, UserNotFound } from "../RoomRepository"
import { userRepository } from "../UserRepository"

const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860eb'

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

async function createTwoUser() {
    const user = await userRepository.create({id: userId, name: "Jane"});
    const otherUser = await userRepository.create({id: otherUserId, name: "Joe"});
    return [user.id, otherUser.id]
}