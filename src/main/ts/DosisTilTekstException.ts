export  class DosisTilTekstException {
    message: string;

    public constructor(msg: string) {
        this.message = msg;
    }

    public getMessage(): string {
        return this.message;
    }
}