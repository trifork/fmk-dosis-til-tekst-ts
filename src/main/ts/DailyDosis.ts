
import { Interval } from "./Interval";
import { UnitOrUnits } from "./dto/Dosage";

export interface DailyDosis {

    value: number;
    interval: Interval<number>;
    unitOrUnits: UnitOrUnits;


    // public isNone(): boolean {
    //     return this.value !== undefined && this.interval !== undefined;
    // }

}
