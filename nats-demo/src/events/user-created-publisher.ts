import { Publisher } from "@gkeventsapp/common";
import { Subjects } from "@gkeventsapp/common";
import { UserCreatedEvent } from "@gkeventsapp/common";
export class UserCreatedEventPublisher extends Publisher<UserCreatedEvent> {
    readonly subject = Subjects.UserCreatedEvent;    
}
