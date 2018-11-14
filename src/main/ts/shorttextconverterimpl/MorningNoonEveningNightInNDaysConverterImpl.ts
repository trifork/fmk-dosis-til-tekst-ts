import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";


/**
 * Conversion of: Non repeated morning, noon, evening, night-dosage where all dosages are equal
 */
export class MorningNoonEveningNightInNDaysConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 0)
            return false;
        if (structure.getDays().length < 2)
            return false;
        if (structure.startsAndEndsSameDay())
            return false;
        if (structure.containsPlainDose())
            return false;
        if (structure.containsTimedDose())
            return false;
        if (!structure.allDaysAreTheSame())
            return false;
        if (!structure.daysAreInUninteruptedSequenceFromOne())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";
        let day: DayWrapper = structure.getDays()[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getNoonText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getEveningText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getNightText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.getSupplText());
        text += (" i " + dosage.structures.getStructures()[0].getDays()[dosage.structures.getStructures()[0].getDays().length - 1].getDayNumber() + " dage");
        return text;
    }
}
