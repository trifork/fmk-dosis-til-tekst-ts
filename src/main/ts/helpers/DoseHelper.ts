import { TextHelper } from "../TextHelper";
import { Dose, TimedDose } from "../dto/Dosage";
import { LocalTimeHelper } from "./LocalTimeHelper";

export class DoseHelper {
    public static getLabel(dose: Dose): string {
        switch (dose.type) {
            case "MorningDoseWrapper":
                return "morgen";
            case "NoonDoseWrapper":
                return "middag";
            case "EveningDoseWrapper":
                return "aften";
            case "NightDoseWrapper":
                return "nat";
            case "PlainDoseWrapper":
                return "";
            case "TimedDoseWrapper":
                return "kl. " + LocalTimeHelper.toString((dose as TimedDose).time);
        }
    }
    /*
    public static static  to(value: number) {
        if(value==null)
            return null;
         v = new (value);
        v = v.setScale(9, .ROUND_HALF_UP);
        return v;
    }
      */

    protected static isZero(dose: Dose, quantity: number): boolean {
        if (quantity) {
            return quantity < 0.000000001;
        }
        else {
            return true;
        }
    }

    protected static isMinAndMaxZero(minimalQuantity, maximalQuantity): boolean {
        return !minimalQuantity && !maximalQuantity;
    }

    public static getAnyDoseQuantityString(dose: Dose) {
        if (typeof dose.doseQuantity === "number") {
            return TextHelper.formatQuantity(dose.doseQuantity);
        }
        if (typeof dose.minimalDoseQuantity === "number" && typeof dose.maximalDoseQuantity === "number") {
            return `${TextHelper.formatQuantity(dose.minimalDoseQuantity)} - ${TextHelper.formatQuantity(dose.maximalDoseQuantity)}`;
        }
    }

    public static theSameAs(dose: Dose, other: Dose): boolean {
        if (DoseHelper.getLabel(dose) !== DoseHelper.getLabel(other))
            return false;
        if (dose.isAccordingToNeed !== other.isAccordingToNeed)
            return false;

        return dose.doseQuantity === other.doseQuantity && dose.minimalDoseQuantity === other.minimalDoseQuantity && dose.maximalDoseQuantity === other.maximalDoseQuantity;
    }
}