import express from 'express'
import { Request, Response } from 'express'
import mongoose from 'mongoose';
import { ChatBucket } from '../models/chat-bucket';
import { body, query, param } from 'express-validator'
import { Conversation } from '../models/conversation';
import { currentUser, logger, NotAuthorizedError, requiresAuth, validateRequest } from '@gkeventsapp/common';

const router = express.Router()



router.post("/api/chat/rooms/:roomId/messages", [
    body('text')
    .isString()
    .not()
    .isEmpty()
    .withMessage('text must be provided'),

    param('roomId')
    .trim()
    .isString()
    .not()
    .isEmpty()
    .withMessage("roomId must be provided")
],
validateRequest, 
currentUser,
requiresAuth,
async (req: Request, res: Response) => {
    let convId = req.params.roomId as string
    let text = req.body.text as string;
    let image = req.body.image

    logger.debug("NEW-MESSAGE ENDPOINT")

    let conversation = await Conversation.findOne( {
        _id: convId,  
        participants: { $all: [ new mongoose.Types.ObjectId(req.currentUser!.id) ] } 
    })

    if (!conversation) {
        throw new NotAuthorizedError();
    }

    let newDate = new Date()
 
    let b = await Conversation.updateOne({_id: new mongoose.Types.ObjectId(convId)}, {
        lastMessage: {
            sender: new mongoose.Types.ObjectId(req.currentUser!.id),
            sentAt: newDate,
            text: text
        }
    })
    
    let a = await ChatBucket.updateOne({roomId: new mongoose.Types.ObjectId(convId), count: { $lt: 30 }, creationDate: {$lt: newDate}}, {
        "$push": {
            "messages": {
                sender: new mongoose.Types.ObjectId(req.currentUser!.id),
                sentAt: newDate,
                text: text,
                image: image,
            }
        },
            "$inc": {"count": 1},
            "$setOnInsert": { "creationDate": newDate }
        },
        {upsert: true}
    )
    res.send(a)
})



// currentUser, requiresAuth,

export { router as newMessageRouter}