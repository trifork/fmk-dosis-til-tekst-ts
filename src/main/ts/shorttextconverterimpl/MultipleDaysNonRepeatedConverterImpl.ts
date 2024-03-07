import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";

export class MultipleDaysNonRepeatedConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "MultipleDaysNonRepeatedConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval && !StructureHelper.isIterationToLong(structure))
            return false;
        if (structure.days.length <= 1)
            return false;
        if (!StructureHelper.allDaysAreTheSame(structure))
            return false;
        if (!StructureHelper.allDosesAreTheSame(structure))
            return false;
        if (StructureHelper.containsAccordingToNeedDose(structure))
            return false;
        if (StructureHelper.containsTimedDose(structure))
            return false;
        if (StructureHelper.containsMorningNoonEveningNightDoses(structure) && StructureHelper.containsPlainDose(structure))
            return false;
        return true;
    }
    public doConvert(dosage: Dosage): string {
        let structure: Structure = dosage.structures.structures[0];
        let text = "";

        let firstDay: Day = structure.days[0];
        if (StructureHelper.containsMorningNoonEveningNightDoses(structure)) {
            text += MorningNoonEveningNightConverterImpl.getMorningText(firstDay, dosage.structures.unitOrUnits);
            text += MorningNoonEveningNightConverterImpl.getNoonText(firstDay, dosage.structures.unitOrUnits);
            text += MorningNoonEveningNightConverterImpl.getEveningText(firstDay, dosage.structures.unitOrUnits);
            text += MorningNoonEveningNightConverterImpl.getNightText(firstDay, dosage.structures.unitOrUnits);
        }
        else {
            text += ShortTextConverterImpl.toDoseAndUnitValue(firstDay.allDoses[0], dosage.structures.unitOrUnits);
            text += " " + firstDay.allDoses.length + " " + TextHelper.gange(firstDay.allDoses.length) + " daglig";
        }

        for (let i: number = 0; i < structure.days.length; i++) {

            let day: Day = structure.days[i];
            if (i === 0)
                text += " dag " + day.dayNumber;
            else if (i === structure.days.length - 1)
                text += " og " + day.dayNumber;
            else text += ", " + day.dayNumber;
        }

        if (structure.supplText)
            text += TextHelper.addShortSupplText(structure.supplText);

        return text.toString();
    }
}
