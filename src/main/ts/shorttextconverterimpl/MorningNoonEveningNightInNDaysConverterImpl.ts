import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";
import { ShortTextConverterImpl } from "./ShortTextConverterImpl";


/**
 * Conversion of: Non repeated morning, noon, evening, night-dosage where all dosages are equal
 */
export class MorningNoonEveningNightInNDaysConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "MorningNoonEveningNightInNDaysConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        const structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval && !StructureHelper.startsAndEndsSameDay(structure))
            return false;
        if (structure.days.length === 0 || (structure.days.length === 1 && !StructureHelper.startsAndEndsSameDay(structure)))
            return false;
        if (StructureHelper.containsPlainDose(structure))
            return false;
        if (StructureHelper.containsTimedDose(structure))
            return false;
        if (!StructureHelper.allDaysAreTheSame(structure))
            return false;
        if (!StructureHelper.daysAreInUninteruptedSequenceFromOne(structure))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        const structure: Structure = dosage.structures.structures[0];
        let text = "";
        const day: Day = structure.days[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNoonText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getEveningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNightText(day, dosage.structures.unitOrUnits);
        const noOfDays = dosage.structures.structures[0].days[dosage.structures.structures[0].days.length - 1].dayNumber;
        text += " i " + noOfDays;
        if (noOfDays === 1) {
            text += " dag";
        } else {
            text += " dage";
        }

        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.supplText);

        return text;
    }
}
