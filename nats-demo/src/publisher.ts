import { logger, UserCreatedEvent } from '@gkeventsapp/common';
import nats from 'node-nats-streaming'
import { UserCreatedEventPublisher } from './events/user-created-publisher'
logger.level = 'debug'

console.clear()

const stan = nats.connect('gkevents', 'publisher', {
    url: 'http://localhost:4222',
})

stan.on('connect', async () => {
    logger.info('publisher connected')

    const data: UserCreatedEvent['data'] = {
        id: "123",
        email: 'gurhankuras@hotmail.com',
        name: 'Gurhan Kuras',
    }

   const publisher = new UserCreatedEventPublisher(stan)
   
   try {
        await publisher.publish(data)    
   } catch (error) {
       console.log(error)
   }
   
});

