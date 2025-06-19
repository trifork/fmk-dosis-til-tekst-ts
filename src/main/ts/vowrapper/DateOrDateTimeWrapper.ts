import { formatDateOnly } from "../DateUtil";
import { DateOnly } from "../dto/Dosage";

export class DateOrDateTimeWrapper {

    readonly value: DateOnly;

    public constructor(date: Date | undefined, dateTime: Date | undefined) {
        if (date) {
            this.value = formatDateOnly(date);
        } else if (dateTime) {
            this.value = formatDateOnly(dateTime);
        }
    }
}
