import { DateOrDateTime } from "../dto/Dosage";

export class DateOrDateTimeHelper {
    public static getDateOrDateTime(dateOrDateTime: DateOrDateTime): Date | undefined {
        if (dateOrDateTime) {
            if (dateOrDateTime.date) {
                const date = dateOrDateTime.date;
                if (typeof date === "string" && date.length === 10) {
                    // yyyy-mm-dd format - make it at noon to avoid timezone issues
                    return new Date(date + "T12:00:00");
                }
                return new Date(dateOrDateTime.date);
            }
            if (dateOrDateTime.dateTime) {
                return new Date(dateOrDateTime.dateTime);
            }
        }
    }

    public static plusDays(dateOrDateTime: DateOrDateTime, days: number): DateOrDateTime {

        if (dateOrDateTime.date) {
            const d = new Date(dateOrDateTime.date);
            d.setDate(d.getDate() + days);

            return {
                date: d.toISOString()
            };
        } else {
            const d = new Date(dateOrDateTime.dateTime);
            d.setDate(d.getDate() + days);

            return {
                dateTime: d.toISOString()
            };
        }
    }

    public static isEqualTo(dt1: DateOrDateTime, dt2: DateOrDateTime): boolean {
        if (dt2) {
            if (dt1.date && dt2.date)
                return dt1.date === dt2.date;
            else if (dt1.dateTime && dt2.dateTime)
                return dt1.dateTime === dt2.dateTime;
            else
                return !dt2.date && !dt2.dateTime && !dt1.date && !dt1.dateTime;
        }
        return false;
    }
}