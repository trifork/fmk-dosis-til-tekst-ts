import { SimpleLongTextConverterImpl } from "./SimpleLongTextConverterImpl";
import { TextOptions } from "../TextOptions";
import { Dosage } from "../dto/Dosage";

export class FreeTextConverterImpl extends SimpleLongTextConverterImpl {

    public getConverterClassName(): string {
        return "FreeTextConverterImpl";
    }

    public canConvert(dosage: Dosage, options: TextOptions): boolean {
        return dosage.freeText !== undefined && dosage.freeText !== null;
    }

    public doConvert(dosage: Dosage, options: TextOptions, currentTime: Date): string {
        return this.convert("\"" + dosage.freeText.text + "\"",
            dosage.freeText.startDateOrDateTime,
            dosage.freeText.endDateOrDateTime, options);
    }
}
