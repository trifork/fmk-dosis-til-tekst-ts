import { FreeText } from "../dto/Dosage";
import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";

export class FreeTextWrapper {

    readonly value: FreeText;

    public static makeFreeText(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string): FreeTextWrapper {
        return new FreeTextWrapper(startDateOrDateTime, endDateOrDateTime, text);
    }

    constructor(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string) {
        this.value = {
            startDateOrDateTime: startDateOrDateTime && startDateOrDateTime.value,
            endDateOrDateTime: endDateOrDateTime && endDateOrDateTime.value,
            text
        };
    }
}
