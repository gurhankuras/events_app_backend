import express from 'express'
import 'express-async-errors'
import { json } from 'body-parser'
import { Request, Response } from 'express'
import { errorHandler, NotFoundError, RequestValidationError } from '@gkeventsapp/common'
import AWS from 'aws-sdk'


if (!process.env.AWS_S3_BUCKET_ACCESS_KEY) {
    throw new Error("AWS_S3_BUCKET_ACCESS_KEY not provided")
}
if (!process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY) {
    throw new Error("AWS_S3_BUCKET_SECRET_ACCESS_KEY not provided")
}

const s3 = new AWS.S3({
    credentials: {
        accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY!
    }
});

const app = express();

app.get('/', (req: Request, res: Response) => {
    res.send('OK')
})

app.get('/api/upload', (req: Request, res: Response) => {
    const demoKey = 'gurhan/deneme.jpeg'
    const params = {
        Bucket: 'gkevents-app',
        ContentType: 'jpeg',
        Key: demoKey
    };

    s3.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
            console.log(err)
            res.send({message: "Something went wrong!"})
            return;
        }
        res.send({
            key: demoKey, 
            url: url
        })
    });
})
app.use(json());


app.all('*', async () => {
    throw new NotFoundError();
})

app.use(errorHandler)

export { app }