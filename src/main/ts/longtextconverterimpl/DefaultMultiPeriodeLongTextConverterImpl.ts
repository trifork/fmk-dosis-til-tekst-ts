import { LongTextConverter } from "../LongTextConverter";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { Factory } from "../Factory";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { StructuresWrapper } from "../vowrapper/StructuresWrapper";
import { TextOptions } from "../TextOptions";

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

    public doConvert(dosage: DosageWrapper, options: TextOptions): string {

        let s: string = "";
        let sortedStructures = dosage.structures.getStructures().sort((s1, s2) => {

            // Sort by fixed/PN, and then by startdate
            if (s1.containsAccordingToNeedDosesOnly()) return 1;
            else if (s2.containsAccordingToNeedDosesOnly()) return -1;
            else return s1.getStartDateOrDateTime().getDateOrDateTime().getTime() - s2.getStartDateOrDateTime().getDateOrDateTime().getTime();
        });

        sortedStructures.forEach(structure => {
            let w: DosageWrapper = DosageWrapper.makeStructuredDosage(
                new StructuresWrapper(dosage.structures.getUnitOrUnits(),
                    dosage.structures.getStartDateOrDateTime(),
                    dosage.structures.getEndDateOrDateTime(),
                    [structure],
                    sortedStructures.length > 1));
            s += (this.longTextConverter.convertWrapper(w, options) + "\n\n");
        });

        return s.trim();
    }
}
