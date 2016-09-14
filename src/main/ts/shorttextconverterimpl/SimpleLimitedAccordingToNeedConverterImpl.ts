import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

/**
 * Conversion of simple but limited "according to need" dosage, with or without suppl. dosage free text
 * <p>
 * Example:<br>
 * 283: 1 pust ved anfald højst 3 gange daglig
 */
export class SimpleLimitedAccordingToNeedConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 1)
            return false;
        if (structure.days.length != 1)
            return false;
        let day: DayWrapper = structure.days[0];
        if (day.dayNumber !== 1)
            return false;
        if (!day.containsAccordingToNeedDosesOnly())
            return false;
        if (!day.allDosesAreTheSame())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";
        let day: DayWrapper = structure.days[0];
        text += SimpleLimitedAccordingToNeedConverterImpl.toDoseAndUnitValue(day.getAccordingToNeedDoses()[0], dosage.structures.unitOrUnits);
        text += " efter behov";

        if (day.getNumberOfAccordingToNeedDoses() == 1)
            text += ", højst " + day.getNumberOfAccordingToNeedDoses() + " gang daglig";
        else
            text += ", højst " + day.getNumberOfAccordingToNeedDoses() + " gange daglig";

        if (structure.supplText != null)
            text += TextHelper.maybeAddSpace(structure.supplText) + structure.supplText;

        return text.toString();
    }
}
