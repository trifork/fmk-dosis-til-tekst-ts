import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { LongTextConverter } from "../LongTextConverter";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { StructuresWrapper } from "../vowrapper/StructuresWrapper";

export class DefaultMultiPeriodeLongTextConverterImpl extends LongTextConverterImpl {

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
            s += (LongTextConverter.getInstance().convertWrapper(w) + "\n\n");
        });

        return s.trim();
    }
}
