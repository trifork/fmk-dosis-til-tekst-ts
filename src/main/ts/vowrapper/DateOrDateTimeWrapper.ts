import { formatDateOnly, formatDateTime } from "../DateUtil";
import { DateOrDateTime } from "../dto/Dosage";

export class DateOrDateTimeWrapper {

    readonly value: DateOrDateTime;

    public constructor(date: Date, dateTime: Date) {
        this.value = {};
        if (date) {
            this.value = {
                date: formatDateOnly(date)
            }
        } else if (dateTime) {
            this.value = {
                dateTime: formatDateTime(dateTime)
            }
        }
    }
}
