import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";
import { WeeklyRepeatedConverterImpl as LongTextWeeklyRepeatedConverterImpl } from "../longtextconverterimpl/WeeklyRepeatedConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { DayOfWeek } from "../vowrapper/DayOfWeek";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class WeeklyRepeatedConverterImpl extends ShortTextConverterImpl {

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
        if (structure.days.length > 7 || structure.days.length == 0)
            return false;
        if (structure.days[0].dayNumber === 0)
            return false;
        if (structure.days[structure.days.length - 1].dayNumber > 7)
            return false;
        if (!structure.allDaysAreTheSame()) // Otherwise the text is too long, and cannot fit into a short text
            return false;
        if (!structure.allDosesAreTheSame())
            return false;
        if (structure.containsAccordingToNeedDose() || structure.containsMorningNoonEveningNightDoses() || structure.containsTimedDose())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure = dosage.structures.structures[0];

        let text = "";

        // Append dosage
        let day: DayWrapper = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);

        // Add times daily
        if (day.getNumberOfDoses() > 1)
            text += " " + day.getNumberOfDoses() + " gange daglig";

        // Add days
        text += WeeklyRepeatedConverterImpl.makeDays(structure);

        text += " hver uge";

        if (structure.supplText)
            text += TextHelper.maybeAddSpace(structure.supplText) + structure.supplText;

        return text.toString();
    }

    public static makeDays(structure: StructureWrapper): string {
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
