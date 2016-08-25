import { DoseWrapper } from "./DoseWrapper";

export class PlainDoseWrapper extends DoseWrapper {

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number,
        doseQuantityString: string, minimalDoseQuantityString: string, maximalDoseQuantityString: string,
        isAccordingToNeed: boolean) {
        super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
    }

    public static makeDoseByNumber(quantity: number, isAccordingToNeed = false): PlainDoseWrapper {
        if (PlainDoseWrapper.isZero(quantity))
            return null;
        return new PlainDoseWrapper(quantity, null, null, null, null, null, isAccordingToNeed);
    }

    public static makeDose(quantity: number, supplText: string, isAccordingToNeed: boolean): PlainDoseWrapper {
        if (PlainDoseWrapper.isZero(quantity))
            return null;
        return new PlainDoseWrapper(quantity, null, null, supplText, null, null, isAccordingToNeed);
    }

    public static makeDoseByMinMax(minimalQuantity: number, maximalQuantity: number, isAccordingToNeed = false): PlainDoseWrapper {
        if (PlainDoseWrapper.isMinAndMaxZero(minimalQuantity, maximalQuantity))
            return null;
        return new PlainDoseWrapper(null, minimalQuantity, maximalQuantity, null, null, null, isAccordingToNeed);
    }

    public static makeDoseByMinMaxText(minimalQuantity: number, maximalQuantity: number, minimalSupplText: string, maximalSupplText: string, isAccordingToNeed = false): PlainDoseWrapper {
        if (PlainDoseWrapper.isMinAndMaxZero(minimalQuantity, maximalQuantity))
            return null;
        return new PlainDoseWrapper(null, minimalQuantity, maximalQuantity, null, minimalSupplText, maximalSupplText, isAccordingToNeed);
    }

    static LABEL = "";

    public getLabel(): string {
        return PlainDoseWrapper.LABEL;
    }

}
