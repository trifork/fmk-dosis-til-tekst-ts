import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";

export abstract class SimpleLongTextConverterImpl extends LongTextConverterImpl {

    public convert(text: string, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper): string {

        let s = "";

        if (startDateOrDateTime && endDateOrDateTime && startDateOrDateTime.isEqualTo(endDateOrDateTime)) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(startDateOrDateTime) + ":\n";
        }
        else if (startDateOrDateTime) {
            s += this.getDosageStartText(startDateOrDateTime, 0);
            if (endDateOrDateTime) {
                s += " til d. " + this.datesToLongText(endDateOrDateTime) + ":\n";
            }
            else {
                s += ":\n";
            }
        }
        else if (!startDateOrDateTime) {
            if (endDateOrDateTime) {
                s += "Dosering til d. " + this.datesToLongText(endDateOrDateTime) + ":\n";
            }
        }

        s += text;

        return s;
    }
}
