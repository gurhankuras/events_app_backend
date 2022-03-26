import request from 'supertest'
import { app } from '../../app';
import { makeUser, signIn } from '../../test/shared-utils';

const userId = '507f191e810c19729de860ec'
const otherUserId = '507f191e810c19729de860eb'
const anotherUserId = '507f191e810c19729de860ed'

it("should return users except self", async () => {
    const token = signIn()
    const user = await makeUser(userId)

    const res = await request(app)
    .get(`/api/chat/users`)
    .set('access-token', token)
    .send()
    .expect(200);

    const users = res.body as Array<any>
    expect(users.map(user => user.id)).not.toContain(user.id)
})

it("should return users that matching query", async () => {
    const token = signIn()
    const user = await makeUser(userId, "Gurhan")
    const name = "Ali"

    const otherUser = await makeUser(otherUserId, name)
    const anotherUser = await makeUser(anotherUserId, "Joe")
    
    const q = name
    const res = await request(app)
    .get(`/api/chat/users?q=${q}`)
    .set('access-token', token)
    .send()
    .expect(200);

    const users = res.body as Array<any>
    expect(users.map(user => user.id)).toContain(otherUser.id)
    expect(users.map(user => user.id)).not.toContain(anotherUser.id)
    expect(users.length).toEqual(1)
})

it("should return users that matching query case-insensitive", async () => {
    const token = signIn()
    const user = await makeUser(userId, "Gurhan")
    const name = "Ali"

    const otherUser = await makeUser(otherUserId, name)
    const anotherUser = await makeUser(anotherUserId, name.toLowerCase())
    
    const q = name
    const res = await request(app)
    .get(`/api/chat/users?q=${q}`)
    .set('access-token', token)
    .send()
    .expect(200);

    const users = res.body as Array<any>

    expect(users.map(user => user.id)).toContain(otherUser.id)
    expect(users.map(user => user.id)).toContain(anotherUser.id)
    expect(users.length).toEqual(2)
})

it("should return all users when 'q' param not sent", async () => {
    const token = signIn()

    await makeUser(userId, "Gurhan")
    await makeUser(otherUserId, "Ali")
    await makeUser(anotherUserId, "Veli")
    
    const res = await request(app)
    .get(`/api/chat/users`)
    .set('access-token', token)
    .send()
    .expect(200);

    const users = res.body as Array<any>
    
    expect(users.length).toEqual(2)
})
