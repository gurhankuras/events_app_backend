import request from 'supertest'
import { app } from '../../app';
import { User } from '../../models/user';


let aValidEmail = 'test@test.com'
let aValidPassword = 'password'
let testRoute = '/api/users/signin'

describe('User has no account', () => {
    it('returns 400 when user entered a email that has no record in system', async () => {
        await request(app)
            .post(testRoute)
            .send({
                email: aValidEmail,
                password: aValidPassword
            })
            .expect(400);
    });
})




describe('User signed up before', () => {

    beforeEach(async () => {
        const user = User.build({ email: aValidEmail, password: aValidPassword })
        await user.save()
    })

    it('returns 200 when user entered correct credentials ', async () => {
        /*
        const user = User.build({ email: aValidEmail, password: aValidPassword })
        await user.save()
*/
        await request(app)
            .post(testRoute)
            .send({
                email: aValidEmail,
                password: aValidPassword
            })
            .expect(200);
    });

    it('sends cookie when user successfully signed in', async () => {
        
        const res = await request(app)
            .post(testRoute)
            .send({
                email: aValidEmail,
                password: aValidPassword
            })
            .expect(200)
        
        expect(res.get('Set-Cookie')).toBeDefined()
    });


    it('returns 400 when user entered wrong password', async () => {
       
        await request(app)
            .post(testRoute)
            .send({
                email: aValidEmail,
                password: 'wrong'
            })
            .expect(400);
    });

    it('returns 400 when user entered wrong email', async () => {
       
        await request(app)
            .post(testRoute)
            .send({
                email: 'another@test.com',
                password: aValidPassword
            })
            .expect(400);
    });

    

})

