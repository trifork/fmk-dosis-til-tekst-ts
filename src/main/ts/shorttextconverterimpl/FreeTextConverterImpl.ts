import { Dosage } from "../dto/Dosage";
import { ShortTextConverterImpl } from "./ShortTextConverterImpl";

export class FreeTextConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "FreeTextConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        return !!dosage.freeText;
    }

    public doConvert(dosage: Dosage): string {
        return dosage.freeText.text;
    }
}
