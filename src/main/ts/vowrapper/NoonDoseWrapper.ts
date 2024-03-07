import { NoonDose } from "../dto/Dosage";
import { DoseWrapper } from "./DoseWrapper";

export class NoonDoseWrapper extends DoseWrapper {

    readonly value: NoonDose;

    constructor(doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number, isAccordingToNeed: boolean) {
        super();
        this.value = {
            type: "NoonDoseWrapper",
            doseQuantity,
            minimalDoseQuantity,
            maximalDoseQuantity,
            isAccordingToNeed
        };
    }
}
