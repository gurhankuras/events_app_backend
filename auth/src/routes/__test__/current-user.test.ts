import request from 'supertest'
import { setOriginalNode } from 'typescript'
import { app } from '../../app'
import { defautCredentials, signup } from '../../test/utils';

it("return current user's details", async () => {
    let signUpResponse = await signup();
    let response = await request(app)
            .get('/api/users/currentuser')
            .set("access-token", signUpResponse.get("access-token"))
            .send()
            .expect(200);
    
    expect(response.body).toBeDefined()
    expect(response.body.email).toEqual(defautCredentials.email)
    expect(response.body.id).toBeDefined()
})


it("return 401 if user not signed in", async () => {
    let response = await request(app)
            .get('/api/users/currentuser')
            .send()
            .expect(401);

    expect(response.body.length).toEqual(1)
    expect(response.body[0].message).toBeDefined()
})


