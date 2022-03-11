import express from 'express'
import { Request, Response } from 'express'
import { ChatMessage } from '../models/chat';

const router = express.Router()


router.get("/api/chat/conversation/messages", async (req: Request, res: Response) => {
    let messages = await ChatMessage.find();
    return res.send(messages);
})

export { router as fetchMessagesRouter}