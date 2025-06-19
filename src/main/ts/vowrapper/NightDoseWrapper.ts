import { NightDose } from "../dto/Dosage";
import { DoseWrapper } from "./DoseWrapper";

export class NightDoseWrapper extends DoseWrapper {

    readonly value: NightDose;

    constructor(doseQuantity: number, minimalDoseQuantity: number | undefined, maximalDoseQuantity: number | undefined, isAccordingToNeed: boolean) {
        super();
        this.value = {
            type: "NightDoseWrapper",
            doseQuantity,
            minimalDoseQuantity,
            maximalDoseQuantity,
            isAccordingToNeed
        };
    }

}
