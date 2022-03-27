import { currentUser, requiresAuth } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import { roomRepository } from '../services/repositories/MongoDBRoomRepository';

const router = express.Router()

router.get("/api/chat/rooms", 
currentUser,
requiresAuth,
async (req: Request, res: Response) => {
    let userId = req.currentUser!.id as string
    let conversations = await roomRepository.getByLatest(userId, { participants: true, sender: true })
    res.status(200).send(conversations)
})




export { router as fetchRoomsRouter}