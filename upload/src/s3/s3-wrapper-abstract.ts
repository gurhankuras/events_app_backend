export abstract class S3Wrapper {
    abstract s3: AWS.S3
    abstract getSignedUrl(operation: string, params: any, callback: (err: Error, url: string) => void): void
}