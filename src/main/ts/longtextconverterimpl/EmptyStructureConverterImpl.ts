import {LongTextConverterImpl} from "./LongTextConverterImpl";
import {DosageWrapper} from "../vowrapper/DosageWrapper";
import {TextHelper} from "../TextHelper";

export class EmptyStructureConverterImpl extends LongTextConverterImpl {

    public canConvert(dosageStructure: DosageWrapper): boolean {
        return dosageStructure.isStructured()
            && dosageStructure.structures.getStructures()
            && dosageStructure.structures.getStructures().length === 1
            && dosageStructure.structures.getStructures()[0].getDays().length === 0;
    }

    public doConvert(dosageStructure: DosageWrapper): string {

        let s = "Doseringsforløbet starter " + this.datesToLongText(dosageStructure.structures.getStructures()[0].getStartDateOrDateTime());
        if (dosageStructure.structures.getStructures()[0].getEndDateOrDateTime()) {
            s += " og ophører " + this.datesToLongText(dosageStructure.structures.getStructures()[0].getEndDateOrDateTime());
        }

        s += ":\n" + TextHelper.INDENT + "Bemærk: skal ikke anvendes i denne periode!\n";

        return s;
    }

}
