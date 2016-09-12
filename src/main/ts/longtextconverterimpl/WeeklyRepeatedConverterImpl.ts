import {DayOfWeek} from "../vowrapper/DayOfWeek";
import {LongTextConverterImpl} from "./LongTextConverterImpl";
import {StructureWrapper} from "../vowrapper/StructureWrapper";
import {DosageWrapper} from "../vowrapper/DosageWrapper";
import {UnitOrUnitsWrapper} from "../vowrapper/UnitOrUnitsWrapper";
import {TextHelper} from "../TextHelper";
import {DayWrapper} from "../vowrapper/DayWrapper";

export class WeeklyRepeatedConverterImpl extends LongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures) {

            if (dosage.structures.structures.length !== 1)
                return false;
            let structure: StructureWrapper = dosage.structures.structures[0];
            if (structure.iterationInterval !== 7)
                return false;
            if (structure.startDateOrDateTime.isEqualTo(structure.endDateOrDateTime))
                return false;
            if (structure.days.length > 7)
                return false;
            if (structure.days[0].dayNumber === 0)
                return false;
            if (structure.days[structure.days.length - 1].dayNumber > 7)
                return false;
            return true;
        }
        return false;
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.structures[0]);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";
        s += this.getDosageStartText(structure.startDateOrDateTime);
        s += ", forløbet gentages hver uge";
        if (structure.endDateOrDateTime) {
            s += this.getDosageEndText(structure.endDateOrDateTime);
        }
        s += this.getNoteText(structure);
        s += TextHelper.INDENT + "Doseringsforløb:\n";
        s += this.getDayNamesText(unitOrUnits, structure);
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
            s += TextHelper.INDENT + e.name + ": ";
            s += this.makeDaysDosage(unitOrUnits, structure, e.day, true);
        }
        return s;
    }

    public static sortDaysOfWeek(structure: StructureWrapper): Array<DayOfWeek> {
        // Convert all days (up to 7) to day of week and DK name ((1, Mandag) etc).
        // Sort according to day of week (Monday always first) using DayOfWeek's compareTo in SortedSet
        let daysOfWeekSet = structure.days.map(day => TextHelper.makeDayOfWeekAndName(structure.startDateOrDateTime, day, true));
        return daysOfWeekSet.sort(WeeklyRepeatedConverterImpl.daySort);
    }

    // Javascript day 0 = Sunday meaning special sorting of days
    static daySort(day1: DayOfWeek, day2: DayOfWeek): number {
        let sortDay1 = day1.dayOfWeek === 0 ? 8 : day1.dayOfWeek;
        let sortDay2 = day2.dayOfWeek === 0 ? 8 : day2.dayOfWeek;

        return sortDay1 - sortDay2;
    }
}