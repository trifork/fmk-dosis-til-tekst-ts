import { DoseWrapper } from "./DoseWrapper";

export class PlainDoseWrapper extends DoseWrapper {

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new PlainDoseWrapper(jsonObject.doseQuantity, jsonObject.minimalDoseQuantity, jsonObject.maximalDoseQuantity, jsonObject.doseQuantityString, jsonObject.minimalDoseQuantityString, jsonObject.maximalDoseQuantityString, jsonObject.isAccordingToNeed)
            : undefined;
    }

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        doseQuantityString: string, minimalDoseQuantityString: string, maximalDoseQuantityString: string,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    static LABEL = "";

    public getLabel(): string {
        return PlainDoseWrapper.LABEL;
    }

}
