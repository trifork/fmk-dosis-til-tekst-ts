
import { EveningDose } from "../dto/Dosage";
import { DoseWrapper } from "./DoseWrapper";

export class EveningDoseWrapper extends DoseWrapper {

    readonly value: EveningDose;

    constructor(doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number, isAccordingToNeed: boolean) {
        super();
        this.value = {
            type: "EveningDoseWrapper",
            doseQuantity,
            minimalDoseQuantity,
            maximalDoseQuantity,
            isAccordingToNeed
        };
    }
}
