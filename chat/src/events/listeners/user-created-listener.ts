import { logger } from "@gkeventsapp/common"
import { Message } from "node-nats-streaming"
import { Listener } from "@gkeventsapp/common"
import { Subjects } from "@gkeventsapp/common"
import { UserCreatedEvent } from "@gkeventsapp/common"
import { User } from "../../models/user"
import mongoose from "mongoose"

export class UserCreatedListener extends Listener<UserCreatedEvent> {
    readonly subject: Subjects.UserCreatedEvent = Subjects.UserCreatedEvent
    queueGroupName: string = 'chat-service-queue-group'

    async onMessage(data: UserCreatedEvent['data'], msg: Message): Promise<void> {
        logger.info(`#${msg.getSequence()} listener received message: ${JSON.stringify(data)}`)
        const user = User.build({_id: new mongoose.Types.ObjectId(data.id), name: data.name})
        await user.save()
        msg.ack()
    }
}