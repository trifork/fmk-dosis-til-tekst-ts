
import { Interval } from "./Interval";
import { UnitOrUnits } from "./dto/Dosage";

export interface DailyDosis {

    value: number;
    /**
      * @isInt interval is specified in whole days
      */
    interval: Interval<number>;
    unitOrUnits: UnitOrUnits;
}
