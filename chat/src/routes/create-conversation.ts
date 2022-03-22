import { Conversation } from "../models/conversation";
import { currentUser, NotFoundError, requiresAuth } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import mongoose from 'mongoose';
import { User } from "../models/user";

const router = express.Router()
router.post("/api/chat/conversation", 
currentUser, 
requiresAuth, 
async (req: Request, res: Response) => {
    const currentUser = await User.findById(req.currentUser!.id)

    if (!currentUser) {
        throw new NotFoundError();
    }

    const user2 = User.build({
        _id: new mongoose.Types.ObjectId(),
        name: "Ali"
    })

    await user2.save();

    let conv = Conversation.build({
        participants: [
            currentUser,
            user2    
        ]
    })

    await conv.save()
    const deneme = await conv.populate('participants')
    return res.status(201).send(deneme);
})



export { router as createConversationRouter}