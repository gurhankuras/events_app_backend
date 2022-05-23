import express from 'express'
import { Request, Response } from 'express'
import { body } from 'express-validator'
import { User } from '../models/user';
import jwt from 'jsonwebtoken'
import { validateRequest, logger, BadRequestError } from '@gkeventsapp/common';
import { UserCreatedPublisher } from '../events/publishers/user-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router()

export const invalidPasswordErrorMessage = 'Password must be between 4 and 20 characters'
export const invalidEmailErrorMessage = 'Email must be valid'
router.post('/api/users/signup', 
    [
    body('email')
    .isEmail()
    .withMessage(invalidEmailErrorMessage),
    body('password')
    .trim()
    .isLength({min: 4, max: 20})
    .withMessage(invalidPasswordErrorMessage)
],

//validateRequest,
async (req: Request, res: Response) => {
    logger.debug('signup route')
    console.log(req.body)
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    if (user) {
        throw new BadRequestError("User already exists with provided email");
    }
    const newUser = User.build({ email, password })

    await newUser.save();
    
    await new UserCreatedPublisher(natsWrapper.client).publish({
        email: newUser.email,
        id: newUser.id,
        name: newUser.email.split('@')[0],
    })
    

    const userJwt = jwt.sign({
        id: newUser.id,
        email: newUser.email
    }, process.env.JWT_KEY!, { expiresIn: 60 * 60 })

    req.session = {
        jwt: userJwt
    }

    res.setHeader('access-token', userJwt)

    logger.debug('User got successfully signed in')
    res.status(201).send(newUser)
});

export { router as signupRouter}