import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/sign-in';
import { signoutRouter } from './routes/sign-out';
import { signupRouter } from './routes/sign-up';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';
import cookieSession from 'cookie-session'; 

const app = express();

app.use(json());
// app.set('trust proxy', true)
app.use(cookieSession({
    signed: false,
    // secure: true
}))
app.use(currentUserRouter)
app.use(signupRouter)
app.use(signinRouter)
app.use(signoutRouter)

app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler)

export { app }