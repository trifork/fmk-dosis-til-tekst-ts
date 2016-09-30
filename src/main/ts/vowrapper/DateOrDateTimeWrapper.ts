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

    getDate(): Date {
        return this._date;
    }

    getDateTime(): Date {
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
            if (this.getDate())
                return this.getDate().getTime() === dt.getDate().getTime();
            else if (this.getDateTime())
                return this.getDateTime().getTime() === dt.getDateTime().getTime();
            else
                return !dt.getDate() && !dt.getDateTime();
        }
        return false;
    }
}
