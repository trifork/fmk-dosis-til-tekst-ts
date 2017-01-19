import { DosisTilTekstException } from "../DosisTilTekstException";

export class DateOrDateTimeWrapper {

    private date: Date;
    private dateTime: Date;

    public static fromJsonObject(jsonObject: any) {
        if (jsonObject) {
            if (jsonObject.date) {
                let dateparts = jsonObject.date.split("-");
                return new DateOrDateTimeWrapper(new Date(Number(dateparts[0]), Number(dateparts[1]) - 1, Number(dateparts[2])), undefined);
            }
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

    public isEqualTo(dt: DateOrDateTimeWrapper): boolean {
        if (dt) {
            if (this.getDate() && dt.getDate())
                return this.getDate().getTime() === dt.getDate().getTime();
            else if (this.getDateTime() && dt.getDateTime())
                return this.getDateTime().getTime() === dt.getDateTime().getTime();
            else
                return !dt.getDate() && !dt.getDateTime();
        }
        return false;
    }
}
