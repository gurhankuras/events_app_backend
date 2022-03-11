import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test/utils";
import { logger } from "@gkeventsapp/common";

let aValidEmail = 'test@test.com'
let aValidPassword = 'password'
const clearedCookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"

it('clears cookie after signing out', async () => {
    let signUpResponse = await signup()


    let signOutResponse = await request(app)
    .post('/api/users/signout')
    .send({})
    .expect(200)

    expect(signOutResponse.get('Set-Cookie')).toEqual([ clearedCookie ])
    
})