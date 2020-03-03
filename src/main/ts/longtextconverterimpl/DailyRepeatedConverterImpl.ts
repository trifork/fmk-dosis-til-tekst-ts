import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";

export class DailyRepeatedConverterImpl extends LongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 1)
            return false;
        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
            return false;
        if (structure.getDays().length !== 1)
            return false;
        if (structure.getDays()[0].getDayNumber() !== 1)
            return false;
        return true;
    }


    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0]);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";
        s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());

        if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
            s += this.getDosageEndText(structure.getEndDateOrDateTime());
        }
        s += ":\n";

        s += this.getDaysText(unitOrUnits, structure);

        s = this.appendSupplText(structure, s);
        return s;
    }

}
