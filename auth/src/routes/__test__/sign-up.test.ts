import request from 'supertest'
import { app } from '../../app'
import { User } from '../../models/user';
import { natsWrapper } from '../../nats-wrapper';
import { invalidPasswordErrorMessage } from '../sign-up';


let aValidEmail = 'test@test.com'
let aValidPassword = 'password'
let testRoute = '/api/users/signup'

it('returns 201 if body is valid', async () => {
    await request(app)
        .post(testRoute)
        .send({
            email: aValidEmail,
            password: aValidPassword
        })
        .expect(201);
});


it("returns 201 if user has not registered before", async () => {
    await request(app)
        .post(testRoute)
        .send({
            email: aValidEmail,
            password: aValidPassword
        })
        .expect(201)
});


it('returns 400 if email is invalid', async () => {
    await request(app)
    .post(testRoute)
    .send({
        email: 'email',
        password: aValidPassword
    })
    .expect(400)
})

it('returns 400 if body is empty', async () => {
    await request(app)
    .post(testRoute)
    .send({})
    .expect(400)
})

describe('password check', () => {
    it('returns 400 if password is empty', async () => {
        // Password is empty
        const res = await request(app)
        .post(testRoute)
        .send({
            email: aValidEmail,
            password: ''
        })
        .expect(400)
    
        expectErrorMessageEqual(res, invalidPasswordErrorMessage);
    })
    

    it('returns 400 if password exceeds 20 characters', async () => {
    
       const res = await request(app)
        .post(testRoute)
        .send({
            email: aValidEmail,
            password: 'x'.repeat(21)
        })
        .expect(400)

        expectErrorMessageEqual(res, invalidPasswordErrorMessage);
    })
})


it('returns 400 if user already exists', async () => {
    let user = User.build( {email: aValidEmail, password: aValidEmail} )
    await user.save();
    
    const res = await request(app)
        .post(testRoute)
        .send({
            email: aValidEmail,
            password: aValidPassword
        })
        .expect(400)
});

it('sets cookie if user successfully signs up', async () => {
    const res = await request(app)
        .post(testRoute)
        .send({
            email: aValidEmail,
            password: aValidPassword
        })
    expect(res.get('Set-Cookie')).toBeDefined()
});

it('sets access token as header if user successfully signs up', async () => {
    const res = await request(app)
        .post(testRoute)
        .send({
            email: aValidEmail,
            password: aValidPassword
        })
    expect(res.get('access-token')).toBeDefined()
});

it("publishes event when user successfully signed up", async () => {
    await request(app)
        .post(testRoute)
        .send({
            email: aValidEmail,
            password: aValidPassword
        })
        .expect(201)
    expect(natsWrapper.client.publish).toHaveBeenCalledTimes(1)
});


function expectErrorMessageEqual(res: request.Response, message: string) {
    expect(res.body[0].message).toBe(message)
}
