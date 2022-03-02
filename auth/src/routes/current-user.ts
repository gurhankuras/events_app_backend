import express from 'express'
import { Request, Response } from 'express'
import { currentUser } from '../middlewares/current-user';
import { requiresAuth } from '../middlewares/requires-auth';

const router = express.Router()

router.get('/api/users/currentuser', currentUser, requiresAuth, (req: Request, res: Response) => {
    res.send(req.currentUser)
});

export { router as currentUserRouter}