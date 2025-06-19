import { MorningDose } from "../dto/Dosage";
import { DoseWrapper } from "./DoseWrapper";

export class MorningDoseWrapper extends DoseWrapper {

    readonly value: MorningDose;

    constructor(doseQuantity: number, minimalDoseQuantity: number | undefined, maximalDoseQuantity: number | undefined, isAccordingToNeed: boolean) {
        super();
        this.value = {
            type: "MorningDoseWrapper",
            doseQuantity,
            minimalDoseQuantity,
            maximalDoseQuantity,
            isAccordingToNeed
        };
    }

}
