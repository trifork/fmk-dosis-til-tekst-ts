import { DayOfWeek } from "../DayOfWeek";
import { Dosage, Structure } from "../dto/Dosage";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";
import { DayHelper } from "../helpers/DayHelper";
import { StructureHelper } from "../helpers/StructureHelper";
import { WeeklyRepeatedConverterImpl as LongTextWeeklyRepeatedConverterImpl } from "../longtextconverterimpl/WeeklyRepeatedConverterImpl";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";
import { ShortTextConverterImpl } from "./ShortTextConverterImpl";

export class WeeklyMorningNoonEveningNightConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "WeeklyMorningNoonEveningNightConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        const structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval !== 7)
            return false;
        if (DateOrDateTimeHelper.isEqualTo(structure.startDate, structure.endDate))
            return false;
        if (structure.days.length > 7 || structure.days.length === 0)
            return false;
        if (DayHelper.isAnyDay(structure.days[0]))
            return false;
        if (structure.days[structure.days.length - 1].dayNumber > 7)
            return false;
        if (StructureHelper.containsAccordingToNeedDose(structure) || StructureHelper.containsPlainDose(structure) || StructureHelper.containsTimedDose(structure))
            return false;
        if (!StructureHelper.allDaysAreTheSame(structure)) // Otherwise the text is too long, and cannot fit into a short text
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {

        const structure: Structure = dosage.structures.structures[0];

        const daysOfWeek: DayOfWeek[] =
            LongTextWeeklyRepeatedConverterImpl.sortDaysOfWeek(structure);
        let text = "";

        const firstDay: DayOfWeek = daysOfWeek[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(firstDay.day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNoonText(firstDay.day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getEveningText(firstDay.day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNightText(firstDay.day, dosage.structures.unitOrUnits);
        let i = 0;
        for (const d of daysOfWeek) {
            if (i === daysOfWeek.length - 1 && daysOfWeek.length > 1)
                text += " og " + d.name.toLowerCase();
            else if (i === 0)
                text += " " + d.name.toLowerCase();
            else if (i > 0)
                text += ", " + d.name.toLowerCase();
            i++;
        }
        text += " hver uge";
        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.supplText);

        return text;
    }
}
