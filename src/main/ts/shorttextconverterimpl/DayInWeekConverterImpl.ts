import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import {TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";

export class DayInWeekConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "DayInWeekConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        const structure: Structure = dosage.structures.structures[0];

        if (structure.iterationInterval % 7 > 0)
            return false;
        if (DateOrDateTimeHelper.isEqualTo(structure.startDate, structure.endDate))
            return false;
        if (structure.days.length < 2)
            return false;
        // Check there is only one day in each week
        const daysAsList: Day[] = structure.days;
        for (let week = 0; week < daysAsList.length; week++) {
            if (structure.days[week].dayNumber < (week * 7 + 1))
                return false;
            if (structure.days[week].dayNumber > (week * 7 + 7))
                return false;
        }
        if (!StructureHelper.sameDayOfWeek(structure))
            return false;
        if (!StructureHelper.allDaysAreTheSame(structure))
            return false;
        if (!StructureHelper.allDosesAreTheSame(structure))
            return false;
        if (StructureHelper.containsAccordingToNeedDose(structure) || StructureHelper.containsTimedDose(structure))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        const structure: Structure = dosage.structures.structures[0];

        let text = "";

        // Append dosage
        const day: Day = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);

        // Add times daily
        if (day.allDoses.length > 1)
            text += " " + day.allDoses.length + " gange daglig ";
        else
            text += " daglig ";

        text += TextHelper.makeDayOfWeekAndName(structure.startDate, day, false).name;

        if (structure.supplText) {
            text += TextHelper.addShortSupplText(structure.supplText);
        }

        const weeks: number = structure.days.length;
        const pauseWeeks: number = structure.iterationInterval / 7 - weeks;

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
