import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { TextOptions } from "../TextOptions";
import { DateOrDateTime } from "../dto/Dosage";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";

export abstract class SimpleLongTextConverterImpl extends LongTextConverterImpl {

    public convert(text: string, startDateOrDateTime: DateOrDateTime, endDateOrDateTime: DateOrDateTime, options: TextOptions): string {

        let s = "";

        if (startDateOrDateTime && endDateOrDateTime && DateOrDateTimeHelper.isEqualTo(startDateOrDateTime, endDateOrDateTime)) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(startDateOrDateTime) + ":\n";
        }
        else if (startDateOrDateTime) {
            s += this.getDosageStartText(startDateOrDateTime, 0, options);
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
