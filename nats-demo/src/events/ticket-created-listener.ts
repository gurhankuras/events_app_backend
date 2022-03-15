import { logger } from "@gkeventsapp/common"
import { Message } from "node-nats-streaming"
import { Listener } from "./base-listener"
import { Subjects } from "./subjects"
import { TicketCreatedEvent } from "./ticket-created-event"

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    readonly subject: Subjects.TicketCreated = Subjects.TicketCreated
    queueGroupName: string = 'orders-service-queue-group'

    onMessage(data: TicketCreatedEvent['data'], msg: Message): void {
        logger.info(`#${msg.getSequence()} listener received message: ${data}`)
        msg.ack()
    }

}