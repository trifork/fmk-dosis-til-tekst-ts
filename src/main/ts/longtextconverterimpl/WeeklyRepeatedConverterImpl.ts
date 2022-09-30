import { DayOfWeek } from "../vowrapper/DayOfWeek";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { TextHelper } from "../TextHelper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";
import { TextOptions } from "../TextOptions";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { PlainDoseWrapper } from "../vowrapper/PlainDoseWrapper";
import { DefaultLongTextConverterImpl } from "./DefaultLongTextConverterImpl";

export class WeeklyRepeatedConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "WeeklyRepeatedConverterImpl";
    }

    public canConvert(dosage: DosageWrapper, options: TextOptions, ): boolean {
        if (dosage.structures) {

            if (dosage.structures.getStructures().length !== 1)
                return false;
            let structure: StructureWrapper = dosage.structures.getStructures()[0];
            if (structure.getIterationInterval() !== 7)
                return false;
            if (options !== TextOptions.VKA && options !== TextOptions.VKA_WITH_MARKUP  && structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
                return false;
            if (structure.getDays().length > 7)
                return false;
            if (structure.getDays()[0].isAnyDay())
                return false;
            if (structure.getDays()[structure.getDays().length - 1].getDayNumber() > 7)
                return false;
            return true;
        }
        return false;
    }

    public doConvert(dosage: DosageWrapper, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0], options, dosage.structures.getIsPartOfMultiPeriodDosage(), currentTime);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, options: TextOptions, isPartOfMultiPeriodDosage: boolean, currentTime: Date): string {
        let s = "";

        let trimmedStructure = new StructureWrapper(
            structure.getIterationInterval(),
            structure.getSupplText(),
            structure.getStartDateOrDateTime(),
            structure.getEndDateOrDateTime(),
            structure.getDays().filter(d => d.getAllDoses().length > 0), structure.getDosagePeriodPostfix());

        if (options === TextOptions.VKA_WITH_MARKUP) {
            if (!isPartOfMultiPeriodDosage) {
                s = "<div class=\"d2t-vkadosagetext\">\n";
            }
            s += "<div class=\"d2t-period\"><div class=\"d2t-periodtext\">";
        }

        s += this.getDosageStartText(trimmedStructure.getStartDateOrDateTime(), trimmedStructure.getIterationInterval(), options);
        if (trimmedStructure.getEndDateOrDateTime() && trimmedStructure.getEndDateOrDateTime().getDateOrDateTime()) {
            s += this.getDosageEndText(trimmedStructure, options);
        }

        if (!trimmedStructure.containsAccordingToNeedDose()) {
            if (trimmedStructure.getStartDateOrDateTime() && trimmedStructure.getStartDateOrDateTime().getDate()
                && trimmedStructure.getEndDateOrDateTime() && trimmedStructure.getEndDateOrDateTime().getDate()) {
                // Calculate length of dosage period
                let diffMsec = Math.abs(trimmedStructure.getEndDateOrDateTime().getDate().getTime() - trimmedStructure.getStartDateOrDateTime().getDate().getTime());
                let diffDays = Math.ceil(diffMsec / (1000 * 3600 * 24));
                // Calculate length of remaining dosage period (from currentTime to dosage end)
                let diffMsecRemaining = trimmedStructure.getEndDateOrDateTime().getDate().getTime() - currentTime.getTime();
                let diffDaysRemaining = Math.ceil(diffMsecRemaining / (1000 * 3600 * 24));

                if (diffDays > 7 && !(
                    (options === TextOptions.VKA || options === TextOptions.VKA_WITH_MARKUP) && diffDaysRemaining < 7 && diffDaysRemaining > 0)) {
                    // Don't write repeat text if dosage period equals or less than a week...not that it would make sense
                    // ..and in case of VKA, only write "gentages" if period  expired or remaining time until dosageend is more than 7 days
                    s += (options === TextOptions.VKA_WITH_MARKUP ? "<span class=\"d2t-iterationtext\">gentages hver uge</span>" : " - gentages hver uge");
                }
            } else {
                s += (options === TextOptions.VKA_WITH_MARKUP ? "<span class=\"d2t-iterationtext\">gentages hver uge</span>" : " - gentages hver uge");
            }
        }

        s += ":";

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "</div>";
        }

        s += "\n";

        s += this.getDayNamesText(unitOrUnits, trimmedStructure, options);
        s = this.appendSupplText(trimmedStructure, s, options);

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "\n</div>";    // closes <div class="d2t-period">
        }

        if (options === TextOptions.VKA_WITH_MARKUP && !isPartOfMultiPeriodDosage) {
            s += "</div>";
        }

        return s;
    }


    protected makeOneDose(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper, dayNumber: number, startDateOrDateTime: DateOrDateTimeWrapper, includeWeekName: boolean, options: TextOptions): string {

        let dateOnly = TextHelper.makeFromDateOnly(startDateOrDateTime.getDateOrDateTime());
        dateOnly.setDate(dateOnly.getDate() + dayNumber - 1);

        let s = "";


        if (includeWeekName) {
            if (options === TextOptions.VKA_WITH_MARKUP) {
                s += "<dt>";
            }
            s += TextHelper.getWeekdayUppercase(dateOnly.getDay()) + ":";
            if (options === TextOptions.VKA_WITH_MARKUP) {
                s += "</dt><dd>";
            } else {
                s += " ";
            }
        }

        s += dose.getAnyDoseQuantityString();
        s += " " + TextHelper.getUnit(dose, unitOrUnits);




        if (dose.getLabel().length > 0) {
            s += " " + dose.getLabel();
        }
        if (dose.getIsAccordingToNeed()) {
            s += " efter behov";
        }
        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "</dd>";
        }

        return s;
    }

    protected getDayNamesText(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, options: TextOptions): string {
        // Make a sorted list of weekdays
        let s = "";

        if (DefaultLongTextConverterImpl.convertAsVKA(options)) {
            // In case of weekly schedule and weekly iterated dosage, fill missing weekdays with 0-dosages
            structure = WeeklyRepeatedConverterImpl.fillWithEmptyWeekdays(structure, unitOrUnits);
        }

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s = "<dl class=\"d2t-weekly-schema\">\n";
        }

        let daysOfWeek: DayOfWeek[] = WeeklyRepeatedConverterImpl.sortDaysOfWeek(structure);

        let appendedLines = 0;
        for (let e of daysOfWeek) {
            if (appendedLines > 0)
                s += "\n";
            appendedLines++;
            s += this.makeDaysDosage(unitOrUnits, structure, e.getDay(), true, options);
        }

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "\n</dl>\n";
        }

        return s;
    }

    protected static fillWithEmptyWeekdays(structure: StructureWrapper, unitOrUnits: UnitOrUnitsWrapper): StructureWrapper {
        let allWeekDays: DayWrapper[] = [];

        for (let dayno: number = 1; dayno < 8; dayno++) {
            let existingDay = structure.getDay(dayno);
            if (!existingDay) {
                let emptyDose = new PlainDoseWrapper(0, undefined, undefined, unitOrUnits.getUnitPlural(), undefined, undefined, false);
                let emptyDay = new DayWrapper(dayno, [emptyDose]);
                structure.getDays().push(emptyDay);
            }
        }
        return structure;
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



}
