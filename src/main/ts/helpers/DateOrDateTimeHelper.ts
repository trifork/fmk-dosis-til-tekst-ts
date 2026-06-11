import { DateOnly } from "../dto/Dosage";

export class DateOrDateTimeHelper {
    public static getDate(date: DateOnly): Date | undefined {
        if (date) {
            if (typeof date === "string" && date.length === 10) {
                // yyyy-mm-dd format - make it at noon to avoid timezone issues
                return new Date(date + "T12:00:00");
            } else {
                return new Date(date);
            }
        }
    }

    public static plusDays(date: DateOnly, days: number): DateOnly {

        const d = new Date(date);
        d.setDate(d.getDate() + days);

        return d.toISOString();
    }

    public static daysBetween(from: DateOnly, to: DateOnly, inclusive=true) {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        const utc1 = Date.UTC(
            fromDate.getFullYear(),
            fromDate.getMonth(),
            fromDate.getDate()
        );

        const utc2 = Date.UTC(
            toDate.getFullYear(),
            toDate.getMonth(),
            toDate.getDate()
        );
        const diff =  (utc2 - utc1) / (24 * 60 * 60 * 1000);
        return inclusive ? diff + 1 : diff;
    }

    public static isEqualTo(d1: DateOnly, d2: DateOnly): boolean {
        if (d2) {
            return d1 === d2;
        }
        return false;
    }
}