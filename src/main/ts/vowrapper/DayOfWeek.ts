import { DayWrapper } from "./DayWrapper";

export class DayOfWeek {

    private _dayOfWeek: number;
    private _name: string;
    private _day: DayWrapper;

    public constructor(dayOfWeek: number, name: string, day: DayWrapper) {
        this._dayOfWeek = dayOfWeek;
        this._name = name;
        this._day = day;
    }

    public get dayOfWeek(): number {
        return this._dayOfWeek;
    }

    public get name(): string {
        return this._name;
    }

    public get day(): DayWrapper {
        return this._day;
    }
}