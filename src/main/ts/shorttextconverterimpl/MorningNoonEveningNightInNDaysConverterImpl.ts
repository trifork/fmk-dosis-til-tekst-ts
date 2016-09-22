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
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 0)
            return false;
        if (structure.days.length < 2)
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
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";
        let day: DayWrapper = structure.days[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNoonText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getEveningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNightText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.supplText);
        text += (" i " + dosage.structures.structures[0].days[dosage.structures.structures[0].days.length - 1].dayNumber + " dage");
        return text;
    }
}