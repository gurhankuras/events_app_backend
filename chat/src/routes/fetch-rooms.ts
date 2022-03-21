import { currentUser, NotAuthorizedError, requiresAuth, validateRequest } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import { query } from 'express-validator';
import mongoose from 'mongoose';
import { Conversation } from '../models/conversation';

const router = express.Router()

router.get("/api/chat/rooms", 
currentUser,
requiresAuth,

async (req: Request, res: Response) => {
    let userId = req.currentUser!.id as string

    let conversations = await Conversation.find( {
        participants: { $all: [ new mongoose.Types.ObjectId(userId) ] } 
    })
    .sort({"lastMessage.sentAt": -1, createdAt: -1})
    res.send(conversations)
})




export { router as fetchRoomsRouter}