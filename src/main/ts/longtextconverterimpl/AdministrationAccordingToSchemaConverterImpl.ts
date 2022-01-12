import { TextOptions } from "../TextOptions";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { SimpleLongTextConverterImpl } from "./SimpleLongTextConverterImpl";

export class AdministrationAccordingToSchemaConverterImpl extends SimpleLongTextConverterImpl {

    public canConvert(dosage: DosageWrapper, options: TextOptions): boolean {
        return dosage.isAdministrationAccordingToSchema();
    }

    public doConvert(dosage: DosageWrapper, options: TextOptions, currentTime: Date): string {
        return this.convert("Dosering efter skriftlig anvisning",
            dosage.administrationAccordingToSchema.getStartDateOrDateTime(), dosage.administrationAccordingToSchema.getEndDateOrDateTime(), options);
    }
}
