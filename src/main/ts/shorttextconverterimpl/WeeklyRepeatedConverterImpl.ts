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
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 7)
            return false;
        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
            return false;
        if (structure.getDays().length > 7 || structure.getDays().length === 0)
            return false;
        if (structure.getDays()[0].getDayNumber() === 0)
            return false;
        if (structure.getDays()[structure.getDays().length - 1].getDayNumber() > 7)
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
        let structure = dosage.structures.getStructures()[0];

        let text = "";

        // Append dosage
        let day: DayWrapper = structure.getDays()[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.getAllDoses()[0], dosage.structures.getUnitOrUnits());

        // Add times daily
        if (day.getNumberOfDoses() > 1)
            text += " " + day.getNumberOfDoses() + " gange daglig";

        // Add days
        text += WeeklyRepeatedConverterImpl.makeDays(structure);

        text += " hver uge";

        if (structure.getSupplText())
            text += TextHelper.maybeAddSpace(structure.getSupplText()) + structure.getSupplText();

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
                text += " og " + d.getName().toLowerCase();
            else if (i === 0)
                text += " " + d.getName().toLowerCase();
            else if (i > 0)
                text += ", " + d.getName().toLowerCase();
            i++;
        }
        return text.toString();
    }
}
