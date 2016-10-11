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

        if (startDateOrDateTime.getDate()) {
            return TextHelper.formatLongDate(startDateOrDateTime.getDate());
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
            let daysLabel = this.makeDaysLabel(structure, day);

            // We cannot have a day without label if there are other days (or "any day")
            if (structure.getDays().length > 1 && daysLabel.length === 0 && structure.getIterationInterval() === 1)
                daysLabel = "Daglig: ";
            else if (structure.getDays().length > 1 && daysLabel.length === 0 && structure.getIterationInterval() > 1)
                daysLabel = "Dosering: "; // We probably never get here

            s += daysLabel;
            s += this.makeDaysDosage(unitOrUnits, structure, day, daysLabel.length > 0);
        }
        return s;
    }

    protected makeDaysLabel(structure: StructureWrapper, day: DayWrapper): string {
        if (day.getDayNumber() === 0) {
            if (day.containsAccordingToNeedDosesOnly())
                return "Efter behov: ";
            else
                return "Dag ikke angivet: ";
        }
        else if (structure.getIterationInterval() === 1) {
            return "";
        }
        else {
            return TextHelper.makeDayString(structure.getStartDateOrDateTime(), day.getDayNumber()) + ": ";
        }
    }

    protected makeDaysDosage(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, day: DayWrapper, hasDaysLabel: boolean): string {
        let s = "";

        let supplText = "";
        if (structure.getSupplText()) {
            supplText = TextHelper.maybeAddSpace(structure.getSupplText()) + structure.getSupplText();
        }

        let daglig = "";
        if (!hasDaysLabel)
            daglig = " daglig";

        if (day.getNumberOfDoses() === 1) {
            s += this.makeOneDose(day.getDose(0), unitOrUnits, structure.getSupplText());
            if (day.containsAccordingToNeedDosesOnly() && day.getDayNumber() > 0)
                s += " højst 1 gang" + daglig + supplText;
            else
                s += supplText;
        }
        else if (day.getNumberOfDoses() > 1 && day.allDosesAreTheSame()) {
            s += this.makeOneDose(day.getDose(0), unitOrUnits, structure.getSupplText());
            if (day.containsAccordingToNeedDosesOnly() && day.getDayNumber() > 0)
                s += " højst " + day.getNumberOfDoses() + " " + TextHelper.gange(day.getNumberOfDoses()) + daglig + supplText;
            else
                s += " " + day.getNumberOfDoses() + " " + TextHelper.gange(day.getNumberOfDoses()) + daglig + supplText;
        }
        else if (day.getNumberOfDoses() > 2 && day.allDosesButTheFirstAreTheSame()) {
            // Eks.: 1 stk. kl. 08:00 og 2 stk. 4 gange daglig

            s += this.makeOneDose(day.getDose(0), unitOrUnits, structure.getSupplText()) + supplText;
            if (0 < day.getNumberOfDoses() - 1) {
                s += " + ";
            }
            let dayWithoutFirstDose: DayWrapper = new DayWrapper(day.getDayNumber(), day.getAllDoses().slice(1, day.getAllDoses().length));
            s += this.makeDaysDosage(unitOrUnits, structure, dayWithoutFirstDose, false);
        }

        else {

            for (let d = 0; d < day.getNumberOfDoses(); d++) {
                s += this.makeOneDose(day.getDose(d), unitOrUnits, structure.getSupplText()) + supplText;
                if (d < day.getNumberOfDoses() - 1)
                    s += " + ";
            }
        }
        let dosagePeriodPostfix = structure.getDosagePeriodPostfix();
        if (dosagePeriodPostfix && dosagePeriodPostfix.length > 0) {
            s += " " + dosagePeriodPostfix;
        }

        return s;
    }

    private makeOneDose(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper, supplText: string): string {

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

    protected getNoteText(structure: StructureWrapper): string {
        if (this.isVarying(structure) && this.isComplex(structure))
            return ".\nBemærk at doseringen varierer og har et komplekst forløb:\n";
        else if (this.isVarying(structure))
            return ".\nBemærk at doseringen varierer:\n";
        else if (this.isComplex(structure))
            return ".\nBemærk at doseringen har et komplekst forløb:\n";
        else
            return ":\n";
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
