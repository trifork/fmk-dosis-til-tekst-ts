import { LongTextConverter } from "../LongTextConverter";
import { TextOptions } from "../TextOptions";
import { Dosage } from "../dto/Dosage";
import StructuresHelper from "../helpers/StructuresHelper";
import { LongTextConverterImpl } from "./LongTextConverterImpl";

export class DefaultMultiPeriodeLongTextConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "DefaultMultiPeriodeLongTextConverterImpl";
    }

    longTextConverter: LongTextConverter;

    public constructor(longTextConverter: LongTextConverter) {
        super();
        this.longTextConverter = longTextConverter;
    }

    public canConvert(dosageStructure: Dosage, options: TextOptions): boolean {
        if (dosageStructure.structures) {
            return dosageStructure.structures.structures.length > 1;
        }

        return false;
    }

    public doConvert(dosage: Dosage, options: TextOptions, currentTime: Date): string {

        let s: string = "";
        let sortedStructures = dosage.structures.structures.sort(StructuresHelper.dosagePeriodSorter);

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s = "<div class=\"d2t-vkadosagetext\">\n";
        }

        sortedStructures.forEach(structure => {
            const w: Dosage = {
                structures: {
                    startDateOrDateTime: dosage.structures.startDateOrDateTime,
                    endDateOrDateTime: dosage.structures.endDateOrDateTime,
                    unitOrUnits: dosage.structures.unitOrUnits,
                    structures: [structure],
                    isPartOfMultiPeriodDosage: sortedStructures.length > 1
                }
            };
            
            s += (this.longTextConverter.convert(w, options) + "\n");
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
