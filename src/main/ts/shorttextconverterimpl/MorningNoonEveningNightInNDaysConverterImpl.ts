import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";


/**
 * Conversion of: Non repeated morning, noon, evening, night-dosage where all dosages are equal
 */
export class MorningNoonEveningNightInNDaysConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "MorningNoonEveningNightInNDaysConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: Structure = dosage.structures.structures[0];
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
        let structure: Structure = dosage.structures.structures[0];
        let text = "";
        let day: Day = structure.days[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNoonText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getEveningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNightText(day, dosage.structures.unitOrUnits);
        let noOfDays = dosage.structures.structures[0].days[dosage.structures.structures[0].days.length - 1].dayNumber;
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
