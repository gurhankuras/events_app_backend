import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
    statusCode = 400

    constructor(private errors: ValidationError[]) {
        super('invalid request parameters')
        Object.setPrototypeOf(this, RequestValidationError.prototype)
    }
    
    serializeErrors() {
        return this.errors.map((e) => 
            ({
                message: e.msg,
                field: e.param
            })
        );
        
    }
}