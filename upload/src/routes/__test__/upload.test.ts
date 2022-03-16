import request from 'supertest'
import { app } from '../../app'
import { defautCredentials, signup } from '../../test/utils';
import jwt from 'jsonwebtoken'
const isuuid = require('isuuid')

jest.mock('../../s3/s3-wrapper.ts')

const id = '507f191e810c19729de860ea'
const email = 'test@test.com'

function signIn(): string {
  const userJwt = jwt.sign({
        id: id,
        email: email
  }, process.env.JWT_KEY!, { expiresIn: 60 * 60 })
  return userJwt
}

it("returns 200 when user signed in", async () => {
        let token = signIn()
        let response = await request(app)
                .get('/api/upload')
                .set('access-token', token)
                .send()
                .expect(200);
})

it("returns 401 when user is not signed in", async () => {
        await request(app)
                .get('/api/upload')
                .send()
                .expect(401);
})

it("returns a body that consists of url and key", async () => {
        let token = signIn()
        const res = await request(app)
                .get('/api/upload')
                .set('access-token', token)
                .send()
                .expect(200);
        expect(res.body.url).toBeDefined()
        expect(res.body.key).toBeDefined()
})

it("the first part of body's key should be user's id", async () => {
        let token = signIn()
        const res = await request(app)
                .get('/api/upload')
                .set('access-token', token)
                .send()
                .expect(200);
        let key = res.body.key as string
        expectPartOf(key, 1, '/').toEqual(id)
})

it("the second part of body's key should be uuid", async () => {
        let token = signIn()
        const res = await request(app)
                .get('/api/upload')
                .set('access-token', token)
                .send()
                .expect(200);
        let key = res.body.key as string
        expect(isuuid((key.split('/')[1]).split('.')[0])).toEqual(true)
})

function expectPartOf(key: string, partNumber: number, delimiter: string) {
        return expect(key.split(delimiter)[partNumber - 1])
}


