import {Request, Response, NextFunction} from 'express'
import { RequestValidationError } from '../errors/request-validation-error'
import { CustomError } from '../errors/custom-error'
import { logger } from '../utils/logger'



export const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
    logger.debug("Something went wrong: ", error.message)
    
    if (error instanceof CustomError) {
        return res.status(error.statusCode).send(
            error.serializeErrors()
        )
    }

    return res.status(400).send(
        [
            { message: "Something went wrong" }
        ]
    );
}