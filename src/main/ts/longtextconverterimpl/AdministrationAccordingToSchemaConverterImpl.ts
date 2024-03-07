import { TextOptions } from "../TextOptions";
import { Dosage } from "../dto/Dosage";
import { SimpleLongTextConverterImpl } from "./SimpleLongTextConverterImpl";

export class AdministrationAccordingToSchemaConverterImpl extends SimpleLongTextConverterImpl {

    public getConverterClassName(): string {
        return "AdministrationAccordingToSchemaConverterImpl";
    }

    public canConvert(dosage: Dosage, options: TextOptions): boolean {
        return !!dosage.administrationAccordingToSchema;
    }

    public doConvert(dosage: Dosage, options: TextOptions, currentTime: Date): string {
        return this.convert("Dosering efter skriftlig anvisning",
            dosage.administrationAccordingToSchema.startDateOrDateTime, dosage.administrationAccordingToSchema.endDateOrDateTime, options);
    }
}
