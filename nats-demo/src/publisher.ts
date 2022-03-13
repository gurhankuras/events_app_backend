import { logger } from '@gkeventsapp/common';
import nats from 'node-nats-streaming'
logger.level = 'debug'

console.clear()

const stan = nats.connect('gkevents', 'publisher', {
    url: 'http://localhost:4222',
})

stan.on('connect', () => {
    logger.info('publisher connected')

    const data = {
        id: "123",
        price: 20
    }

    let json = JSON.stringify(data)
    stan.publish('ticket:create', json, () => {
        logger.debug('event published')
    })
});