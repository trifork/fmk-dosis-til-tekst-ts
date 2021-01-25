import { DayOfWeek } from "../vowrapper/DayOfWeek";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { WeeklyRepeatedConverterImpl } from "./WeeklyRepeatedConverterImpl";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { TextHelper } from "../TextHelper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";

export class BiWeeklyRepeatedConverterImpl extends WeeklyRepeatedConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures) {

            if (dosage.structures.getStructures().length !== 1)
                return false;
            let structure: StructureWrapper = dosage.structures.getStructures()[0];
            if (structure.getIterationInterval() <= 7 || structure.getIterationInterval() % 7 !== 0)
                return false;
            if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
                return false;
            if (structure.getDays().length !== 1)
                return false;
            if (structure.getDays()[0].getNumberOfDoses() !== 1)
                return false;
            if (structure.getDays()[0].getDayNumber() > 7)
                return false;
            return true;
        }
        return false;
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";
        s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());
        if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
            s += this.getDosageEndText(structure);
        }

        if (!structure.containsAccordingToNeedDose()) {
            s += " - gentages hver " + structure.getIterationInterval() + ". dag";
        }

        s += ":\nHver " + Math.floor(structure.getIterationInterval() / 7) + ". " + this.getDayNamesText(unitOrUnits, structure);

        s = this.appendSupplText(structure, s);

        return s;
    }


    protected makeOneDose(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper, dayNumber: number, startDateOrDateTime: DateOrDateTimeWrapper, includeWeekName: boolean): string {

        let dateOnly = TextHelper.makeFromDateOnly(startDateOrDateTime.getDateOrDateTime());
        dateOnly.setDate(dateOnly.getDate() + dayNumber - 1);

        let s = TextHelper.getWeekday(dateOnly.getDay()) + ": ";

        s += dose.getAnyDoseQuantityString();
        s += " " + TextHelper.getUnit(dose, unitOrUnits);




        if (dose.getLabel().length > 0) {
            s += " " + dose.getLabel();
        }
        if (dose.getIsAccordingToNeed()) {
            s += " efter behov";
        }
        return s;
    }

    protected getDayNamesText(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        // Make a sorted list of weekdays
        let s = "";
        let daysOfWeek: DayOfWeek[] = WeeklyRepeatedConverterImpl.sortDaysOfWeek(structure);

        let appendedLines = 0;
        for (let e of daysOfWeek) {
            if (appendedLines > 0)
                s += "\n";
            appendedLines++;
            s += this.makeDaysDosage(unitOrUnits, structure, e.getDay(), true);

        }
        return s;
    }

    protected getDosageStartText(startDateOrDateTime: DateOrDateTimeWrapper, iterationInterval: number) {

        return "Dosering fra d. " + this.datesToLongText(startDateOrDateTime);
    }

}
