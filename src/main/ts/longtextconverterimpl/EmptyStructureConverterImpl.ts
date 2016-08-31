import {LongTextConverterImpl} from "./LongTextConverterImpl";
import {DosageWrapper} from "../vowrapper/DosageWrapper";
import {TextHelper} from "../TextHelper";

export class EmptyStructureConverterImpl extends LongTextConverterImpl {

    public canConvert(dosageStructure: DosageWrapper): boolean {
        return dosageStructure.isStructured()
            && dosageStructure.structures.structures
            && dosageStructure.structures.structures.length === 1
            && dosageStructure.structures.structures[0].days.length === 0;
    }

    public doConvert(dosageStructure: DosageWrapper): string {

        let s = "Doseringsforløbet starter " + this.datesToLongText(dosageStructure.structures.structures[0].startDateOrDateTime);
        if (dosageStructure.structures.structures[0].endDateOrDateTime) {
            s += " og ophører " + this.datesToLongText(dosageStructure.structures.structures[0].endDateOrDateTime);
        }

        s += ":\n" + TextHelper.INDENT + "Bemærk: skal ikke anvendes i denne periode!\n";

        return s;
    }

}