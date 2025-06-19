import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { TextOptions } from "../TextOptions";
import { DateOnly } from "../dto/Dosage";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";

export abstract class SimpleLongTextConverterImpl extends LongTextConverterImpl {

    public convert(text: string, startDate: DateOnly, endDate: DateOnly, options: TextOptions): string {

        let s = "";

        if (startDate && endDate && DateOrDateTimeHelper.isEqualTo(startDate, endDate)) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(startDate) + ":\n";
        }
        else if (startDate) {
            s += this.getDosageStartText(startDate, 0, options);
            if (endDate) {
                s += " til d. " + this.datesToLongText(endDate) + ":\n";
            }
            else {
                s += ":\n";
            }
        }
        else if (!startDate) {
            if (endDate) {
                s += "Dosering til d. " + this.datesToLongText(endDate) + ":\n";
            }
        }

        s += text;

        return s;
    }
}
