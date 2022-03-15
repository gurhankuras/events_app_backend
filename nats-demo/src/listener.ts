import { logger } from '@gkeventsapp/common';
import { randomBytes, randomInt } from 'crypto';
import nats, { Message, Stan } from 'node-nats-streaming'
import { Listener } from './events/base-listener';
import { TicketCreatedListener } from './events/ticket-created-listener';
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
    new TicketCreatedListener(stan).listen()
});

process.on('SIGINT', () => stan.close())
process.on('SIGTERM', () => stan.close())

