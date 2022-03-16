import { logger } from '@gkeventsapp/common'


beforeAll(async () => {
    logger.level = 'debug'
    process.env.JWT_KEY = 'dummy'
    process.env.AWS_S3_BUCKET_ACCESS_KEY = ''
    process.env.AWS_S3_BUCKET_SECRET_ACCESS_KEY = ''
});

