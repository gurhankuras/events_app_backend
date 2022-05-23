import jwt from 'jsonwebtoken'
import {Response, Request, NextFunction} from 'express'
 interface UserPayload {
     id: string;
     email: string;
 }

 declare global {
     namespace Express {
         interface Request {
             currentUser?: UserPayload
         }
     }
 }

 export const currentUser = async (req: Request, res: Response, next: NextFunction) =>  {
     let bearerToken = req.get('Authorization')
     console.log(bearerToken)
     if (!bearerToken) {
         console.log('[LOG] has not bearerToken')
        return next();
     }

     try {
         let bearerTokenComponents = bearerToken.split(' ');
         console.log('[LOG] splitted bearerToken', bearerTokenComponents)
         if (bearerTokenComponents.length == 2 && bearerTokenComponents[0] ==  'Bearer') {
            let token = bearerTokenComponents[1];
            let payload = jwt.verify(token, process.env.JWT_KEY!) as UserPayload;
            req.currentUser = payload
        }
     } catch (error) {
     }

     next();
 }