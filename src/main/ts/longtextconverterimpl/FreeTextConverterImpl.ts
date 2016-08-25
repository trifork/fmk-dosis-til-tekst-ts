import { SimpleLongTextConverterImpl } from "./SimpleLongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";

export class FreeTextConverterImpl extends SimpleLongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        return dosage.freeText !== undefined && dosage.freeText !== null;
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.freeText.text,
            dosage.freeText.startDateOrDateTime,
            dosage.freeText.endDateOrDateTime);
    }
}
