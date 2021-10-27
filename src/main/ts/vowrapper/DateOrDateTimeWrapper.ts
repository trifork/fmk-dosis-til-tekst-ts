import { DosisTilTekstException } from "../DosisTilTekstException";

export class DateOrDateTimeWrapper {

    private date: Date;
    private dateTime: Date;

    public static fromJsonObject(jsonObject: any) {
        if (jsonObject) {
            return new DateOrDateTimeWrapper(jsonObject.date ? new Date(jsonObject.date) : undefined, jsonObject.dateTime ? new Date(jsonObject.dateTime) : undefined);
        }

        return undefined;
    }

    public constructor(date: Date, dateTime: Date) {
        this.date = date;
        this.dateTime = dateTime;
    }

    getDate(): Date {
        return this.date;
    }

    getDateTime(): Date {
        return this.dateTime;
    }

    public getDateOrDateTime(): Date {
        if (this.date)
            return this.date;
        else
            return this.dateTime;
    }

    public plusDays(days: number): DateOrDateTimeWrapper {

        if (this.date) {
            let d = new Date(this.date.getTime());
            d.setDate(this.date.getDate() + days);

            return new DateOrDateTimeWrapper(d, null);
        } else {
            let d = new Date(this.dateTime.getTime());
            d.setDate(this.dateTime.getDate() + days);

            return new DateOrDateTimeWrapper(null, d);
        }
    }

    public isEqualTo(dt: DateOrDateTimeWrapper): boolean {
        if (dt) {
            if (this.getDate() && dt.getDate())
                return this.getDate().getTime() === dt.getDate().getTime();
            else if (this.getDateTime() && dt.getDateTime())
                return this.getDateTime().getTime() === dt.getDateTime().getTime();
            else
                return !dt.getDate() && !dt.getDateTime() && !this.getDate() && !this.getDateTime();
        }
        return false;
    }
}
