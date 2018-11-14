export class LoggerService {

    public static info(msg: string) {
        console.log("info", msg);
    }

    public static error(msg: string) {
        console.log("error", msg);
    }

    public static debug(msg: string) {
        console.log("debug", msg);
    }

}
