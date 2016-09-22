import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { TextHelper } from "../TextHelper";

export abstract class ShortTextConverterImpl {

    public abstract canConvert(dosageStructure: DosageWrapper): boolean;

    public abstract doConvert(dosageStructure: DosageWrapper): string;

    protected static toValue(dose: DoseWrapper): string {
        if (dose.doseQuantity !== undefined) {
            return TextHelper.quantityToString(dose.doseQuantity);
        }
        else if (dose.minimalDoseQuantity !== undefined && dose.maximalDoseQuantity !== undefined) {
            return TextHelper.quantityToString(dose.minimalDoseQuantity) +
                "-" + TextHelper.quantityToString(dose.maximalDoseQuantity);
        }
        else {
            return undefined;
        }
    }

    protected static toQuantityValue(dose: number): string {
        if (dose !== undefined) {
            return TextHelper.quantityToString(dose);
        }
        else {
            return undefined;
        }
    }

    protected static hasIntegerValue(n: number): boolean {
        return n % 1 === 0;
    }

    protected static toDoseAndUnitValue(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let s = this.toValue(dose);
        let u = TextHelper.getUnit(dose, unitOrUnits);
        if (dose.getLabel().length === 0)
            return s + " " + u;
        else
            return s + " " + u + " " + dose.getLabel();
    }

    protected static toDoseLabelUnitValue(dose: number, label: string, unitOrUnits: UnitOrUnitsWrapper): string {
        let s = this.toQuantityValue(dose);
        let u = TextHelper.getUnitFromDoseNumber(dose, unitOrUnits);
        if (label === undefined || label.length === 0)
            return s + " " + u;
        else
            return s + " " + u + " " + label;
    }

    protected calculateNumberOfWholeWeeks(iterationInterval: number): number {
        let numberOfWholeWeeks = iterationInterval / 7;
        if (numberOfWholeWeeks.toFixed() !== numberOfWholeWeeks.toString())
            numberOfWholeWeeks = -1;
        return numberOfWholeWeeks;
    }

    protected calculateNumberOfWholeMonths(iterationInterval: number): number {
        let numberOfWholeMonths = iterationInterval / 30;
        if (numberOfWholeMonths.toFixed() !== numberOfWholeMonths.toString())
            numberOfWholeMonths = -1;
        return numberOfWholeMonths;
    }
}
