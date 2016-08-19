
import { DoseWrapper } from './DoseWrapper';

export class EveningDoseWrapper extends DoseWrapper {

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        doseQuantityString: string, minimalDoseQuantityString: string, maximalDoseQuantityString: string,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    public static makeDose(quantity: number, isAccordingToNeed = false): EveningDoseWrapper {
        if (EveningDoseWrapper.isZero(quantity))
            return null;
        return new EveningDoseWrapper(quantity, null, null, null, null, null, isAccordingToNeed);
    }

    public static makeDoseWithText(quantity: number, supplText: string, isAccordingToNeed = false): EveningDoseWrapper {
        if (EveningDoseWrapper.isZero(quantity))
            return null;
        return new EveningDoseWrapper(quantity, null, null, supplText, null, null, isAccordingToNeed);
    }

    public static makeDoseWithMinMax(minimalQuantity: number, maximalQuantity: number, isAccordingToNeed = false): EveningDoseWrapper {
        if (EveningDoseWrapper.isMinAndMaxZero(minimalQuantity, maximalQuantity))
            return null;
        return new EveningDoseWrapper(null, minimalQuantity, maximalQuantity, null, null, null, isAccordingToNeed);
    }

    public static makeDoseWithMinMaxAndText(minimalQuantity: number, maximalQuantity: number, minimalSupplText: string, maximalSupplText: string, isAccordingToNeed: boolean): EveningDoseWrapper {
        if (EveningDoseWrapper.isMinAndMaxZero(minimalQuantity, maximalQuantity))
            return null;
        return new EveningDoseWrapper(null, minimalQuantity, maximalQuantity, null, minimalSupplText, maximalSupplText, isAccordingToNeed);
    }

    static LABEL: string = "aften";

    public getLabel(): string {
        return EveningDoseWrapper.LABEL;
    }

}
