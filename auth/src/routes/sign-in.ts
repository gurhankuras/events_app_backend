const bcrypt = require("bcrypt");
import express from 'express'
import { Request, Response } from 'express'
import { body, validationResult } from 'express-validator';
import { BadRequestError } from '../errors/bad-request-error';
import { RequestValidationError } from '../errors/request-validation-error';
import { User } from '../models/user';
import jwt from 'jsonwebtoken'
import { validateRequest } from '../middlewares/validate-request';
import { logger } from '../utils/logger';

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
    }, process.env.JWT_KEY!)

    req.session = {
        jwt: userJwt
    }

    res.status(200).send(user)
});

export { router as signinRouter}