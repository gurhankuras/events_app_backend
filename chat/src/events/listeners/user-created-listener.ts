import { logger } from "@gkeventsapp/common"
import { Message } from "node-nats-streaming"
import { Listener } from "@gkeventsapp/common"
import { Subjects } from "@gkeventsapp/common"
import { UserCreatedEvent } from "@gkeventsapp/common"

export class UserCreatedListener extends Listener<UserCreatedEvent> {
    readonly subject: Subjects.UserCreatedEvent = Subjects.UserCreatedEvent
    queueGroupName: string = 'chat-service-queue-group'

    onMessage(data: UserCreatedEvent['data'], msg: Message): void {
        logger.info(`#${msg.getSequence()} listener received message: ${JSON.stringify(data)}`)
        msg.ack()
    }
}