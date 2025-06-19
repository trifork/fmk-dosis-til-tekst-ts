import {LocalTimeWrapper} from "./LocalTimeWrapper";
import { TimedDose } from "../dto/Dosage";
import {DoseWrapper} from "./DoseWrapper";

export class TimedDoseWrapper extends DoseWrapper {

    readonly value: TimedDose;

    constructor(time: LocalTimeWrapper, doseQuantity: number, minimalDoseQuantity: number | undefined, maximalDoseQuantity: number | undefined, isAccordingToNeed: boolean) {
        super();
        this.value = {
            type: "TimedDoseWrapper",
            time: time.value,
            doseQuantity,
            minimalDoseQuantity,
            maximalDoseQuantity,
            isAccordingToNeed
        };
    }
}
