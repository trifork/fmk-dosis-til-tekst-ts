import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";

export class FreeTextWrapper {

    private _startDateOrDateTime: DateOrDateTimeWrapper;
    private _endDateOrDateTime: DateOrDateTimeWrapper;
    private _text: string;

    public static fromJsonObject(parsedObject: any): FreeTextWrapper {
        return parsedObject ? new FreeTextWrapper(DateOrDateTimeWrapper.fromJsonObject(parsedObject.startDateOrDateTime),
            DateOrDateTimeWrapper.fromJsonObject(parsedObject.endDateOrDateTime),
            parsedObject.text) : undefined;
    }

    public static makeFreeText(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string): FreeTextWrapper {
        return new FreeTextWrapper(startDateOrDateTime, endDateOrDateTime, text);
    }

    constructor(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, text: string) {
        this._startDateOrDateTime = startDateOrDateTime;
        this._endDateOrDateTime = endDateOrDateTime;
        this._text = text;
    }

    get startDateOrDateTime(): DateOrDateTimeWrapper {
        return this._startDateOrDateTime;
    }

    public get endDateOrDateTime(): DateOrDateTimeWrapper {
        return this._endDateOrDateTime;
    }

    public get text(): string {
        return this._text;
    }
}