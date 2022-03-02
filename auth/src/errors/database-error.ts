import { CustomError } from "./custom-error"

export class DatabaseError extends CustomError {
    statusCode = 500

    constructor(private reason: string) {
        super('error connecting to db')
        Object.setPrototypeOf(this, DatabaseError.prototype)
    }
    
    serializeErrors() {
        return [
            { message: this.reason }
        ]
        
    }
}