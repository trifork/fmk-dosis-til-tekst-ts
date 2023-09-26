import { DoseWrapper } from "./DoseWrapper";

export class PlainDoseWrapper extends DoseWrapper {

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new PlainDoseWrapper(jsonObject.doseQuantity, jsonObject.minimalDoseQuantity, jsonObject.maximalDoseQuantity, jsonObject.isAccordingToNeed)
            : undefined;
    }

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    static LABEL = "";

    public getLabel(): string {
        return PlainDoseWrapper.LABEL;
    }

    public isEmptyDosage(): boolean {
        return this.getDoseQuantity() === 0 && this.getMinimalDoseQuantity() == null && this.getMaximalDoseQuantity() == null;
    }

}
