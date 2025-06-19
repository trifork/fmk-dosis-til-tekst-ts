import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { TextOptions } from "../TextOptions";
import { Day, Dosage, Structure, UnitOrUnits } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";

export class RepeatedPNConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "RepeatedPNConverterImpl";
    }

    public canConvert(dosage: Dosage, options: TextOptions): boolean {
        // Single period, single dosagedays, iterated

        if (dosage.structures) {

            if (dosage.structures.structures.length !== 1)
                return false;
            const structure: Structure = dosage.structures.structures[0];
            if (structure.iterationInterval <= 2 || structure.iterationInterval === 7)
                return false; // DailyRepeated/TwoDaysRepeated/Weekly repeated already handles iteration=1, 2 and 7
            if (structure.days.length > 1)
                return false;
            if (structure.days[0].dayNumber !== 1)
                return false;
            if (structure.days[0].allDoses.length !== 1)
                return false;
            if (!StructureHelper.containsAccordingToNeedDosesOnly(structure))
                return false;

            return true;
        }
        return false;
    }

    public doConvert(dosage: Dosage, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.structures[0], options);
    }

    private convert(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {
        let s = "";

        if (DateOrDateTimeHelper.isEqualTo(structure.startDate, structure.endDate)) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(structure.startDate);
        }

        else {
            // Dosage repeated after more than one day
            s += this.getDosageStartText(structure.startDate, structure.iterationInterval, options);

            if (structure.endDate) {
                s += this.getDosageEndText(structure, options);
            }
        }
        s += ":\n";
        s += this.makeDaysDosage(unitOrUnits, structure, structure.days[0], true, options);
        s = this.appendSupplText(structure, s, options);

        return s;
    }

    protected makeDaysDosage(unitOrUnits: UnitOrUnits, structure: Structure, day: Day, hasDaysLabel: boolean, options: TextOptions): string {
        let s = "";

        s += this.makeOneDose(day.allDoses[0], unitOrUnits, day.dayNumber, structure.startDate, true, options);

        if (day.allDoses.length === 1) {
            s += ", højst 1 gang dagligt hver " + structure.iterationInterval + ". dag";
        }
        else {
            s += ", hver " + structure.iterationInterval + ". dag";
        }

        const dosagePeriodPostfix = structure.dosagePeriodPostfix;
        if (dosagePeriodPostfix && dosagePeriodPostfix.length > 0) {
            s += " " + dosagePeriodPostfix;
        }

        return s;
    }
}
