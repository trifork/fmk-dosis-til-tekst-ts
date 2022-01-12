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

    public canConvert(dosageStructure: DosageWrapper, options: TextOptions): boolean {
        if (dosageStructure.structures) {
            return dosageStructure.structures.getStructures().length > 1;
        }

        return false;
    }

    public doConvert(dosage: DosageWrapper, options: TextOptions, currentTime: Date): string {

        let s: string = "";
        let sortedStructures = dosage.structures.getStructures().sort(StructuresWrapper.dosagePeriodSorter);

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s = "<div class=\"d2t-vkadosagetext\">\n";
        }

        sortedStructures.forEach(structure => {
            let w: DosageWrapper = DosageWrapper.makeStructuredDosage(
                new StructuresWrapper(dosage.structures.getUnitOrUnits(),
                    dosage.structures.getStartDateOrDateTime(),
                    dosage.structures.getEndDateOrDateTime(),
                    [structure],
                    sortedStructures.length > 1));
            s += (this.longTextConverter.convertWrapper(w, options) + "\n");
            if (options !== TextOptions.VKA_WITH_MARKUP) {
                s += "\n";
            }
        });

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "</div>";
        }

        return s.trim();
    }
}
