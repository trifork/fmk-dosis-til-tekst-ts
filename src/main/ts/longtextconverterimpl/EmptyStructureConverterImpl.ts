import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";
import { Dosage, Structure, UnitOrUnits } from "../dto/Dosage";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";

export class EmptyStructureConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "EmptyStructureConverterImpl";
    }

    public canConvert(dosageStructure: Dosage, options: TextOptions): boolean {
        return dosageStructure.structures?.structures?.length === 1
            && dosageStructure.structures.structures[0].days.length === 0;
    }

    public doConvert(dosageStructure: Dosage, options: TextOptions, currentTime: Date): string {
        return this.convert(dosageStructure.structures.unitOrUnits, dosageStructure.structures.structures[0], options);
    }

    private convert(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {
        let s = "";


        if (DateOrDateTimeHelper.isEqualTo(structure.startDateOrDateTime, structure.endDateOrDateTime)) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(structure.startDateOrDateTime);
        }
        else {
            s += this.getDosageStartText(structure.startDateOrDateTime, structure.iterationInterval, options);
            if (structure.endDateOrDateTime) {
                s += this.getDosageEndText(structure, options);
            }
        }

        if (LongTextConverterImpl.convertAsVKA(options)) {

            let emptyDosageString =
                "0 " + (unitOrUnits.unitPlural ? unitOrUnits.unitPlural : unitOrUnits.unit);

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
