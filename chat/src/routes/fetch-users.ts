import { currentUser, logger, requiresAuth } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import mongoose from 'mongoose';
import { User } from '../models/user';

const router = express.Router()

router.get("/api/chat/users", 
currentUser,
requiresAuth,

async (req: Request, res: Response) => {
    const userId = req.currentUser!.id as string
    const q = req.query.q as string | undefined
    
    const filter = makeFilter(q, userId)    
    let users = await User.find(filter) 

    res.send(users)
})


function makeFilter(q: string | undefined, userId: string) {
    let filter: {_id: any, name?: any} = {
        _id: { 
            $not: { $eq: new mongoose.Types.ObjectId(userId) }, 
        }
    }
    if (q) {
        const query = `^${q}\$`
        filter.name = { $regex : new RegExp(query, 'i') }
    }
    return filter
}

export { router as fetchUsersRouter}