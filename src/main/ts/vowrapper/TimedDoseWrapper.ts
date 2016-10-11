import {LocalTime} from "../LocalTime";
import {DoseWrapper} from "./DoseWrapper";

export class TimedDoseWrapper extends DoseWrapper {

    private time: LocalTime;

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new TimedDoseWrapper(LocalTime.fromJsonObject(jsonObject.time), jsonObject.doseQuantity, jsonObject.minimalDoseQuantity, jsonObject.maximalDoseQuantity, jsonObject.doseQuantityString, jsonObject.minimalDoseQuantityString, jsonObject.maximalDoseQuantityString, jsonObject.isAccordingToNeed)
            : undefined;
    }

    static fromJsonObjectTime(jsonObject: any): Date {
        return new Date();
    }

    constructor(
        time: LocalTime,
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        doseQuantitystring: string, minimalDoseQuantitystring: string, maximalDoseQuantitystring: string,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
        this.time = time;
    }

    static LABEL = "kl.";

    public getLabel() {
        return TimedDoseWrapper.LABEL + " " + this.time.toString();
    }

    public getTime(): string {
        return this.time.toString();
    }

    public theSameAs(other: DoseWrapper): boolean {
        if (!(other instanceof TimedDoseWrapper))
            return false;
        if (!super.theSameAs(other))
            return false;
        return this.getTime() === (other as TimedDoseWrapper).getTime();
    }
}
