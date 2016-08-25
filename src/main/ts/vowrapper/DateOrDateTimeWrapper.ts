import { DosisTilTekstException } from "../DosisTilTekstException";

export class DateOrDateTimeWrapper {

    private _date: Date;
    private _dateTime: Date;

    public static fromJsonObject(parsedObject: any) {
        if (parsedObject) {
            return new DateOrDateTimeWrapper(parsedObject.date ? new Date(parsedObject.date) : undefined, parsedObject.dateTime ? new Date(parsedObject.dateTime) : undefined);
        }

        return undefined;
    }

    public static makeDate(date: Date): DateOrDateTimeWrapper {
        return new DateOrDateTimeWrapper(date, null);
    }

    public static makeDateFromString(date: string): DateOrDateTimeWrapper {

        let dt = Date.parse(date);
        if (isNaN(dt)) {
            throw new DosisTilTekstException("Cannot parse \"" + date + "\" as Date");
        }

        return new DateOrDateTimeWrapper(new Date(dt), null);
    }

    public static makeDateTime(dateTime: Date): DateOrDateTimeWrapper {
        return new DateOrDateTimeWrapper(null, dateTime);
    }

    public static makeDateTimeFromString(dateTime: string): DateOrDateTimeWrapper {
        let dt = Date.parse(dateTime);
        if (isNaN(dt)) {
            throw new DosisTilTekstException("Cannot parse \"" + dateTime + "\" as Date");
        }

        return new DateOrDateTimeWrapper(null, new Date(dt));
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
        if (!dt) return false;
        if (this.date)
            return this.date === dt.date;
        else if (this.dateTime)
            return this.dateTime === dt.dateTime;
        else
            return !dt.date && !dt.dateTime;
    }
}
