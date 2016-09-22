import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class NumberOfWholeWeeksConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];

        if (structure.iterationInterval % 7 > 0)
            return false;
        if (structure.startDateOrDateTime.isEqualTo(structure.endDateOrDateTime))
            return false;
        if (structure.days.length === 0)
            return false;
        if (structure.days[0].dayNumber > 7)
            return false;
        if (!structure.daysAreInUninteruptedSequenceFromOne())
            return false;
        if (!structure.allDaysAreTheSame())
            return false;
        if (!structure.allDosesAreTheSame())
            return false;
        if (structure.containsAccordingToNeedDose() || structure.containsTimedDose())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";

        let day: DayWrapper = structure.days[0];

        // Append dosage
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);

        // Add times daily
        if (day.getNumberOfDoses() > 1)
            text += " " + day.getNumberOfDoses() + " gange daglig";
        else
            text += " daglig";

        let days: number = structure.days.length;
        let pauseDays: number = structure.iterationInterval - days;

        // If pause == 0 then this structure is equivalent to a structure with just one day and iteration=1
        if (pauseDays > 0) {
            // Add how many weeks/days
            if (days === 7) {
                text += " i en uge";
            } else if (days % 7 === 0) {
                let weeks = days / 7;
                text += " i " + weeks + " uger";
            } else {
                text += " i " + days + " dage";
            }

            // Add pause
            if (pauseDays === 7) {
                text += ", herefter en uges pause";
            } else if (pauseDays % 7 === 0) {
                let pauseWeeks: number = pauseDays / 7;
                text += ", herefter " + pauseWeeks + " ugers pause";
            } else if (pauseDays === 1) {
                text += ", herefter 1 dags pause";
            } else {
                text += ", herefter " + pauseDays + " dages pause";
            }
        }
        return text;
    }
}