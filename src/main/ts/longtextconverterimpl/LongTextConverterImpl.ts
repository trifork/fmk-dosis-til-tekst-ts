import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";
import { DosisTilTekstException } from "../DosisTilTekstException";
import { TextHelper } from "../TextHelper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";

export abstract class LongTextConverterImpl {

    public abstract canConvert(dosageStructure: DosageWrapper): boolean;
    public abstract doConvert(dosageStructure: DosageWrapper): string;

    protected appendSupplText(structure: StructureWrapper, s: string) {
        if (structure.getSupplText()) {
            s += "\n" + TextHelper.INDENT + "Bemærk: " + structure.getSupplText();
        }
        return s;
    }

    protected getDosageStartText(startDateOrDateTime: DateOrDateTimeWrapper, iterationInterval: number) {

        return "Dosering fra d. " + this.datesToLongText(startDateOrDateTime);
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


    protected getDosageEndText(endDateOrDateTime: DateOrDateTimeWrapper) {
        return " til d. " + this.datesToLongText(endDateOrDateTime);
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

    protected getDaysText(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";
        let appendedLines = 0;
        for (let day of structure.getDays()) {
            appendedLines++;
            if (appendedLines > 1) {
                s += "\n";
            }
            s += TextHelper.INDENT;
            let daysLabel = "";

            if ((structure.getDays().length > 1) || (structure.getDays().length < structure.getIterationInterval())) {
                daysLabel = this.makeDaysLabel(structure, day); // Add fx "Dag 1:" if more than one day, or only a number of days less than the iteration interval
            }

            s += daysLabel;
            s += this.makeDaysDosage(unitOrUnits, structure, day, daysLabel.length > 0);
        }

        /*
        if (structure.getIterationInterval() > 2 && structure.getIterationInterval() !== 7) {
            let daysLabel = "";
            let day = structure.getDays()[0];

            if (structure.getDays().length > 1) {
                daysLabel = this.makeDaysLabel(structure, day); // Add fx "Dag 1:"
            }

            s += "\n" + daysLabel;
            s += this.makeDaysDosage(unitOrUnits, structure, day, daysLabel.length > 0);
            s += "\n...";
        }*/

        return s;
    }

    protected makeDaysLabel(structure: StructureWrapper, day: DayWrapper): string {
        if (day.getDayNumber() === 0) {
            if (day.containsAccordingToNeedDosesOnly())
                return "";
            else
                return "Dag ikke angivet: ";    // Not allowed in FMK interface
        }
        else if (structure.getIterationInterval() === 1) {
            return "";
        }
        else if (structure.getIterationInterval() === 0 && structure.getDays().length > 1) {
            // 18. apr 2019: 2 tabletter....
            return TextHelper.makeDateString(structure.getStartDateOrDateTime(), day.getDayNumber());
        }
        else {
            // Dag 1: 2 tabletter....
            return TextHelper.makeDayString(day.getDayNumber());
        }
    }

    protected makeDaysDosage(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, day: DayWrapper, hasDaysLabel: boolean): string {
        let s = "";
        let daglig = "";
        if (!hasDaysLabel)
            daglig = " hver dag";

        if (day.getNumberOfDoses() === 1) {
            s += this.makeOneDose(day.getDose(0), unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime());

        }
        else if (day.getNumberOfDoses() > 1 && day.allDosesAreTheSame()) {
            s += this.makeOneDose(day.getDose(0), unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime());
            if (day.containsAccordingToNeedDosesOnly() && day.getDayNumber() > 0) {
                s += " højst " + day.getNumberOfDoses() + " " + TextHelper.gange(day.getNumberOfDoses()) + " dagligt";
            }
            else {
                s += " " + day.getNumberOfDoses() + " " + TextHelper.gange(day.getNumberOfDoses());
            }
        }
        else if (day.getNumberOfDoses() > 2 && day.allDosesButTheFirstAreTheSame()) {
            // Eks.: 1 stk. kl. 08:00 og 2 stk. 4 gange daglig

            s += this.makeOneDose(day.getDose(0), unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime());
            if (0 < day.getNumberOfDoses() - 1) {
                s += " og ";
            }
            let dayWithoutFirstDose: DayWrapper = new DayWrapper(day.getDayNumber(), day.getAllDoses().slice(1, day.getAllDoses().length));
            s += this.makeDaysDosage(unitOrUnits, structure, dayWithoutFirstDose, false);
        }
        else {
            // 2 tabletter morgen, 1 tablet middag, 2 tabletter aften og 1 tablet nat
            for (let d = 0; d < day.getNumberOfDoses(); d++) {
                s += this.makeOneDose(day.getDose(d), unitOrUnits, day.getDayNumber(), structure.getStartDateOrDateTime());
                if (d < day.getNumberOfDoses() - 2) {
                    s += ", ";
                }
                else if (d < day.getNumberOfDoses() - 1) {
                    s += " og ";
                }
            }
        }

        if (day.containsAccordingToNeedDosesOnly()) {
            if (day.getDayNumber() > 0 || (day.getDayNumber() === 0 && structure.getIterationInterval() === 1)) {
                if (day.getNumberOfDoses() === 1) {
                    s += " højst 1 gang dagligt";
                }
            }
            else {
                if (structure.getIterationInterval() === 7) {
                    s += " højst 1 gang om ugen";
                }
                else if (structure.getIterationInterval() > 1) {
                    s += " højst 1 gang hver " + structure.getIterationInterval() + ". dag";
                }
            }
        }
        else if (!hasDaysLabel && structure.getIterationInterval() === 1) {    // Ex. 12 ml 1 gang daglig
            if (day.containsMorningNoonEveningNightDoses() || day.containsTimedDose()) {
                s += " -";      // Ex. 1 tablet nat - hver dag
            }                   // else...ex.: 1 tablet 2 gange hver dag
            s += daglig;
        }

        let dosagePeriodPostfix = structure.getDosagePeriodPostfix();
        if (dosagePeriodPostfix && dosagePeriodPostfix.length > 0) {
            s += " " + dosagePeriodPostfix;
        }

        return s;
    }

    protected makeOneDose(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper, dayNumber: number, startDateOrDateTime: DateOrDateTimeWrapper): string {

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
