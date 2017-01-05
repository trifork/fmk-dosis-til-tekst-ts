import { LongTextConverter } from "../LongTextConverter";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { Factory } from "../Factory";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { StructuresWrapper } from "../vowrapper/StructuresWrapper";

export class DefaultMultiPeriodeLongTextConverterImpl extends LongTextConverterImpl {

    longTextConverter: LongTextConverter;

    public constructor(longTextConverter: LongTextConverter) {
        super();
        this.longTextConverter = longTextConverter;
    }

    public canConvert(dosageStructure: DosageWrapper): boolean {
        if (dosageStructure.structures) {
            return dosageStructure.structures.getStructures().length > 1;
        }

        return false;
    }

    public doConvert(dosage: DosageWrapper): string {
        let s = "Doseringen indeholder flere perioder";
        if (dosage.structures.hasOverlappingPeriodes()) {
            s += ", bemærk at der er overlappende perioder";
        }
        s += ":\n\n";

        dosage.structures.getStructures().forEach(structure => {
            let w: DosageWrapper = DosageWrapper.makeStructuredDosage(
                new StructuresWrapper(dosage.structures.getUnitOrUnits(), [structure]));
            s += (this.longTextConverter.convertWrapper(w) + "\n\n");
        });

        return s.trim();
    }
}
