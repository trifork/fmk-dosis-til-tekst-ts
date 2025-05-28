import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DayHelper } from "../helpers/DayHelper";

/**
 * Conversion of simple "according to need" dosage, with or without supplementary dosage free text
 * <p>
 * Example<br>
 * 2: 2 stk efter behov
 */

export class SimpleAccordingToNeedConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "SimpleAccordingToNeedConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval && !StructureHelper.isIterationToLong(structure))
            return false;
        if (structure.days.length !== 1)
            return false;
        let day: Day = structure.days[0];
        if (!DayHelper.containsAccordingToNeedDosesOnly(day))
            return false;
        if (DayHelper.getAccordingToNeedDoses(day).length > 1)
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        let structure: Structure = dosage.structures.structures[0];
        let text = "";
        let day: Day = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);
        text += " efter behov";
        if (structure.supplText)
            text += TextHelper.addShortSupplText(structure.supplText);
        return text.toString();
    }
}
