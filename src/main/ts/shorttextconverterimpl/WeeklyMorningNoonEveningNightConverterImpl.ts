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

    public getConverterClassName(): string {
        return "WeeklyMorningNoonEveningNightConverterImpl";
    }

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 7)
            return false;
        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
            return false;
        if (structure.getDays().length > 7 || structure.getDays().length === 0)
            return false;
        if (structure.getDays()[0].isAnyDay())
            return false;
        if (structure.getDays()[structure.getDays().length - 1].getDayNumber() > 7)
            return false;
        if (structure.containsAccordingToNeedDose() || structure.containsPlainDose() || structure.containsTimedDose())
            return false;
        if (!structure.allDaysAreTheSame()) // Otherwise the text is too long, and cannot fit into a short text
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {

        let structure: StructureWrapper = dosage.structures.getStructures()[0];

        let daysOfWeek: DayOfWeek[] =
            LongTextWeeklyRepeatedConverterImpl.sortDaysOfWeek(structure);
        let text = "";

        let firstDay: DayOfWeek = daysOfWeek[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(firstDay.getDay(), dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getNoonText(firstDay.getDay(), dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getEveningText(firstDay.getDay(), dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getNightText(firstDay.getDay(), dosage.structures.getUnitOrUnits());
        let i = 0;
        for (let d of daysOfWeek) {
            if (i === daysOfWeek.length - 1 && daysOfWeek.length > 1)
                text += " og " + d.getName().toLowerCase();
            else if (i === 0)
                text += " " + d.getName().toLowerCase();
            else if (i > 0)
                text += ", " + d.getName().toLowerCase();
            i++;
        }
        text += " hver uge";
        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.getSupplText());

        return text;
    }
}
