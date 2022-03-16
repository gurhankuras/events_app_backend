import { S3Wrapper } from "../s3-wrapper-abstract"

export class S3Stub extends S3Wrapper {
    s3: AWS.S3
    private stubbedURL?: string = 'url'
    private stubbedError?: Error

    constructor(s3: AWS.S3) {
        super()
        this.s3 = s3
    }

    getSignedUrl(operation: string, params: any, callback: (err: Error, url: string) => void): void {
        callback(this.stubbedError!, this.stubbedURL!);
    }

    setURL(url: string) {
        this.stubbedURL = url
    }

    setError(error: Error) {
        this.stubbedError = error
    }

}