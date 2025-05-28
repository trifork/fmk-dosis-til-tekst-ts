import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { WeeklyRepeatedConverterImpl as LongTextWeeklyRepeatedConverterImpl } from "../longtextconverterimpl/WeeklyRepeatedConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DayHelper } from "../helpers/DayHelper";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";
import { DayOfWeek } from "../DayOfWeek";

export class WeeklyRepeatedConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "WeeklyRepeatedConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval !== 7)
            return false;
        if (DateOrDateTimeHelper.isEqualTo(structure.startDateOrDateTime, structure.endDateOrDateTime))
            return false;
        if (structure.days.length > 7 || structure.days.length === 0)
            return false;
        if (DayHelper.isAnyDay(structure.days[0]))
            return false;
        if (structure.days[structure.days.length - 1].dayNumber > 7)
            return false;
        if (!StructureHelper.allDaysAreTheSame(structure)) // Otherwise the text is too long, and cannot fit into a short text
            return false;
        if (!StructureHelper.allDosesAreTheSame(structure))
            return false;
        if (StructureHelper.containsAccordingToNeedDose(structure) || StructureHelper.containsMorningNoonEveningNightDoses(structure) || StructureHelper.containsTimedDose(structure))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        let structure = dosage.structures.structures[0];

        let text = "";

        // Append dosage
        let day: Day = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);

        // Add times daily
        if (day.allDoses.length > 1)
            text += " " + day.allDoses.length + " gange daglig";

        // Add days
        text += WeeklyRepeatedConverterImpl.makeDays(structure);

        text += " hver uge";

        if (structure.supplText)
            text += TextHelper.addShortSupplText(structure.supplText);

        return text.toString();
    }

    public static makeDays(structure: Structure): string {
        let text = "";
        // Add days
        let daysOfWeek: DayOfWeek[] =
            LongTextWeeklyRepeatedConverterImpl.sortDaysOfWeek(structure);
        let i = 0;
        for (let d of daysOfWeek) {
            if (i === daysOfWeek.length - 1 && daysOfWeek.length > 1)
                text += " og " + d.name.toLowerCase();
            else if (i === 0)
                text += " " + d.name.toLowerCase();
            else if (i > 0)
                text += ", " + d.name.toLowerCase();
            i++;
        }
        return text.toString();
    }
}
