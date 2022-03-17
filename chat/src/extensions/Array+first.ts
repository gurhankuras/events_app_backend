
export {}

declare global {
    //namespace NodeJS {
        interface Array<T> {
            first(): T | undefined
        }
    //}
}

Array.prototype.first = function() {
    return this[0];
}