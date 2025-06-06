import { Day } from "../dto/Dosage";
import { DoseWrapper } from "./DoseWrapper";

export class DayWrapper {

    readonly value: Day;

    public constructor(dayNumber: number, doses: DoseWrapper[]) {
        this.value = {
            dayNumber: dayNumber,
            allDoses: doses.map(doseWrapper => doseWrapper.value)
        };
    }
}
