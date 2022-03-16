import AWS from 'aws-sdk';
import { S3Stub } from '../test-doubles/s3-stub';



export const s3Wrapper = new S3Stub(new AWS.S3({
    signatureVersion: 's3v4',
    region: 'eu-central-1',
    credentials: {
        
        accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY!,
    }
}))