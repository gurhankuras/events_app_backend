const bcrypt = require("bcrypt");
import express from 'express'
import { Request, Response } from 'express'
import { body } from 'express-validator';
import { User } from '../models/user';
import jwt from 'jsonwebtoken'
import { logger, validateRequest, BadRequestError } from '@gkeventsapp/common'

const router = express.Router()

router.post('/api/users/signin', 
    [
        body('email')
        .isEmail()
        .withMessage('Email must be valid.'),

        body('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password must be provided'),
    ],
    validateRequest,
async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email })

    if (!user) {
        logger.debug('email doesnt match')
        throw new BadRequestError("Email or password is wrong");
    }
    let hashedPassword =  user.password;
    let passwordMatched = await bcrypt.compare(password, hashedPassword)

    if (!passwordMatched) {
        logger.debug('password doesnt match')
        throw new BadRequestError("Email or password is wrong")
    }


    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!, { expiresIn: 60 * 60 })

    req.session = {
        jwt: userJwt
    }
    res.setHeader('access-token', userJwt)

    res.status(200).send(user)
});

export { router as signinRouter}