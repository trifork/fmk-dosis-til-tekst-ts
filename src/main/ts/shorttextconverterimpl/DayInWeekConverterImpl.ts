import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import {TextHelper } from "../TextHelper";

export class DayInWeekConverterImpl extends ShortTextConverterImpl {

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
        if (structure.days.length < 2)
            return false;
        // Check there is only one day in each week
        let daysAsList: DayWrapper[] = structure.days;
        for (let week = 0; week < daysAsList.length; week++) {
            if (structure.days[week].dayNumber < (week * 7 + 1))
                return false;
            if (structure.days[week].dayNumber > (week * 7 + 7))
                return false;
        }
        if (!structure.sameDayOfWeek())
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

        // Append dosage
        let day: DayWrapper = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);

        // Add times daily
        if (day.getNumberOfDoses() > 1)
            text += " " + day.getNumberOfDoses() + " gange daglig ";
        else
            text += " daglig ";

        text += TextHelper.makeDayOfWeekAndName(structure.startDateOrDateTime, day, false).name;

        let weeks: number = structure.days.length;
        let pauseWeeks: number = structure.iterationInterval / 7 - weeks;

        // If pause == 0 then this structure is equivalent to a structure with just one day and iteration=1
        if (pauseWeeks > 0) {
            // Add how many weeks/days
            if (weeks === 1) {
                text += " i første uge";
            }
            else {
                text += " i de første " + weeks + " uger";
            }

            // Add pause
            if (pauseWeeks === 1) {
                text += ", herefter 1 uges pause";
            }
            else {
                text += ", herefter " + pauseWeeks + " ugers pause";
            }
        }

        return text;
    }

}
