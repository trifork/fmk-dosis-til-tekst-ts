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

    public getConverterClassName(): string {
        return "SimpleLimitedAccordingToNeedConverterImpl";
    }

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 1)
            return false;
        if (structure.getDays().length !== 1)
            return false;
        let day: DayWrapper = structure.getDays()[0];
        if (day.getDayNumber() !== 1)
            return false;
        if (!day.containsAccordingToNeedDosesOnly())
            return false;
        if (!day.allDosesAreTheSame())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";
        let day: DayWrapper = structure.getDays()[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.getAccordingToNeedDoses()[0], dosage.structures.getUnitOrUnits());
        text += " efter behov";

        if (day.getNumberOfAccordingToNeedDoses() === 1) {
            text += ", højst 1 gang dagligt";
        }
        else if (day.getNumberOfAccordingToNeedDoses() > 1) {
            text += ", højst " + day.getNumberOfAccordingToNeedDoses() + " gange daglig";
        }

        if (structure.getSupplText())
            text += TextHelper.addShortSupplText(structure.getSupplText());

        return text.toString();
    }
}
