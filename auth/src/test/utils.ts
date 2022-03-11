import request from 'supertest'
import { app } from '../app'

let aValidEmail = 'test@test.com'
let aValidPassword = 'password'

type Credentials = {email: string, password: string}

export let defautCredentials: Credentials = {
    email: aValidEmail,
    password: aValidPassword
}

export async function signup({email, password} = defautCredentials): Promise<request.Response> {
    return await request(app)
        .post('/api/users/signup')
        .send({   
            email: aValidEmail,
            password: aValidPassword
        })
        .expect(201);
}