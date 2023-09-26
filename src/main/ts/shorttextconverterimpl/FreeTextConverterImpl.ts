import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";

export class FreeTextConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "FreeTextConverterImpl";
    }

    public canConvert(dosage: DosageWrapper): boolean {
        return dosage.freeText !== undefined;
    }

    public doConvert(dosage: DosageWrapper): string {
        return dosage.freeText.getText();
    }
}
