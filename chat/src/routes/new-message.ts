import express from 'express'
import { Request, Response } from 'express'
import mongoose from 'mongoose';
import { ChatBucket } from '../models/chat-bucket';
import { body, query, param } from 'express-validator'
import { Conversation } from '../models/conversation';
import { logger, NotAuthorizedError, NotFoundError, requiresAuth, validateRequest } from '@gkeventsapp/common';
import { messageRepository } from '../services/repositories/MongoDBMessageRepository';
import { roomRepository } from '../services/repositories/MongoDBRoomRepository';
import { RoomNotFound } from '../services/repositories/errors/RoomNotFound';
import { currentUser } from '../middlewares/current-user';

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

    const creationDate = new Date()
    const senderId = req.currentUser!.id
    const message = {text: text, image: image}
    try {
        const roomResult = await roomRepository.updateLastMessage(convId, {...message, senderId: senderId, sentAt: creationDate})
       
        const result =  await messageRepository.add(convId, {text: text, sender: senderId, sentAt: creationDate});
        res.status(201).send(result)

    } catch (error) {
        if (error instanceof RoomNotFound) {
            throw new NotFoundError();
        }
        throw error
    }
})

export { router as newMessageRouter}