import { PlainDose } from "../dto/Dosage";
import { DoseWrapper } from "./DoseWrapper";

export class PlainDoseWrapper extends DoseWrapper {

    readonly value: PlainDose;

    constructor(doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number, isAccordingToNeed: boolean) {
        super();
        this.value = {
            type: "PlainDoseWrapper",
            doseQuantity,
            minimalDoseQuantity,
            maximalDoseQuantity,
            isAccordingToNeed
        };
    }
}
