import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";

export class NumberOfWholeWeeksConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "NumberOfWholeWeeksConverterImpl";
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
        if (structure.days.length === 0)
            return false;
        if (structure.days[0].dayNumber > 7)
            return false;
        if (!StructureHelper.daysAreInUninteruptedSequenceFromOne(structure))
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

        const day: Day = structure.days[0];

        // Append dosage
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);

        // Add times daily
        if (day.allDoses.length > 1)
            text += " " + day.allDoses.length + " gange daglig";
        else if (structure.iterationInterval > 0)
            text += " daglig";
        else
            text += " 1 gang";


        const days: number = structure.days.length;
        const pauseDays: number = structure.iterationInterval - days;

        // If pause == 0 then this structure is equivalent to a structure with just one day and iteration=1
        if (pauseDays > 0) {
            // Add how many weeks/days
            if (days === 7) {
                text += " i en uge";
            } else if (days % 7 === 0) {
                const weeks = days / 7;
                text += " i " + weeks + " uger";
            } else {
                text += " i " + days + " dage";
            }

            // Add pause
            if (pauseDays === 7) {
                text += ", herefter en uges pause";
            } else if (pauseDays % 7 === 0) {
                const pauseWeeks: number = pauseDays / 7;
                text += ", herefter " + pauseWeeks + " ugers pause";
            } else if (pauseDays === 1) {
                text += ", herefter 1 dags pause";
            } else {
                text += ", herefter " + pauseDays + " dages pause";
            }
        }

        if (structure.supplText) {
            text += TextHelper.addShortSupplText(structure.supplText);
        }

        return text;
    }
}
