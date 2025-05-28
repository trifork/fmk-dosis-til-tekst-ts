import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";
import { Dosage, Dose, UnitOrUnits } from "../dto/Dosage";
import { DoseHelper } from "../helpers/DoseHelper";

export abstract class ShortTextConverterImpl {

    public abstract getConverterClassName(): string;
    public abstract canConvert(dosageStructure: Dosage): boolean;
    public abstract doConvert(dosageStructure: Dosage, options: TextOptions ): string;

    protected static toValue(dose: Dose): string {
        if (typeof dose.doseQuantity === "number") {
            return TextHelper.formatQuantity(dose.doseQuantity);
        }
        else if (typeof dose.minimalDoseQuantity === "number" && typeof dose.maximalDoseQuantity === "number") {
            return TextHelper.formatQuantity(dose.minimalDoseQuantity) +
                "-" + TextHelper.formatQuantity(dose.maximalDoseQuantity);
        }
        else {
            return undefined;
        }
    }

    protected static toQuantityValue(dose: number): string {
        if (dose) {
            return TextHelper.formatQuantity(dose);
        }
        else {
            return undefined;
        }
    }

    protected static hasIntegerValue(n: number): boolean {
        return n % 1 === 0;
    }

    protected static toDoseAndUnitValue(dose: Dose, unitOrUnits: UnitOrUnits): string {
        let s = this.toValue(dose);
        let u = TextHelper.getUnit(dose, unitOrUnits);
        if (DoseHelper.getLabel(dose).length === 0)
            return s + " " + u;
        else
            return s + " " + u + " " + DoseHelper.getLabel(dose);
    }

    protected static toDoseLabelUnitValue(dose: number, label: string, unitOrUnits: UnitOrUnits): string {
        let s = this.toQuantityValue(dose);
        let u = TextHelper.getUnitFromDoseNumber(dose, unitOrUnits);
        if (!label)
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
