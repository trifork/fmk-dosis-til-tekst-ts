import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

/**
 * Conversion of simple "according to need" dosage, with or without supplementary dosage free text
 * <p>
 * Example<br>
 * 2: 2 stk efter behov
 */

export class SimpleAccordingToNeedConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 0)
            return false;
        if (structure.days.length !== 1)
            return false;
        let day: DayWrapper = structure.days[0];
        if (!day.containsAccordingToNeedDosesOnly())
            return false;
        if (day.getAccordingToNeedDoses().length > 1)
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";
        let day: DayWrapper = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);
        text += " efter behov";
        if (structure.supplText)
            text += TextHelper.maybeAddSpace(structure.supplText) + structure.supplText;
        return text.toString();
    }
}
