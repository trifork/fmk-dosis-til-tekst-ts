import { DayOfWeek } from "../vowrapper/DayOfWeek";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { TextHelper } from "../TextHelper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";

export class WeeklyRepeatedConverterImpl extends LongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures) {

            if (dosage.structures.getStructures().length !== 1)
                return false;
            let structure: StructureWrapper = dosage.structures.getStructures()[0];
            if (structure.getIterationInterval() !== 7)
                return false;
            if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
                return false;
            if (structure.getDays().length > 7)
                return false;
            if (structure.getDays()[0].getDayNumber() === 0)
                return false;
            if (structure.getDays()[structure.getDays().length - 1].getDayNumber() > 7)
                return false;
            return true;
        }
        return false;
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0]);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";
        s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());
        if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
            s += this.getDosageEndText(structure);
        }
        s += ":\n" + this.getDayNamesText(unitOrUnits, structure);

        s = this.appendSupplText(structure, s);

        return s;
    }


    protected makeOneDose(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper, dayNumber: number, startDateOrDateTime: DateOrDateTimeWrapper): string {

        let dateOnly = TextHelper.makeFromDateOnly(startDateOrDateTime.getDateOrDateTime());
        dateOnly.setDate(dateOnly.getDate() + dayNumber - 1);

        let s = TextHelper.getWeekdayUppercase(dateOnly.getDay()) + ": ";

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

    public static sortDaysOfWeek(structure: StructureWrapper): Array<DayOfWeek> {
        // Convert all days (up to 7) to day of week and DK name ((1, Mandag) etc).
        // Sort according to day of week (Monday always first) using DayOfWeek's compareTo in SortedSet
        let daysOfWeekSet = structure.getDays().map(day => TextHelper.makeDayOfWeekAndName(structure.getStartDateOrDateTime(), day, true));
        return daysOfWeekSet.sort(WeeklyRepeatedConverterImpl.daySort);
    }

    // Javascript day 0 = Sunday meaning special sorting of days
    static daySort(day1: DayOfWeek, day2: DayOfWeek): number {
        let sortDay1 = day1.getDayOfWeek() === 0 ? 8 : day1.getDayOfWeek();
        let sortDay2 = day2.getDayOfWeek() === 0 ? 8 : day2.getDayOfWeek();

        return sortDay1 - sortDay2;
    }

    protected getDosageStartText(startDateOrDateTime: DateOrDateTimeWrapper, iterationInterval: number) {

        return "Dosering fra d. " + this.datesToLongText(startDateOrDateTime);
    }

}
