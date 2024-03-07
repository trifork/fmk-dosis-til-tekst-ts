import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";
import { Day, Dosage, Structure, UnitOrUnits } from "../dto/Dosage";
import StructureHelper from "../helpers/StructureHelper";
import DateOrDateTimeHelper from "../helpers/DateOrDateTimeHelper";

export class TwoDaysRepeatedConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "TwoDaysRepeatedConverterImpl";
    }

    public canConvert(dosage: Dosage, options: TextOptions): boolean {
        if (dosage.structures) {
            if (dosage.structures.structures.length !== 1)
                return false;
            let structure: Structure = dosage.structures.structures[0];
            if (structure.iterationInterval !== 2)
                return false;
            if (DateOrDateTimeHelper.isEqualTo(structure.startDateOrDateTime, structure.endDateOrDateTime))
                return false;
            if (structure.days.length > 1)
                return false;

            if (structure.days.length === 1)
                if (structure.days[0].dayNumber !== 1 && structure.days[0].dayNumber !== 2)
                    return false;

            return true;
        }

        return false;
    }

    public doConvert(dosage: Dosage, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.structures[0], options);
    }

    public convert(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {
        let s = this.getDosageStartText(structure.startDateOrDateTime, 2, options);
        if (structure.endDateOrDateTime) {
            s += this.getDosageEndText(structure, options);
        }

        s += ":\n" + this.getDaysText(unitOrUnits, structure, options);
        if (StructureHelper.containsAccordingToNeedDosesOnly(structure) && !StructureHelper.containsPlainDose(structure)) {
            s += ", hver 2. dag";     // In case of MMAN/Time, "højst x gang dagligt" is already in s
        } else if (structure.days[0].allDoses.length > 1) {
            s += " - hver 2. dag";
        } else {
            s += " hver 2. dag";
        }

        s = this.appendSupplText(structure, s, options);

        return s;
    }

    protected makeDaysLabel(dosageStructure: Structure, day: Day): string {
        return "Dag " + day.dayNumber + ": ";
    }

    protected getDaysText(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {
        let s = "";
        let appendedLines = 0;
        for (let day of structure.days) {
            appendedLines++;
            if (appendedLines > 1) {
                s += "\n";
            }
            s += TextHelper.INDENT;
            let daysLabel = "";

            if (structure.days[0].dayNumber === 2) {
                daysLabel = this.makeDaysLabel(structure, day); // Add fx "Dag 1:" if more than one day, or only Day number 2
            }

            s += daysLabel;
            s += this.makeDaysDosage(unitOrUnits, structure, day, daysLabel.length > 0, options);
        }

        return s;
    }
}
