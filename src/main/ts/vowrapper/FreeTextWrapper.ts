import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";

export class FreeTextWrapper {

    private startDateOrDateTime: DateOrDateTimeWrapper;
    private endDateOrDateTime: DateOrDateTimeWrapper;
    private text: string;

    public static fromJsonObject(jsonObject: any): FreeTextWrapper {
        return jsonObject ? new FreeTextWrapper(DateOrDateTimeWrapper.fromJsonObject(jsonObject.startDateOrDateTime),
            DateOrDateTimeWrapper.fromJsonObject(jsonObject.endDateOrDateTime),
            jsonObject.text) : undefined;
    }

    public static makeFreeText(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string): FreeTextWrapper {
        return new FreeTextWrapper(startDateOrDateTime, endDateOrDateTime, text);
    }

    constructor(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string) {
        this.startDateOrDateTime = startDateOrDateTime;
        this.endDateOrDateTime = endDateOrDateTime;
        this.text = text;
    }

    public getStartDateOrDateTime(): DateOrDateTimeWrapper {
        return this.startDateOrDateTime;
    }

    public getEndDateOrDateTime(): DateOrDateTimeWrapper {
        return this.endDateOrDateTime;
    }

    public getText(): string {
        return this.text;
    }
}
