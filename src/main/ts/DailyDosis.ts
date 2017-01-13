
import { UnitOrUnitsWrapper } from "./vowrapper/UnitOrUnitsWrapper";
import { Interval } from "./Interval";

export class DailyDosis {

    private value: number;
    private interval: Interval<number>;
    private unitOrUnits: UnitOrUnitsWrapper;


    public constructor(value: number, interval: Interval<number>, unitOrUnits: UnitOrUnitsWrapper) {
        this.value = value;
        this.interval = interval;
        this.unitOrUnits = unitOrUnits;
    }

    public getValue(): number {
        return this.value;
    }

    public getInterval(): Interval<number> {
        return this.interval;
    }

    public getUnitOrUnits(): UnitOrUnitsWrapper {
        return this.unitOrUnits;
    }

    public isValue(): boolean {
        return this.value !== undefined && this.value != null;
    }

    public isInterval(): boolean {
        return this.interval !== undefined;
    }

    public isNone(): boolean {
        return this.value !== undefined && this.interval !== undefined;
    }

}
