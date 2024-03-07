import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";
import { WeeklyRepeatedConverterImpl as LongTextWeeklyRepeatedConverterImpl } from "../longtextconverterimpl/WeeklyRepeatedConverterImpl";
import { TextHelper } from "../TextHelper";
import { Dosage, Structure } from "../dto/Dosage";
import StructureHelper from "../helpers/StructureHelper";
import DayHelper from "../helpers/DayHelper";
import DateOrDateTimeHelper from "../helpers/DateOrDateTimeHelper";
import { DayOfWeek } from "../DayOfWeek";

export class WeeklyMorningNoonEveningNightConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "WeeklyMorningNoonEveningNightConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (dosage.structures === undefined)
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
        if (StructureHelper.containsAccordingToNeedDose(structure) || StructureHelper.containsPlainDose(structure) || StructureHelper.containsTimedDose(structure))
            return false;
        if (!StructureHelper.allDaysAreTheSame(structure)) // Otherwise the text is too long, and cannot fit into a short text
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {

        let structure: Structure = dosage.structures.structures[0];

        let daysOfWeek: DayOfWeek[] =
            LongTextWeeklyRepeatedConverterImpl.sortDaysOfWeek(structure);
        let text = "";

        let firstDay: DayOfWeek = daysOfWeek[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(firstDay.day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNoonText(firstDay.day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getEveningText(firstDay.day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNightText(firstDay.day, dosage.structures.unitOrUnits);
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
        text += " hver uge";
        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.supplText);

        return text;
    }
}
