import { DoseWrapper } from "./DoseWrapper";
import { DosisTilTekstException } from "../DosisTilTekstException";
import { Interval } from "../Interval";
import { PlainDoseWrapper } from "./PlainDoseWrapper";
import { TimedDoseWrapper } from "./TimedDoseWrapper";
import { MorningDoseWrapper } from "./MorningDoseWrapper";
import { NoonDoseWrapper } from "./NoonDoseWrapper";
import { EveningDoseWrapper } from "./EveningDoseWrapper";
import { NightDoseWrapper } from "./NightDoseWrapper";
import { Day } from "../dto/Dosage";

export class DayWrapper {

    readonly value: Day;

    public constructor(dayNumber: number, doses: DoseWrapper[]) {
        this.value = {
            dayNumber: dayNumber,
            allDoses: doses.map(doseWrapper => doseWrapper.value)
        };
    }
}
