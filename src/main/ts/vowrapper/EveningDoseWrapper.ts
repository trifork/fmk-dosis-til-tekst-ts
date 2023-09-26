
import { DoseWrapper } from "./DoseWrapper";

export class EveningDoseWrapper extends DoseWrapper {

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new EveningDoseWrapper(jsonObject.doseQuantity, jsonObject.minimalDoseQuantity, jsonObject.maximalDoseQuantity, jsonObject.isAccordingToNeed)
            : undefined;
    }

    static LABEL: string = "aften";

    public getLabel(): string {
        return EveningDoseWrapper.LABEL;
    }

}
