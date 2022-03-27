
export type GetSortedByCreationParams = {
    roomId: string,
    options?: {
        after?: string, 
        limit?: number,
        page?: number, 
    }
}

export type Message = {
    text: string,
    image?: string,
    sender: string,
    sentAt: Date
}

export interface MessageRepository {
    paginatedByCreation(params: GetSortedByCreationParams): Promise<any>
    add(roomId: string, message: Message): Promise<any>
}