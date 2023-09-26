import { DoseWrapper } from "./DoseWrapper";

export class NightDoseWrapper extends DoseWrapper {

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new NightDoseWrapper(jsonObject.doseQuantity, jsonObject.minimalDoseQuantity, jsonObject.maximalDoseQuantity, jsonObject.isAccordingToNeed)
            : undefined;
    }

    static LABEL = "nat";

    public getLabel() {
        return NightDoseWrapper.LABEL;
    }
}
