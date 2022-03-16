import AWS from 'aws-sdk'
import { S3Wrapper } from './s3-wrapper-abstract';

AWS.config.update({
    signatureVersion: 's3v4',
    region: 'eu-central-1'
});

if (!process.env.AWS_S3_BUCKET_ACCESS_KEY) {
    throw new Error("AWS_S3_BUCKET_ACCESS_KEY not provided")
}
if (!process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY) {
    throw new Error("AWS_S3_BUCKET_SECRET_ACCESS_KEY not provided")
}

const s3 = new AWS.S3({
    signatureVersion: 's3v4',
    region: 'eu-central-1',
    credentials: {
        
        accessKeyId: process.env.AWS_S3_BUCKET_ACCESS_KEY!,
        secretAccessKey: process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY!,
    }
});

class AppS3 extends S3Wrapper {
    s3: AWS.S3;

    constructor(s3: AWS.S3) {
        super()
        this.s3 = s3;
    }

    getSignedUrl(operation: string, params: any, callback: (err: Error, url: string) => void): void {
        s3.getSignedUrl(operation, params, callback)
    }

}

export const s3Wrapper = new AppS3(s3)
