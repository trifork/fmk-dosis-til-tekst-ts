import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";
import { WeeklyRepeatedConverterImpl as LongTextWeeklyRepeatedConverterImpl } from "../longtextconverterimpl/WeeklyRepeatedConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { DayOfWeek } from "../vowrapper/DayOfWeek";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class WeeklyMorningNoonEveningNightConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 7)
            return false;
        if (structure.startDateOrDateTime.isEqualTo(structure.endDateOrDateTime))
            return false;
        if (structure.days.length > 7)
            return false;
        if (structure.days[0].dayNumber === 0)
            return false;
        if (structure.days[structure.days.length - 1].dayNumber > 7)
            return false;
        if (structure.containsAccordingToNeedDose() || structure.containsPlainDose() || structure.containsTimedDose())
            return false;
        if (!structure.allDaysAreTheSame()) // Otherwise the text is too long, and cannot fit into a short text
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {

        let structure: StructureWrapper = dosage.structures.structures[0];

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
