import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";

export class FreeTextWrapper {

    private _startDateOrDateTime: DateOrDateTimeWrapper;
    private _endDateOrDateTime: DateOrDateTimeWrapper;
    private _text: string;

    public static fromJsonObject(jsonObject: any): FreeTextWrapper {
        return jsonObject ? new FreeTextWrapper(DateOrDateTimeWrapper.fromJsonObject(jsonObject.startDateOrDateTime),
            DateOrDateTimeWrapper.fromJsonObject(jsonObject.endDateOrDateTime),
            jsonObject.text) : undefined;
    }

    public static makeFreeText(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string): FreeTextWrapper {
        return new FreeTextWrapper(startDateOrDateTime, endDateOrDateTime, text);
    }

    constructor(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string) {
        this._startDateOrDateTime = startDateOrDateTime;
        this._endDateOrDateTime = endDateOrDateTime;
        this._text = text;
    }

    public getStartDateOrDateTime(): DateOrDateTimeWrapper {
        return this._startDateOrDateTime;
    }

    public getEndDateOrDateTime(): DateOrDateTimeWrapper {
        return this._endDateOrDateTime;
    }

    public getText(): string {
        return this._text;
    }
}
