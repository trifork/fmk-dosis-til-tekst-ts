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

    public getDayOfWeek(): number {
        return this._dayOfWeek;
    }

    public getName(): string {
        return this._name;
    }

    public getDay(): DayWrapper {
        return this._day;
    }
}
