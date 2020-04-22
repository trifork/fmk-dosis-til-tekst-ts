export class LocalTime {

    private hour: number;
    private minute: number;
    private second: number;

    public getMinute(): number {
        return this.minute;
    }

    public getSecond(): number {
        return this.second;
    }

    public getHour(): number {
        return this.hour;
    }

    public constructor(hour: number, minute: number, second?: number) {
        this.hour = hour;
        this.minute = minute;
        this.second = second;
    }

    public static fromJsonObject(jsonObject: any): LocalTime {
        return new LocalTime(jsonObject.hour, jsonObject.minute, jsonObject.second);
    }

    public toString(): string {

        let hourString = this.hour.toString();
        if (hourString.length === 1) {
            hourString = "0" + hourString;
        }
        let minuteString = this.minute.toString();
        if (minuteString.length === 1) {
            minuteString = "0" + minuteString;
        }

        let secondString: string;

        if (this.second !== undefined) {
            secondString = this.second.toString();
            if (secondString.length === 1) {
                secondString = "0" + secondString;
            }
        }

        let s = hourString + ":" + minuteString;
        if (secondString) {
            s += ":" + secondString;
        }

        return s;
    }
}
