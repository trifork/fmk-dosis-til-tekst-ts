import { DoseWrapper } from "./DoseWrapper";
import { LoggerService } from "../LoggerService";

export class MorningDoseWrapper extends DoseWrapper {

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        doseQuantitystring: string, minimalDoseQuantitystring: string, maximalDoseQuantitystring: string,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    public static fromJsonObject(jsonObject: any) {
        if (jsonObject) {
            LoggerService.debug("MorningDoseWrapper minimalDoseQuantity " + jsonObject.minimalDoseQuantity);
            LoggerService.debug("MorningDoseWrapper maximalDoseQuantity " + jsonObject.maximalDoseQuantity);
        }

        return jsonObject ?
            new MorningDoseWrapper(jsonObject.doseQuantity, jsonObject.minimalDoseQuantity, jsonObject.maximalDoseQuantity, jsonObject.doseQuantityString, jsonObject.minimalDoseQuantityString, jsonObject.maximalDoseQuantityString, jsonObject.isAccordingToNeed)
            : undefined;
    }

    static LABEL = "morgen";

    public getLabel() {
        return MorningDoseWrapper.LABEL;
    }
}
