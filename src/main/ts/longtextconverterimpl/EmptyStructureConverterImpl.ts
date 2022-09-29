import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { TextHelper } from "../TextHelper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextOptions } from "../TextOptions";

export class EmptyStructureConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "EmptyStructureConverterImpl";
    }

    public canConvert(dosageStructure: DosageWrapper, options: TextOptions): boolean {
        return dosageStructure.isStructured()
            && dosageStructure.structures.getStructures()
            && dosageStructure.structures.getStructures().length === 1
            && dosageStructure.structures.getStructures()[0].getDays().length === 0;
    }

    public doConvert(dosageStructure: DosageWrapper, options: TextOptions, currentTime: Date): string {
        return this.convert(dosageStructure.structures.getUnitOrUnits(), dosageStructure.structures.getStructures()[0], options);
    }

    private convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, options: TextOptions): string {
        let s = "";


        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime())) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(structure.getStartDateOrDateTime());
        }
        else {
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval(), options);
            if (structure.getEndDateOrDateTime()) {
                s += this.getDosageEndText(structure, options);
            }
        }

        if (LongTextConverterImpl.convertAsVKA(options)) {

            let emptyDosageString =
                "0 " + (unitOrUnits.getUnitPlural() ? unitOrUnits.getUnitPlural() : unitOrUnits.getUnit());

            if (options === TextOptions.VKA_WITH_MARKUP) {
                s = "<div class=\"d2t-period\"><div class=\"d2t-periodtext\">"
                    + s
                    + ":</div>\n<dl class=\"d2t-adjustmentperiod\">"
                    + "<dt></dt><dd>" + emptyDosageString + "</dd></dl></div>";
            }
            else {
                s = s + ": " + emptyDosageString;
            }
        } else {
            s += ":\nBemærk: skal ikke anvendes i denne periode!";
        }
        return s;
    }

}
