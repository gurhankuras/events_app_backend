import { validateRequest } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import { param, query } from 'express-validator';
import mongoose from 'mongoose';
import { ChatBucket } from '../models/chat-bucket';

const router = express.Router()

router.get("/api/chat/rooms/:roomId", 
[
    param('roomId')
    .isString()
    .withMessage('roomId must be provided'),

    query('page')
    .optional()
    .default(0)
    .isInt({min: 0})
    .withMessage('page must be valid'),

    query('limit')
    .optional()
    .default(1)
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
    let page =  Number.parseInt(req.query.page as string)
    let limit = Number.parseInt(req.query.limit as string)
    let after = req.query.after

    console.log('Burada')

    let filter = { roomId: new mongoose.Types.ObjectId(roomId) }
    
    if (after) {
        // @ts-ignore
        filter.creationDate = {$gt: after}
    }
    
    // TODO: index for roomId
    let chat = await ChatBucket.find(filter)
    // TODO: index for creationDate
    .sort({creationDate: -1})
    .skip(page)
    .limit(limit)
    
    res.send(chat)
})




export { router as fetchMessagesRouter}