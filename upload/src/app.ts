import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import { Request, Response } from 'express'
import { errorHandler, NotFoundError, RequestValidationError } from '@gkeventsapp/common'
import { uploadRouter } from './routes/upload'

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.send('OK')
})

app.use(json());

app.use(uploadRouter)

app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler)

export { app }