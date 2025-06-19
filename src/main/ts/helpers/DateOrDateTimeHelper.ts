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

    public static isEqualTo(d1: DateOnly, d2: DateOnly): boolean {
        if (d2) {
            return d1 === d2;
        }
        return false;
    }
}