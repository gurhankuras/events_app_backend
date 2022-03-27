export class RoomNotFound extends Error {
    constructor(roomId: string, userId: string) {
        super(`Room with ${roomId} id in which the participant with ${userId} is`)
    }
}