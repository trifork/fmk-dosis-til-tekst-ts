import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";

export abstract class SimpleLongTextConverterImpl extends LongTextConverterImpl {

    public convert(text: string, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper): string {

        let s = "";

        if (startDateOrDateTime && endDateOrDateTime && startDateOrDateTime.isEqualTo(endDateOrDateTime)) {
            // Same day dosage
            s += "Doseringen foretages kun " + this.datesToLongText(endDateOrDateTime) + ".\n" + "   Dosering:\n   ";
        }
        else if (startDateOrDateTime) {
            s += this.getDosageStartText(startDateOrDateTime);
            if (endDateOrDateTime) {
                s += " og ophører " + this.datesToLongText(endDateOrDateTime) + ".\n" + "   Doseringsforløb:\n   ";
            }
            else {
                s += ".\n   Doseringsforløb:\n   ";
            }
        }
        else if (!startDateOrDateTime) {
            if (endDateOrDateTime) {
                s += "Doseringsforløbet ophører " + this.datesToLongText(endDateOrDateTime) + ".\n" + "   Doseringsforløb:\n   ";
            }
        }

        s += text;

        return s;
    }
}
