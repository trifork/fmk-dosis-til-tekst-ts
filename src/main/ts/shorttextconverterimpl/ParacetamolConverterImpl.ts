import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class ParacetamolConverterImpl extends ShortTextConverterImpl {

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
        if (!day.containsAccordingToNeedDose())
            return false;
        if (day.containsAccordingToNeedDosesOnly())
            return false;
        if (day.containsTimedDose()) {
            return false;
        }
        if (!day.containsPlainDose())
            return false;
        if (day.getMorningDose() || day.getNoonDose()
            || day.getEveningDose() || day.getNightDose())
            return false;
        if (!day.allDosesHaveTheSameQuantity())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";

        let day: DayWrapper = structure.getDays()[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.getAllDoses()[0], dosage.structures.getUnitOrUnits());
        text += " " + (day.getNumberOfPlainDoses() - day.getNumberOfAccordingToNeedDoses()) + "-" + (day.getNumberOfPlainDoses());
        text += " gange daglig";
        if (structure.getSupplText())
            text += TextHelper.addShortSupplText(structure.getSupplText());
        return text.toString();
    }

}
