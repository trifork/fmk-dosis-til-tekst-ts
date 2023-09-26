import { DoseWrapper } from "./DoseWrapper";

export class NoonDoseWrapper extends DoseWrapper {

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new NoonDoseWrapper(jsonObject.doseQuantity, jsonObject.minimalDoseQuantity, jsonObject.maximalDoseQuantity, jsonObject.isAccordingToNeed)
            : undefined;
    }

    static LABEL = "middag";

    public getLabel() {
        return NoonDoseWrapper.LABEL;
    }
}
