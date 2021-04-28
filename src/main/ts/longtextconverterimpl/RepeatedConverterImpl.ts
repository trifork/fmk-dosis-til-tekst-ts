import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextOptions } from "../TextOptions";

export class RepeatedConverterImpl extends LongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        // Single period, single dosagedays, iterated

        if (dosage.structures) {

            if (dosage.structures.getStructures().length !== 1)
                return false;
            let structure: StructureWrapper = dosage.structures.getStructures()[0];
            if (structure.getIterationInterval() <= 2 || structure.getIterationInterval() === 7)
                return false; // DailyRepeated/TwoDaysRepeated/Weekly repeated already handles iteration=1, 2 and 7
            if (structure.getDays().length > 1)
                return false;
            if (structure.getDays()[0].getDayNumber() !== 1)
                return false;
            if (structure.getDays()[0].getNumberOfDoses() !== 1)
                return false;
            if (structure.containsAccordingToNeedDosesOnly())
                return false;

            return true;
        }
        return false;
    }

    public doConvert(dosage: DosageWrapper, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0], options);
    }

    private convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, options: TextOptions): string {
        let s = "";

        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime())) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(structure.getStartDateOrDateTime());
        }

        else {
            // Dosage repeated after more than one day
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());

            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += this.getDosageEndText(structure);
            }
        }
        s += ":\n";
        s += this.makeDaysDosage(unitOrUnits, structure, structure.getDays()[0], false, options);
        s = this.appendSupplText(structure, s, options);

        return s;
    }

    protected makeDaysDosage(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, day: DayWrapper, hasDaysLabel: boolean, options: TextOptions): string {
        let s = "";
        let daglig = "";

        s += this.makeOneDose(day.getDose(0), unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime(), true, options);
        s += " hver " + structure.getIterationInterval() + ". dag";

        let dosagePeriodPostfix = structure.getDosagePeriodPostfix();
        if (dosagePeriodPostfix && dosagePeriodPostfix.length > 0) {
            s += " " + dosagePeriodPostfix;
        }

        return s;
    }
}
