import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";
import { DefaultLongTextConverterImpl } from "./DefaultLongTextConverterImpl";
import { DateOrDateTime, Day, Dosage, Dose, PlainDose, Structure, UnitOrUnits } from "../dto/Dosage";
import DayHelper from "../helpers/DayHelper";
import StructureHelper from "../helpers/StructureHelper";
import DateOrDateTimeHelper from "../helpers/DateOrDateTimeHelper";
import DoseHelper from "../helpers/DoseHelper";
import { DayOfWeek } from "../DayOfWeek";

export class WeeklyRepeatedConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "WeeklyRepeatedConverterImpl";
    }

    public canConvert(dosage: Dosage, options: TextOptions, ): boolean {
        if (dosage.structures) {

            if (dosage.structures.structures.length !== 1)
                return false;
            let structure: Structure = dosage.structures.structures[0];
            if (structure.iterationInterval !== 7)
                return false;
            if (options !== TextOptions.VKA && options !== TextOptions.VKA_WITH_MARKUP  && DateOrDateTimeHelper.isEqualTo(structure.startDateOrDateTime, structure.endDateOrDateTime))
                return false;
            if (structure.days.length > 7)
                return false;
            if (DayHelper.isAnyDay(structure.days[0]))
                return false;
            if (structure.days[structure.days.length - 1].dayNumber > 7)
                return false;
            return true;
        }
        return false;
    }

    public doConvert(dosage: Dosage, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.structures[0], options, dosage.structures.isPartOfMultiPeriodDosage, currentTime);
    }

    public convert(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions, isPartOfMultiPeriodDosage: boolean, currentTime: Date): string {
        let s = "";

        const trimmedStructure: Structure = {
            iterationInterval: structure.iterationInterval,
            startDateOrDateTime: structure.startDateOrDateTime,
            endDateOrDateTime: structure.endDateOrDateTime,
            days: structure.days.filter(d => d.allDoses.length > 0),
            supplText: structure.supplText,
            dosagePeriodPostfix: structure.dosagePeriodPostfix
        };
        
        if (options === TextOptions.VKA_WITH_MARKUP) {
            if (!isPartOfMultiPeriodDosage) {
                s = "<div class=\"d2t-vkadosagetext\">\n";
            }
            s += "<div class=\"d2t-period\"><div class=\"d2t-periodtext\">";
        }

        s += this.getDosageStartText(trimmedStructure.startDateOrDateTime, trimmedStructure.iterationInterval, options);
        if (trimmedStructure.endDateOrDateTime) {
            s += this.getDosageEndText(trimmedStructure, options);
        }

        if (!StructureHelper.containsAccordingToNeedDose(trimmedStructure)) {
            const trimmedStart = DateOrDateTimeHelper.getDateOrDateTime(trimmedStructure.startDateOrDateTime);
            const trimmedEnd = trimmedStructure.endDateOrDateTime && DateOrDateTimeHelper.getDateOrDateTime(trimmedStructure.endDateOrDateTime);
            
            if (trimmedStart && trimmedEnd) {
                // Calculate length of dosage period
                let diffMsec = Math.abs(trimmedEnd.getTime() - trimmedStart.getTime());
                let diffDays = Math.ceil(diffMsec / (1000 * 3600 * 24));
                // Calculate length of remaining dosage period (from currentTime to dosage end)
                let diffMsecRemaining = trimmedEnd.getTime() - currentTime.getTime();
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


    protected makeOneDose(dose: Dose, unitOrUnits: UnitOrUnits, dayNumber: number, startDateOrDateTime: DateOrDateTime, includeWeekName: boolean, options: TextOptions): string {

        let dateOnly = TextHelper.makeFromDateOnly(DateOrDateTimeHelper.getDateOrDateTime(startDateOrDateTime));
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

        s += DoseHelper.getAnyDoseQuantityString(dose);
        s += " " + TextHelper.getUnit(dose, unitOrUnits);




        if (DoseHelper.getLabel(dose).length > 0) {
            s += " " + DoseHelper.getLabel(dose);
        }
        if (dose.isAccordingToNeed) {
            s += " efter behov";
        }
        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "</dd>";
        }

        return s;
    }

    protected getDayNamesText(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {
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
            s += this.makeDaysDosage(unitOrUnits, structure, e.day, true, options);
        }

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "\n</dl>\n";
        }

        return s;
    }

    protected static fillWithEmptyWeekdays(structure: Structure, unitOrUnits: UnitOrUnits): Structure {
        let allWeekDays: Day[] = [];

        for (let dayno: number = 1; dayno < 8; dayno++) {
            let existingDay = StructureHelper.getDay(structure, dayno);
            if (!existingDay) {
                let emptyDose: PlainDose = {
                    doseQuantity: 0,
                    type: "PlainDoseWrapper",
                    isAccordingToNeed: false
                };
                let emptyDay: Day = {
                    dayNumber: dayno,
                    allDoses: [emptyDose]
                };
                structure.days.push(emptyDay);
            }
        }
        return structure;
    }

    public static sortDaysOfWeek(structure: Structure): Array<DayOfWeek> {
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
