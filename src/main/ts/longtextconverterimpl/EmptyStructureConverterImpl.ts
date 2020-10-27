import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { TextHelper } from "../TextHelper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextOptions } from "../TextOptions";

export class EmptyStructureConverterImpl extends LongTextConverterImpl {

    public canConvert(dosageStructure: DosageWrapper): boolean {
        return dosageStructure.isStructured()
            && dosageStructure.structures.getStructures()
            && dosageStructure.structures.getStructures().length === 1
            && dosageStructure.structures.getStructures()[0].getDays().length === 0;
    }

    public doConvert(dosageStructure: DosageWrapper, options: TextOptions): string {
        return this.convert(dosageStructure.structures.getUnitOrUnits(), dosageStructure.structures.getStructures()[0]);
    }

    private convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";


        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime())) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(structure.getStartDateOrDateTime());
        }
        else {
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());
            if (structure.getEndDateOrDateTime()) {
                s += this.getDosageEndText(structure);
            }
        }

        s += ":\nBemærk: skal ikke anvendes i denne periode!";

        return s;
    }

}
