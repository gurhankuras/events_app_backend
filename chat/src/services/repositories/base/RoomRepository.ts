export type LastMessage = {
    text: string;
    image?: string;
    sentAt: Date;
    senderId: string;
}

export interface RoomRepository {
    getByLatest(userId: string, options: {participants: boolean, sender: boolean}): Promise<any>
    updateLastMessage(roomId: string, message: LastMessage): Promise<any>
    createWithTwoUser(userId: string, otherUserId: string, populated: boolean): Promise<any>
}