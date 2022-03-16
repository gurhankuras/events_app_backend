import { validateRequest } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import { param, query } from 'express-validator';
import mongoose from 'mongoose';
import { ChatBucket } from '../models/chat-bucket';
import { Conversation } from '../models/conversation';

const router = express.Router()

router.get("/api/chat/rooms", 
[
    query('userId')
    .trim()
    .isString()
    .withMessage('userId must be valid'),
],

validateRequest,

async (req: Request, res: Response) => {
    let userId = req.query.userId as string

    let conversations = await Conversation.find( {
        participants: { $all: [ new mongoose.Types.ObjectId(userId) ] } 
    })
    res.send(conversations)
})




export { router as fetchRoomsRouter}