import { Stan } from "node-nats-streaming"
import { Event } from './event'

export abstract class Publisher<T extends Event>  {
    abstract subject: T['subject']
    private stan: Stan

    constructor(stan: Stan) {
        this.stan = stan
    }

    publish(msg: T['data'], onSent?: () => {}) {
        let encodedMessage = this.encodeMessage(msg)
        this.stan.publish(this.subject, encodedMessage, onSent)
    }

    private encodeMessage(msg: any) {
        return JSON.stringify(msg)
    }
}