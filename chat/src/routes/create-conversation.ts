import { Conversation } from "../models/conversation";
import { currentUser, NotFoundError, requiresAuth, validateRequest } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import mongoose from 'mongoose';
import { User } from "../models/user";
import { roomRepository, UserNotFound } from "../services/repositories/RoomRepository";
import { body } from "express-validator";

const router = express.Router()
router.post("/api/chat/conversation",
[
    body('userId')
    .isString()
    .not()
    .isEmpty()
]
,
validateRequest, 
currentUser, 
requiresAuth, 
async (req: Request, res: Response) => {
    const currentUserId = req.currentUser!.id
    const otherUserId = req.body.userId

    try {
        const createdRoom = await roomRepository.createWithTwoUser(currentUserId, otherUserId, true)
        return res.status(201).send(createdRoom);
    } catch (error) {
        if (error instanceof UserNotFound) {
            throw new NotFoundError()
        }
        throw new Error("Unexpected Error")
    }
})



export { router as createConversationRouter}