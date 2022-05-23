import { NotFoundError, requiresAuth, validateRequest } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import { roomRepository } from "../services/repositories/MongoDBRoomRepository";
import { body, ValidationChain } from "express-validator";
import { UserNotFound } from '../services/repositories/errors/UserNotFound';
import { currentUser } from '../middlewares/current-user';

const router = express.Router()

const validators: [ValidationChain] = [
    body('userId')
    .isString()
    .not()
    .isEmpty()
]

router.post("/api/chat/conversation",
validators,
validateRequest, 
currentUser, 
requiresAuth, 
async (req: Request, res: Response) => {
    const currentUserId = req.currentUser!.id
    const otherUserId = req.body.userId

    try {
        //const createdRoom = await roomRepository.getOneUsersIn(currentUserId, otherUserId) 
        const exists = await roomRepository.getOneUsersInIfAny(currentUserId, otherUserId);

        if (exists) {
            return res.status(400).send();
        }

        const createdRoom = await roomRepository.createWithTwoUser(currentUserId, otherUserId);
        //const createdRoom = await roomRepository.createWithTwoUser(currentUserId, otherUserId, true)
        return res.status(201).send(createdRoom);
    } catch (error) {
        if (error instanceof UserNotFound) {
            throw new NotFoundError()
        }
        console.log(error)
        throw new Error("Unexpected Error")
    }
})





export { router as createConversationRouter}