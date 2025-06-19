import { FreeText } from "../dto/Dosage";
import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";

export class FreeTextWrapper {

    readonly value: FreeText;

    public static makeFreeText(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string): FreeTextWrapper {
        return new FreeTextWrapper(startDateOrDateTime, endDateOrDateTime, text);
    }

    constructor(startDateOrDateTime: DateOrDateTimeWrapper | null | undefined, endDateOrDateTime: DateOrDateTimeWrapper | null | undefined, text: string) {
        this.value = {
            startDate: startDateOrDateTime?.value,
            endDate: endDateOrDateTime?.value,
            text
        };
    }
}
