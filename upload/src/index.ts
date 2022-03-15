import 'express-async-errors'
import { app } from './app';
import { logger } from '@gkeventsapp/common';

const PORT = 3000


const start = async () => {
    logger.level = 'debug'
   
    app.listen(3000, () => {
       
        logger.info(`🚀 Listening on port ${PORT} -upload`)
    }); 
}

start()

