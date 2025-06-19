import { DosisTilTekstException } from "../DosisTilTekstException";
import { StructureHelper } from "../helpers/StructureHelper";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";
import { DateOnly, Day, Dosage, Dose, Structure, TimedDose, UnitOrUnits } from "../dto/Dosage";
import { DayHelper } from "../helpers/DayHelper";
import { DoseHelper } from "../helpers/DoseHelper";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";

export abstract class LongTextConverterImpl {

    public abstract getConverterClassName(): string;
    public abstract canConvert(dosageStructure: Dosage, options: TextOptions): boolean;
    public abstract doConvert(dosageStructure: Dosage, options: TextOptions, currentTime: Date): string;

    public static convertAsVKA(textOptions: TextOptions): boolean {
        return textOptions === TextOptions.VKA || textOptions === TextOptions.VKA_WITH_MARKUP;
    }

    protected appendSupplText(structure: Structure, s: string, textOptions: TextOptions) {
        if (structure.supplText) {
            if (textOptions === TextOptions.VKA_WITH_MARKUP) {
                s += "\n<div class=\"d2t-suppltext\">Bemærk: " + structure.supplText + "</div>";
            } else {
                s += "\n" + TextHelper.INDENT + "Bemærk: " + structure.supplText;
            }
        }
        return s;
    }

    protected getDosageStartText(startDate: DateOnly, iterationInterval: number, textOptions: TextOptions) {

        return (textOptions === TextOptions.VKA_WITH_MARKUP ? "Fra " : "Dosering fra d. ") + this.datesToLongText(startDate);
    }

    protected getSingleDayDosageStartText(startDate: DateOnly, singleDayNo: number) {
        let realStartDateOnly: DateOnly;

        if (startDate) {
            const realStartDate = new Date(startDate);
            if (singleDayNo > 0) {
                realStartDate.setDate(realStartDate.getDate() + singleDayNo - 1);
            }
            realStartDateOnly = realStartDate.toISOString();
        }

        return "Dosering kun d. " + this.datesToLongText(realStartDateOnly);
    }


    protected getDosageEndText(structure: Structure, options: TextOptions) {

        return (options === TextOptions.VKA_WITH_MARKUP ? " til " : " til d. ") + this.datesToLongText(structure.endDate);
    }

    protected datesToLongText(startDate: DateOnly): string {

        if (!startDate)
            throw new DosisTilTekstException("startDate must be set");

        if (startDate) {
            return TextHelper.formatLongDateAbbrevMonth(new Date(startDate));
        }
    }


    private haveSeconds(dateTime: Date): boolean {
        return dateTime.getSeconds() !== 0;
    }

    protected getDaysText(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {

        let s = "";
        let appendedLines = 0;
        for (const day of structure.days) {
            appendedLines++;
            if (appendedLines > 1) {
                s += "\n";
            }
            s += TextHelper.INDENT;
            let daysLabel = "";

            if ((structure.days.length > 1) || (structure.days.length < structure.iterationInterval) || LongTextConverterImpl.convertAsVKA(options)) {
                daysLabel = this.makeDaysLabel(structure, day); // Add fx "Dag 1:" if more than one day, or only a number of days less than the iteration interval
                if (options === TextOptions.VKA_WITH_MARKUP) {
                    daysLabel = "<dt>" + daysLabel.trim() + "</dt>";
                }
            }

            s += daysLabel;

            let daysDosage = this.makeDaysDosage(unitOrUnits, structure, day, daysLabel.length > 0, options);
            if (options === TextOptions.VKA_WITH_MARKUP) {
                daysDosage = "<dd>" + daysDosage + "</dd>";
            }
            s += daysDosage;
        }

        return s;
    }

    protected makeDaysLabel(structure: Structure, day: Day): string {
        if (DayHelper.isAnyDay(day)) {
            if (DayHelper.containsAccordingToNeedDosesOnly(day))
                return "";
            else
                return "Dag ikke angivet: ";    // Not allowed in FMK interface
        }
        else if (structure.iterationInterval === 1) {
            return "";
        }
        else if (structure.iterationInterval === 0 || StructureHelper.isIterationToLong(structure)) {
            // Tirsdag d. 27. okt. 2020: 2 tabletter....
            const dateOnly = TextHelper.makeFromDateOnly(DateOrDateTimeHelper.getDate(structure.startDate));
            dateOnly.setDate(dateOnly.getDate() + day.dayNumber - 1);

            return TextHelper.getWeekdayUppercase(dateOnly.getDay()) + " d. " + TextHelper.makeDateString(structure.startDate, day.dayNumber) + ": ";
        }
        else {
            // Dag 1: 2 tabletter....
            return TextHelper.makeDayString(day.dayNumber);
        }
    }

    private static getDoseSortKey(d1: Dose): number {
        if (d1.type === "MorningDoseWrapper") {
            return 300.5;
        } else if (d1.type === "NoonDoseWrapper") {
            return 900.5;
        } else if (d1.type === "EveningDoseWrapper") {
            return 1500.5;
        } else if (d1.type === "NightDoseWrapper") {
            return 2100.5;
        } else if (d1.type === "TimedDoseWrapper") {
            const localTime = (d1 as TimedDose).time;
            return localTime.hour * 100 + localTime.minute;
        }

        return -1;
    }


    protected makeDaysDosage(unitOrUnits: UnitOrUnits, structure: Structure, day: Day, hasDaysLabel: boolean, options: TextOptions): string {
        let s = "";
        let daglig = "";
        if (!hasDaysLabel)
            daglig = " hver dag";

        if (day.allDoses.length === 1) {
            s += this.makeOneDose(day.allDoses[0], unitOrUnits, day.dayNumber, structure.startDate, true, options);

        }
        else if (day.allDoses.length > 1 && DayHelper.allDosesAreTheSame(day)) {
            s += this.makeOneDose(day.allDoses[0], unitOrUnits, day.dayNumber, structure.startDate, true, options);
            if (DayHelper.containsAccordingToNeedDosesOnly(day) && day.dayNumber > 0) {
                s += ", højst " + day.allDoses.length + " " + TextHelper.gange(day.allDoses.length) + " dagligt";
            }
            else {
                s += " " + day.allDoses.length + " " + TextHelper.gange(day.allDoses.length);
            }
        }
        else if (day.allDoses.length > 2 && DayHelper.allDosesButTheFirstAreTheSame(day)) {
            // Eks.: 1 stk. kl. 08:00 og 2 stk. 4 gange daglig

            s += this.makeOneDose(day.allDoses[0], unitOrUnits, day.dayNumber, structure.startDate, true, options);
            if (0 < day.allDoses.length - 1) {
                s += " og ";
            }
            const dayWithoutFirstDose: Day = {
                dayNumber: day.dayNumber,
                allDoses: day.allDoses.slice(1, day.allDoses.length)
            };
            s += this.makeDaysDosage(unitOrUnits, structure, dayWithoutFirstDose, false, options);
        }
        else {

            const sortedDoses = day.allDoses.sort((d1, d2) => LongTextConverterImpl.getDoseSortKey(d1) - LongTextConverterImpl.getDoseSortKey(d2));

            // 2 tabletter morgen, 1 tablet middag, 2 tabletter aften og 1 tablet nat
            for (let d = 0; d < sortedDoses.length; d++) {
                s += this.makeOneDose(sortedDoses[d], unitOrUnits, day.dayNumber, structure.startDate, d === 0, options);
                if (d < day.allDoses.length - 2) {
                    s += ", ";
                }
                else if (d < day.allDoses.length - 1) {
                    s += " og ";
                }
            }
        }
        // Skip in case of 1 time PN since this can mean both 1 time per day or 1 <unit> an unlimited no of times per day
        if (!(structure.days.length === 1
            && day.dayNumber <= 1
            && day.allDoses.length === 1
            && (structure.iterationInterval === 0 || StructureHelper.isIterationToLong(structure))
            && DayHelper.containsAccordingToNeedDosesOnly(day)
            && DayHelper.containsPlainDose(day))) {

            if (DayHelper.containsAccordingToNeedDosesOnly(day) && day.allDoses.length > 0 && DayHelper.containsPlainDose(day)) {
                if ((day.dayNumber > 0 || (DayHelper.isAnyDay(day) && structure.iterationInterval === 1))) {
                    if (day.allDoses.length === 1) {
                        s += ", højst 1 gang dagligt";
                    }
                    else if (!hasDaysLabel && structure.iterationInterval === 1) {    // Ex. 12 ml 1 gang daglig
                        if (day.allDoses.length === 1 || !DayHelper.allDosesAreTheSame(day)) {
                            // Exclude day.allDoses.length > 1 && DayHelper.allDosesAreTheSame(day) since they already have "højst X 2 gange daglig" from the code above
                            s += " -" + daglig;      // Ex. 1 tablet nat efter behov - hver dag
                        }                   // else...ex.: 1 tablet 2 gange hver dag
                    }
                }
                else if (DayHelper.containsPlainDose(day)) {
                    if (structure.iterationInterval === 7) {
                        s += ", højst 1 gang om ugen";
                    }
                    else if (structure.iterationInterval > 1) {
                        s += ", højst 1 gang hver " + structure.iterationInterval + ". dag";
                    }
                }
            }
            else if (!hasDaysLabel
                && structure.iterationInterval === 1
                && !DayHelper.containsAccordingToNeedDosesOnly(day)
                && !StructureHelper.startsAndEndsSameDay(structure)) {    // Ex. 12 ml 1 gang daglig
                if (DayHelper.containsMorningNoonEveningNightDoses(day) || DayHelper.containsTimedDose(day)) {
                    s += " -";      // Ex. 1 tablet nat - hver dag
                }                   // else...ex.: 1 tablet 2 gange hver dag
                s += daglig;
            }
        }

        const dosagePeriodPostfix = structure.dosagePeriodPostfix;
        if (dosagePeriodPostfix && dosagePeriodPostfix.length > 0) {
            s += " " + dosagePeriodPostfix;
        }

        return s;
    }

    protected makeOneDose(dose: Dose, unitOrUnits: UnitOrUnits, dayNumber: number, startDate: DateOnly, includeWeekName: boolean, options: TextOptions): string {

        let s = DoseHelper.getAnyDoseQuantityString(dose);

        s += " " + TextHelper.getUnit(dose, unitOrUnits);

        if (DoseHelper.getLabel(dose).length > 0) {
            s += " " + DoseHelper.getLabel(dose);
        }
        if (dose.isAccordingToNeed) {
            s += " efter behov";
        }
        return s;
    }

    private isComplex(structure: Structure): boolean {
        if (structure.days.length === 1)
            return false;
        return !StructureHelper.daysAreInUninteruptedSequenceFromOne(structure);
    }

    private isVarying(structure: Structure): boolean {
        return !StructureHelper.allDaysAreTheSame(structure);
    }

}
