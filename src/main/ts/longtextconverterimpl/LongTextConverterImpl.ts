import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";
import { DosisTilTekstException  } from "../DosisTilTekstException";
import { TextHelper } from "../TextHelper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";

export abstract class LongTextConverterImpl {

    public abstract canConvert(dosageStructure: DosageWrapper): boolean;
    public abstract doConvert(dosageStructure: DosageWrapper): string;

    protected getDosageStartText(startDateOrDateTime: DateOrDateTimeWrapper) {
        return "Doseringsforløbet starter " + this.datesToLongText(startDateOrDateTime);
    }

    protected getDosageEndText(endDateOrDateTime: DateOrDateTimeWrapper) {
        return ", og ophører " + this.datesToLongText(endDateOrDateTime);
    }

    protected datesToLongText(startDateOrDateTime: DateOrDateTimeWrapper): string {
        if (!startDateOrDateTime)
            throw new DosisTilTekstException("startDateOrDateTime must be set");

        if (startDateOrDateTime.date) {
            return TextHelper.formatLongDate(startDateOrDateTime.date);
        }
        else {
            let dateTime = startDateOrDateTime.dateTime;
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
        let secs = dateTime.getTime() / 1000;
        return (secs % 60 !== 0);
    }

    protected appendDays(s: string, unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): number {
        let appendedLines = 0;
        for (let day of structure.days) {
            appendedLines++;
            if (appendedLines > 1) {
                s += "\n";
            }
            s += TextHelper.INDENT;
            let daysLabel = this.makeDaysLabel(structure, day);

            // We cannot have a day without label if there are other days (or "any day")
            if (structure.days.length > 1 && daysLabel.length === 0 && structure.iterationInterval === 1)
                daysLabel = "Daglig: ";
            else if (structure.days.length > 1 && daysLabel.length === 0 && structure.iterationInterval > 1)
                daysLabel = "Dosering: "; // We probably never get here

            s += daysLabel;
            s += this.makeDaysDosage(unitOrUnits, structure, day, daysLabel.length > 0);
        }
        return appendedLines;
    }

    protected makeDaysLabel(structure: StructureWrapper, day: DayWrapper): string {
        if (day.dayNumber === 0) {
            if (day.containsAccordingToNeedDosesOnly())
                return "Efter behov: ";
            else
                return "Dag ikke angivet: ";
        }
        else if (structure.iterationInterval === 1) {
            return "";
        }
        else {
            return TextHelper.makeDayString(structure.getStartDateOrDateTime(), day.dayNumber) + ": ";
        }
    }

    protected makeDaysDosage(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, day: DayWrapper, hasDaysLabel: boolean): string {
        let s = "";

        let supplText = "";
        if (structure.supplText) {
            supplText = TextHelper.maybeAddSpace(structure.supplText) + structure.supplText;
        }

        let daglig = "";
        if (!hasDaysLabel)
            daglig = " daglig";

        if (day.getNumberOfDoses() === 1) {
            // The cast to CharSequence is needed to circumvent a gwt bug:
            s += this.makeOneDose(day.getDose(0), unitOrUnits, structure.supplText);
            if (day.containsAccordingToNeedDosesOnly() && day.dayNumber > 0)
                s += " højst 1 gang" + daglig + supplText;
            else
                s += supplText;
        }
        else if (day.getNumberOfDoses() > 1 && day.allDosesAreTheSame()) {
            // The cast to CharSequence is needed to circumvent a gwt bug:
            s += this.makeOneDose(day.getDose(0), unitOrUnits, structure.supplText);
            if (day.containsAccordingToNeedDosesOnly() && day.dayNumber > 0)
                s += " højst " + day.getNumberOfDoses() + " " + TextHelper.gange(day.getNumberOfDoses()) + daglig + supplText;
            else
                s += " " + day.getNumberOfDoses() + " " + TextHelper.gange(day.getNumberOfDoses()) + daglig + supplText;
        }
        else {
            for (let d = 0; d < day.getNumberOfDoses(); d++) {
                // The cast to CharSequence is needed to circumvent a gwt bug:
                s += this.makeOneDose(day.getDose(d), unitOrUnits, structure.supplText) + supplText;
                if (d < day.getNumberOfDoses() - 1)
                    s += " + ";
            }
        }
        let dosagePeriodPostfix = structure.dosagePeriodPostfix;
        if (dosagePeriodPostfix != null && dosagePeriodPostfix.length > 0) {
            s += " " + dosagePeriodPostfix;
        }

        return s.toString();
    }

    private makeOneDose(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper, supplText: string): string {

        let s = dose.anyDoseQuantityString;
        s += " " + TextHelper.getUnit(dose, unitOrUnits);
        if (dose.getLabel().length > 0) {
            s += " " + dose.getLabel();
        }
        if (dose.isAccordingToNeed) {
            s += " efter behov";
        }
        return s;
    }

}
