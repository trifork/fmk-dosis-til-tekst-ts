import { SimpleLongTextConverterImpl } from "./SimpleLongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { TextOptions } from "../TextOptions";

export class FreeTextConverterImpl extends SimpleLongTextConverterImpl {

    public getConverterClassName(): string {
        return "FreeTextConverterImpl";
    }

    public canConvert(dosage: DosageWrapper, options: TextOptions): boolean {
        return dosage.freeText !== undefined && dosage.freeText !== null;
    }

    public doConvert(dosage: DosageWrapper, options: TextOptions, currentTime: Date): string {
        return this.convert("\"" + dosage.freeText.getText() + "\"",
            dosage.freeText.getStartDateOrDateTime(),
            dosage.freeText.getEndDateOrDateTime(), options);
    }
}
