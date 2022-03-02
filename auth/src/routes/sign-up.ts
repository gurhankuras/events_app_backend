import express from 'express'
import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator'
import { BadRequestError } from '../errors/bad-request-error';
import { NotFoundError } from '../errors/not-found-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { User } from '../models/user';
import jwt from 'jsonwebtoken'
import { validateRequest } from '../middlewares/validate-request';

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

validateRequest,
async (req: Request, res: Response) => {
    
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    if (user) {
        throw new BadRequestError("User already exists with provided email");
    }
    const newUser = User.build({ email, password })

    await newUser.save();

    const userJwt = jwt.sign({
        id: newUser.id,
        email: newUser.email
    }, process.env.JWT_KEY!)

    req.session = {
        jwt: userJwt
    }

    res.status(201).send(newUser)
});

export { router as signupRouter}