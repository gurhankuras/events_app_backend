import express from 'express'
import { Request, Response } from 'express'
import mongoose from 'mongoose';

import { ChatMessage } from '../models/chat';
import { Conversation } from '../models/conversation';

const router = express.Router()




router.post("/api/chat/conversation/messages", async (req: Request, res: Response) => {
    console.log(req.body)

    let message = ChatMessage.build({ 
        conversationId: req.body.chatId,

        sender: {id: req.body.senderId, image: "https://images.unsplash.com/photo-1638913974071-ad0045d13691?ixlib=rb-1.2.1&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1974&q=80", name: "Bitcoin Bey" },
        sentAt: new Date(),
        text: req.body.text
    }) 

    await message.save()
    return res.send(message);
})

router.post("/api/chat/conversation", async (req: Request, res: Response) => {
    let conv = Conversation.build({
        participants: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()]
    })

    await conv.save()
    return res.send(conv);
})

// currentUser, requiresAuth,

export { router as newMessageRouter}