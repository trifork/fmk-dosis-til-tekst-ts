import { SimpleLongTextConverterImpl } from "./SimpleLongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";

export class FreeTextConverterImpl extends SimpleLongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        return dosage.freeText !== undefined && dosage.freeText !== null;
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.freeText.getText(),
            dosage.freeText.getStartDateOrDateTime(),
            dosage.freeText.getEndDateOrDateTime());
    }
}
