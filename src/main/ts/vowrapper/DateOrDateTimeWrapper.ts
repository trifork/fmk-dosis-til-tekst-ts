import { DosisTilTekstException } from "../DosisTilTekstException";

export class DateOrDateTimeWrapper {

    private _date: Date;
    private _dateTime: Date;

    public static fromJsonObject(jsonObject: any) {
        if (jsonObject) {
            return new DateOrDateTimeWrapper(jsonObject.date ? new Date(jsonObject.date) : undefined, jsonObject.dateTime ? new Date(jsonObject.dateTime) : undefined);
        }

        return undefined;
    }

    public constructor(date: Date, dateTime: Date) {
        this._date = date;
        this._dateTime = dateTime;
    }

    get date(): Date {
        return this._date;
    }

    get dateTime(): Date {
        return this._dateTime;
    }

    public getDateOrDateTime(): Date {
        if (this._date)
            return this._date;
        else
            return this._dateTime;
    }

    public isEqualTo(dt: DateOrDateTimeWrapper): boolean {
        if (dt) {
            if (this.date)
                return this.date.getTime() === dt.date.getTime();
            else if (this.dateTime)
                return this.dateTime.getTime() === dt.dateTime.getTime();
            else
                return !dt.date && !dt.dateTime;
        }
        return false;
    }
}
