export class LocalTime {

    private _hour: number;
    private _minute: number;

    public getMinute(): number {
        return this._minute;
    }

    public getSecond(): number {
        return this._second;
    }
    private _second: number;

    public getHour(): number {
        return this._hour;
    }

    public constructor(hour: number, minute: number, second?: number) {
        this._hour = hour;
        this._minute = minute;
        this._second = second;
    }

    public static fromJsonObject(jsonObject: any): LocalTime {
        return new LocalTime(jsonObject.hour, jsonObject.minute, jsonObject.second);
    }

    public toString(): string {

        let hourString = this._hour.toString();
        if (hourString.length === 1) {
            hourString = "0" + hourString;
        }
        let minuteString = this._minute.toString();
        if (minuteString.length === 1) {
            minuteString = "0" + minuteString;
        }

        let secondString: string;

        if (this._second !== undefined) {
            secondString = this._second.toString();
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
