import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";
import { DosisTilTekstException } from "../DosisTilTekstException";
import { TextHelper } from "../TextHelper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextOptions } from "../TextOptions";
import { MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper, TimedDoseWrapper } from "..";

export abstract class LongTextConverterImpl {

    public abstract canConvert(dosageStructure: DosageWrapper): boolean;
    public abstract doConvert(dosageStructure: DosageWrapper, options: TextOptions, currentTime: Date): string;

    public static convertAsVKA(textOptions: TextOptions): boolean {
        return textOptions === TextOptions.VKA || textOptions === TextOptions.VKA_WITH_MARKUP;
    }

    protected appendSupplText(structure: StructureWrapper, s: string, textOptions: TextOptions) {
        if (structure.getSupplText()) {
            if (textOptions === TextOptions.VKA_WITH_MARKUP) {
                s += "\n<div class=\"d2t-suppltext\">Bemærk: " + structure.getSupplText() + "</div>";
            } else {
                s += "\n" + TextHelper.INDENT + "Bemærk: " + structure.getSupplText();
            }
        }
        return s;
    }

    protected getDosageStartText(startDateOrDateTime: DateOrDateTimeWrapper, iterationInterval: number, textOptions: TextOptions) {

        return (textOptions === TextOptions.VKA_WITH_MARKUP ? "Fra " : "Dosering fra d. ") + this.datesToLongText(startDateOrDateTime);
    }

    protected getSingleDayDosageStartText(startDateOrDateTime: DateOrDateTimeWrapper, singleDayNo: number) {
        let realStartDateOrDateTime: DateOrDateTimeWrapper;

        if (startDateOrDateTime.getDate()) {
            let realStartDate = startDateOrDateTime.getDate();
            if (singleDayNo > 0) {
                realStartDate.setDate(realStartDate.getDate() + singleDayNo - 1);
            }
            realStartDateOrDateTime = new DateOrDateTimeWrapper(realStartDate, null);
        }
        else {
            let realStartDateTime = startDateOrDateTime.getDateTime();
            if (singleDayNo > 0) {
                realStartDateTime.setDate(realStartDateTime.getDate() + singleDayNo - 1);
            }
            realStartDateOrDateTime = new DateOrDateTimeWrapper(null, realStartDateTime);
        }

        return "Dosering kun d. " + this.datesToLongText(realStartDateOrDateTime);
    }


    protected getDosageEndText(structure: StructureWrapper, options: TextOptions) {

        return (options === TextOptions.VKA_WITH_MARKUP ? " til " : " til d. ") + this.datesToLongText(structure.getEndDateOrDateTime());
    }

    protected datesToLongText(startDateOrDateTime: DateOrDateTimeWrapper): string {

        if (!startDateOrDateTime)
            throw new DosisTilTekstException("startDateOrDateTime must be set");

        if (startDateOrDateTime.getDate()) {
            return TextHelper.formatLongDateAbbrevMonth(startDateOrDateTime.getDate());
        }
        else {
            let dateTime = startDateOrDateTime.getDateTime();
            // We do not want to show seconds precision if seconds are not specified or 0
            if (this.haveSeconds(dateTime)) {
                return TextHelper.formatLongDateTime(dateTime);
            }
            else {
                return TextHelper.formatLongDateNoSecs(dateTime);
            }
        }
    }


    private haveSeconds(dateTime: Date): boolean {
        return dateTime.getSeconds() !== 0;
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

            if ((structure.getDays().length > 1) || (structure.getDays().length < structure.getIterationInterval()) || LongTextConverterImpl.convertAsVKA(options)) {
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

    protected makeDaysLabel(structure: StructureWrapper, day: DayWrapper): string {
        if (day.isAnyDay()) {
            if (day.containsAccordingToNeedDosesOnly())
                return "";
            else
                return "Dag ikke angivet: ";    // Not allowed in FMK interface
        }
        else if (structure.getIterationInterval() === 1) {
            return "";
        }
        else if (structure.getIterationInterval() === 0) {
            // Tirsdag d. 27. okt. 2020: 2 tabletter....
            let dateOnly = TextHelper.makeFromDateOnly(structure.getStartDateOrDateTime().getDateOrDateTime());
            dateOnly.setDate(dateOnly.getDate() + day.getDayNumber() - 1);

            return TextHelper.getWeekdayUppercase(dateOnly.getDay()) + " d. " + TextHelper.makeDateString(structure.getStartDateOrDateTime(), day.getDayNumber()) + ": ";
        }
        else {
            // Dag 1: 2 tabletter....
            return TextHelper.makeDayString(day.getDayNumber());
        }
    }

    private static getDoseSortKey(d1: DoseWrapper): number {
        if(d1 instanceof MorningDoseWrapper) {
            return 300.5;
        } else if(d1 instanceof NoonDoseWrapper) {
            return 900.5;
        } else if(d1 instanceof EveningDoseWrapper) {
            return 1500.5;
        }else if(d1 instanceof NightDoseWrapper) {
            return 2100.5;
        } else if(d1 instanceof TimedDoseWrapper) {
            let timedDose: TimedDoseWrapper = d1 as TimedDoseWrapper;
            return d1.getLocalTime().getHour() * 100 + d1.getLocalTime().getMinute();
        }

        return -1;
    }


    protected makeDaysDosage(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, day: DayWrapper, hasDaysLabel: boolean, options: TextOptions): string {
        let s = "";
        let daglig = "";
        if (!hasDaysLabel)
            daglig = " hver dag";

        if (day.getNumberOfDoses() === 1) {
            s += this.makeOneDose(day.getDose(0), unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime(), true, options);

        }
        else if (day.getNumberOfDoses() > 1 && day.allDosesAreTheSame()) {
            s += this.makeOneDose(day.getDose(0), unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime(), true, options);
            if (day.containsAccordingToNeedDosesOnly() && day.getDayNumber() > 0) {
                s += ", højst " + day.getNumberOfDoses() + " " + TextHelper.gange(day.getNumberOfDoses()) + " dagligt";
            }
            else {
                s += " " + day.getNumberOfDoses() + " " + TextHelper.gange(day.getNumberOfDoses());
            }
        }
        else if (day.getNumberOfDoses() > 2 && day.allDosesButTheFirstAreTheSame()) {
            // Eks.: 1 stk. kl. 08:00 og 2 stk. 4 gange daglig

            s += this.makeOneDose(day.getDose(0), unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime(), true, options);
            if (0 < day.getNumberOfDoses() - 1) {
                s += " og ";
            }
            let dayWithoutFirstDose: DayWrapper = new DayWrapper(day.getDayNumber(), day.getAllDoses().slice(1, day.getAllDoses().length));
            s += this.makeDaysDosage(unitOrUnits, structure, dayWithoutFirstDose, false, options);
        }
        else {

            let sortedDoses = day.getAllDoses().sort((d1, d2) => LongTextConverterImpl.getDoseSortKey(d1) - LongTextConverterImpl.getDoseSortKey(d2));

            // 2 tabletter morgen, 1 tablet middag, 2 tabletter aften og 1 tablet nat
            for (let d = 0; d < sortedDoses.length; d++) {
                s += this.makeOneDose(sortedDoses[d], unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime(), d === 0, options);
                if (d < day.getNumberOfDoses() - 2) {
                    s += ", ";
                }
                else if (d < day.getNumberOfDoses() - 1) {
                    s += " og ";
                }
            }
        }
        // Skip in case of 1 time PN since this can mean both 1 time per day or 1 <unit> an unlimited no of times per day
        if (!(structure.getDays().length === 1
            && day.getDayNumber() <= 1
            && day.getNumberOfDoses() === 1
            && structure.getIterationInterval() === 0
            && day.containsAccordingToNeedDosesOnly()
            && day.containsPlainDose())) {

            if (day.containsAccordingToNeedDosesOnly() && day.getNumberOfDoses() > 0 && day.containsPlainDose()) {
                if ((day.getDayNumber() > 0 || (day.isAnyDay() && structure.getIterationInterval() === 1))) {
                    if (day.getNumberOfDoses() === 1) {
                        s += ", højst 1 gang dagligt";
                    }
                    else if (!hasDaysLabel && structure.getIterationInterval() === 1) {    // Ex. 12 ml 1 gang daglig
                        if (day.getNumberOfDoses() === 1 || !day.allDosesAreTheSame()) {
                            // Exclude day.getNumberOfDoses() > 1 && day.allDosesAreTheSame() since they already have "højst X 2 gange daglig" from the code above
                            s += " -" + daglig;      // Ex. 1 tablet nat efter behov - hver dag
                        }                   // else...ex.: 1 tablet 2 gange hver dag
                    }
                }
                else if (day.containsPlainDose()) {
                    if (structure.getIterationInterval() === 7) {
                        s += ", højst 1 gang om ugen";
                    }
                    else if (structure.getIterationInterval() > 1) {
                        s += ", højst 1 gang hver " + structure.getIterationInterval() + ". dag";
                    }
                }
            }
            else if (!hasDaysLabel && structure.getIterationInterval() === 1 && !day.containsAccordingToNeedDosesOnly()) {    // Ex. 12 ml 1 gang daglig
                if (day.containsMorningNoonEveningNightDoses() || day.containsTimedDose()) {
                    s += " -";      // Ex. 1 tablet nat - hver dag
                }                   // else...ex.: 1 tablet 2 gange hver dag
                s += daglig;
            }
        }

        let dosagePeriodPostfix = structure.getDosagePeriodPostfix();
        if (dosagePeriodPostfix && dosagePeriodPostfix.length > 0) {
            s += " " + dosagePeriodPostfix;
        }

        return s;
    }

    protected makeOneDose(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper, dayNumber: number, startDateOrDateTime: DateOrDateTimeWrapper, includeWeekName: boolean, options: TextOptions): string {

        let s = dose.getAnyDoseQuantityString();
        s += " " + TextHelper.getUnit(dose, unitOrUnits);


        if (dose.getLabel().length > 0) {
            s += " " + dose.getLabel();
        }
        if (dose.getIsAccordingToNeed()) {
            s += " efter behov";
        }
        return s;
    }

    private isComplex(structure: StructureWrapper): boolean {
        if (structure.getDays().length === 1)
            return false;
        return !structure.daysAreInUninteruptedSequenceFromOne();
    }

    private isVarying(structure: StructureWrapper): boolean {
        return !structure.allDaysAreTheSame();
    }

}
