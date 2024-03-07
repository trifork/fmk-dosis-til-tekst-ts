import { WeeklyRepeatedConverterImpl } from "./WeeklyRepeatedConverterImpl";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";
import { DateOrDateTime, Dosage, Dose, Structure, UnitOrUnits } from "../dto/Dosage";
import StructureHelper from "../helpers/StructureHelper";
import DoseHelper from "../helpers/DoseHelper";
import DateOrDateTimeHelper from "../helpers/DateOrDateTimeHelper";
import { DayOfWeek } from "../DayOfWeek";

export class NWeeklyRepeatedConverterImpl extends WeeklyRepeatedConverterImpl {

    public getConverterClassName(): string {
        return "NWeeklyRepeatedConverterImpl";
    }

    public canConvert(dosage: Dosage, options: TextOptions): boolean {
        if (dosage.structures) {

            if (dosage.structures.structures.length !== 1)
                return false;
            let structure: Structure = dosage.structures.structures[0];
            if (structure.iterationInterval <= 7 || structure.iterationInterval % 7 !== 0)
                return false;
            if (DateOrDateTimeHelper.isEqualTo(structure.startDateOrDateTime, structure.endDateOrDateTime))
                return false;
            if (structure.days.length !== 1)
                return false;
            if (structure.days[0].allDoses.length !== 1)
                return false;
            if (structure.days[0].dayNumber > 7)
                return false;
            return true;
        }
        return false;
    }

    public convert(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {
        let s = "";
        s += this.getDosageStartText(structure.startDateOrDateTime, structure.iterationInterval, options);
        if (structure.endDateOrDateTime) {
            s += this.getDosageEndText(structure, options);
        }

        if (!StructureHelper.containsAccordingToNeedDose(structure)) {
            s += " - gentages hver " + structure.iterationInterval + ". dag";
        }

        s += ":\nHver " + Math.floor(structure.iterationInterval / 7) + ". " + this.getDayNamesText(unitOrUnits, structure, options);

        s = this.appendSupplText(structure, s, options);

        return s;
    }


    protected makeOneDose(dose: Dose, unitOrUnits: UnitOrUnits, dayNumber: number, startDateOrDateTime: DateOrDateTime, includeWeekName: boolean, options: TextOptions): string {

        let dateOnly = TextHelper.makeFromDateOnly(DateOrDateTimeHelper.getDateOrDateTime(startDateOrDateTime));
        dateOnly.setDate(dateOnly.getDate() + dayNumber - 1);

        let s = TextHelper.getWeekday(dateOnly.getDay()) + ": ";

        s += DoseHelper.getAnyDoseQuantityString(dose);
        s += " " + TextHelper.getUnit(dose, unitOrUnits);




        if (DoseHelper.getLabel(dose).length > 0) {
            s += " " + DoseHelper.getLabel(dose);
        }
        if (dose.isAccordingToNeed) {
            s += " efter behov";
        }
        return s;
    }

    protected getDayNamesText(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {
        // Make a sorted list of weekdays
        let s = "";
        let daysOfWeek: DayOfWeek[] = WeeklyRepeatedConverterImpl.sortDaysOfWeek(structure);

        let appendedLines = 0;
        for (let e of daysOfWeek) {
            if (appendedLines > 0)
                s += "\n";
            appendedLines++;
            s += this.makeDaysDosage(unitOrUnits, structure, e.day, true, options);

        }
        return s;
    }
}
