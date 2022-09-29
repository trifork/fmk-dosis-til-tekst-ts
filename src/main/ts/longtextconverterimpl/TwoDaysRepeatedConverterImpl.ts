import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";

export class TwoDaysRepeatedConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "TwoDaysRepeatedConverterImpl";
    }

    public canConvert(dosage: DosageWrapper, options: TextOptions): boolean {
        if (dosage.structures) {
            if (dosage.structures.getStructures().length !== 1)
                return false;
            let structure: StructureWrapper = dosage.structures.getStructures()[0];
            if (structure.getIterationInterval() !== 2)
                return false;
            if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
                return false;
            if (structure.getDays().length > 1)
                return false;

            if (structure.getDays().length === 1)
                if (structure.getDays()[0].getDayNumber() !== 1 && structure.getDays()[0].getDayNumber() !== 2)
                    return false;

            return true;
        }

        return false;
    }

    public doConvert(dosage: DosageWrapper, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0], options);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, options: TextOptions): string {
        let s = this.getDosageStartText(structure.getStartDateOrDateTime(), 2, options);
        if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
            s += this.getDosageEndText(structure, options);
        }

        s += ":\n" + this.getDaysText(unitOrUnits, structure, options);
        if (structure.containsAccordingToNeedDosesOnly() && !structure.containsPlainDose()) {
            s += ", hver 2. dag";     // In case of MMAN/Time, "højst x gang dagligt" is already in s
        } else if (structure.getDays()[0].getNumberOfDoses() > 1) {
            s += " - hver 2. dag";
        } else {
            s += " hver 2. dag";
        }

        s = this.appendSupplText(structure, s, options);

        return s;
    }

    protected makeDaysLabel(dosageStructure: StructureWrapper, day: DayWrapper): string {
        return "Dag " + day.getDayNumber() + ": ";
    }

    protected getDaysText(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, options: TextOptions): string {
        let s = "";
        let appendedLines = 0;
        for (let day of structure.getDays()) {
            appendedLines++;
            if (appendedLines > 1) {
                s += "\n";
            }
            s += TextHelper.INDENT;
            let daysLabel = "";

            if (structure.getDays()[0].getDayNumber() === 2) {
                daysLabel = this.makeDaysLabel(structure, day); // Add fx "Dag 1:" if more than one day, or only Day number 2
            }

            s += daysLabel;
            s += this.makeDaysDosage(unitOrUnits, structure, day, daysLabel.length > 0, options);
        }

        return s;
    }
}
