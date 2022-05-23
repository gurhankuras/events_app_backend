import mongoose from 'mongoose';
import 'express-async-errors'
import { server } from "./app";
import { natsWrapper } from "./nats-wrapper";
// import { UserCreatedListener } from "./events/listeners/user-created-listener";
import { logger } from '@gkeventsapp/common';
import amqp from 'amqplib';
import { User } from './models/user';

function handlePublishedUser(channel: amqp.Channel) {
    return async (msg: amqp.ConsumeMessage | null) => {
        if (msg == null) {
            return;
        }
        const message = JSON.parse(msg.content.toString())
        console.log(`Received message: ${message.toString()}`);
        const user = User.build({_id: message.id, name: message.email});
        await user.save()
        channel.ack(msg);
    }
}


async function listen() {
    const connection = await amqp.connect('amqp://localhost')
    const channel = await connection.createChannel();
    const consumeSettings: amqp.Options.Consume = { noAck: false }
    const queueName = 'hello'
    try {
        const q = await channel.assertQueue(queueName)
        const exchange = await channel.assertExchange('trigger', 'fanout', { durable: true })
        await channel.bindQueue(q.queue, 'trigger', '');

        channel.consume(queueName, handlePublishedUser(channel), consumeSettings)
    }
    catch(e) {
        console.log(`Error - ${e}`);
    }
} 
//function connectToRabbitmq() {
    /*
    amqp.connect('amqp://localhost').then(function(conn) {
        process.once('SIGINT', function() { conn.close(); });
        return conn.createChannel().then(function(ch) {
      
          var ok: any = ch.assertQueue('hello', {durable: false});
      
          ok = ok.then(function(_qok: any) {
            return ch.consume('hello', function(msg) {
              console.log(" [x] Received '%s'", msg!.content.toString());
            }, {noAck: true});
          });
      
          return ok.then(function(_consumeOk: any) {
            console.log(' [*] Waiting for messages. To exit press CTRL+C');
          });
        });
      }).catch(console.warn);     
      */ 
//}



const PORT = 3000

const start = async () => {
    console.log('chat works!')

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI env value not found!")
    }
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY not provided")
    }
    /*
    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error("NATS_CLUSTER_ID not provided")
    }
    if (!process.env.NATS_CLIENT_ID) {
        throw new Error("NATS_CLIENT_ID not provided")
    }
    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL not provided")
    }
    */
    
    try {
        //connectToRabbitmq()
        /*
        await natsWrapper.connect(process.env.NATS_CLUSTER_ID, process.env.NATS_CLIENT_ID, process.env.NATS_URL)
        natsWrapper.client?.on('close', () => {
            logger.debug('NATS connection closed!')
            process.exit()
        })
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())
        new UserCreatedListener(natsWrapper.client).listen()
        */

       // await amqp.connect("amqp://localhost:5672")
        await listen();
        await mongoose.connect(process.env.MONGO_URI, {});
        logger.info('Database connected!')  
    } catch (error) {
        console.log(error)
    }
    

    server.listen(PORT, async () => {
        logger.info(`🚀 Listening on port ${PORT}`);
    });
}

start()




/*
chat-service:
    container_name: chat-service
    build: .
    environment:
      - JWT_KEY=cekoslavaklastiramadiklarimizdanmisiniz
      - MONGO_URI=mongodb://chat-service-mongo:27017/chat
    ports:
      - "3000:3000"
    networks:
      - resolute
    depends_on:
      - chat-service-mongo
      - rabbitmq
    

*/