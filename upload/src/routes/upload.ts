import { currentUser, requiresAuth } from '@gkeventsapp/common';
import express from 'express'
import { Request, Response } from 'express'
import { s3Wrapper } from '../s3/s3-wrapper';
import { v1 } from 'uuid'
const router = express.Router()

router.get('/api/upload', currentUser, requiresAuth, (req: Request, res: Response) => {
    const fileName = v1()
    const key = `${req.currentUser!.id}/${fileName}.jpeg`
    
    const params = {
        Bucket: 'gkevents-app',
        ContentType: 'image/jpeg',
        Key: key
    };

    s3Wrapper.getSignedUrl('putObject', params, (err, url) => {
        if (err) {
            console.log(err)
            res.send({message: err})
            return;
        }
        res.send({
            key: key, 
            url: url
        })
    });
})

export { router as uploadRouter}