import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { NotAuthorizedError } from '../errors/not-authorized-error'

export const requiresAuth = async (req: Request, res: Response, next: NextFunction) =>  {
    if (!req.currentUser) {
        throw new NotAuthorizedError();
    }
    
    next()
}