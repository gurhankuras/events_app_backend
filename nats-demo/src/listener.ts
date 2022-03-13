import { logger } from '@gkeventsapp/common';
import { randomBytes, randomInt } from 'crypto';
import nats, { Message } from 'node-nats-streaming'
logger.level = 'debug'

console.clear()
const stan = nats.connect('gkevents', `listener${randomBytes(4).toString('hex')}`, {
    url: 'http://localhost:4222'
})

stan.on('connect', () => {
    logger.info('listener connected')
    stan.on('close', () => {
        logger.debug('NATS connection closed!')
        process.exit()
    })

    let options = stan.subscriptionOptions()
                        .setManualAckMode(true)
    let subscription = stan.subscribe('ticket:create', 'orders-service-queue-group', options)
    subscription.on('message', (message: Message) => {
        const data = message.getData()

        if (typeof data === 'string') {
            const sequence = message.getSequence()
            const msg = JSON.parse(data)
            logger.info(`#${sequence} listener received message: ${data}`)
            message.ack()
        }
        
        
        
    })
});

process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())