import { DoseWrapper } from "./DoseWrapper";

export class MorningDoseWrapper extends DoseWrapper {

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    public static fromJsonObject(jsonObject: any) {

        return jsonObject ?
            new MorningDoseWrapper(jsonObject.doseQuantity, jsonObject.minimalDoseQuantity, jsonObject.maximalDoseQuantity, jsonObject.isAccordingToNeed)
            : undefined;
    }

    static LABEL = "morgen";

    public getLabel() {
        return MorningDoseWrapper.LABEL;
    }
}
