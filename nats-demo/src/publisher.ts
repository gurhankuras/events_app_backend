import { logger } from '@gkeventsapp/common';
import nats from 'node-nats-streaming'
import { Publisher } from './events/base-publisher';
import { Subjects } from './events/subjects';
import { TicketCreatedEvent } from './events/ticket-created-event';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

logger.level = 'debug'

console.clear()

const stan = nats.connect('gkevents', 'publisher', {
    url: 'http://localhost:4222',
})

stan.on('connect', () => {
    logger.info('publisher connected')

    const data = {
        id: "123",
        title: "",
        price: "20"
    }

   new TicketCreatedPublisher(stan).publish(data)
});

