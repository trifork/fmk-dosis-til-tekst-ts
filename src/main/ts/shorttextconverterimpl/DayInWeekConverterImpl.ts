import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import {TextHelper } from "../TextHelper";

export class DayInWeekConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];

        if (structure.getIterationInterval() % 7 > 0)
            return false;
        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
            return false;
        if (structure.getDays().length < 2)
            return false;
        // Check there is only one day in each week
        let daysAsList: DayWrapper[] = structure.getDays();
        for (let week = 0; week < daysAsList.length; week++) {
            if (structure.getDays()[week].getDayNumber() < (week * 7 + 1))
                return false;
            if (structure.getDays()[week].getDayNumber() > (week * 7 + 7))
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
        let structure: StructureWrapper = dosage.structures.getStructures()[0];

        let text = "";

        // Append dosage
        let day: DayWrapper = structure.getDays()[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.getAllDoses()[0], dosage.structures.getUnitOrUnits());

        // Add times daily
        if (day.getNumberOfDoses() > 1)
            text += " " + day.getNumberOfDoses() + " gange daglig ";
        else
            text += " daglig ";

        text += TextHelper.makeDayOfWeekAndName(structure.getStartDateOrDateTime(), day, false).getName();

        if (structure.getSupplText()) {
            text += TextHelper.addShortSupplText(structure.getSupplText());
        }

        let weeks: number = structure.getDays().length;
        let pauseWeeks: number = structure.getIterationInterval() / 7 - weeks;

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
