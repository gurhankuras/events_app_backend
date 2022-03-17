import { validateRequest } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import { param, query } from 'express-validator';
import mongoose from 'mongoose';
import { ChatBucket } from '../models/chat-bucket';

const router = express.Router()

router.get("/api/chat/rooms/:roomId/messages", 
[
    param('roomId')
    .isString()
    .withMessage('roomId must be provided'),

    query('page')
    .optional()
    .isInt({min: 0})
    .withMessage('page must be valid'),

    query('limit')
    .optional()
    .isInt({min: 1})
    .withMessage('limit must be valid'),

    query('after')
    .optional()
    .isISO8601()
    .withMessage('after must be in ISO8601 date format')
],

validateRequest,

async (req: Request, res: Response) => {
    let roomId = req.params.roomId as string
    let page =  Number.parseInt((req.query.page || '0') as string)
    let limit = Number.parseInt((req.query.limit || '1') as string)
    let after = req.query.after

    let filter = { roomId: new mongoose.Types.ObjectId(roomId) }
    
    if (after) {
        // @ts-ignore
        filter.creationDate = {$gt: after}
    }
    // TODO: index for roomId
    let chat = await ChatBucket.find(filter)
    // TODO: index for creationDate
    .sort({creationDate: -1})
    .skip(page * limit)
    .limit(limit)
    
    res.send(chat)
})




export { router as fetchMessagesRouter}