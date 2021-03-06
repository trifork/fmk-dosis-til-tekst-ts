import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { SimpleLongTextConverterImpl } from "./SimpleLongTextConverterImpl";

export class AdministrationAccordingToSchemaConverterImpl extends SimpleLongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        return dosage.isAdministrationAccordingToSchema();
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert("Dosering efter skriftlig anvisning",
            dosage.administrationAccordingToSchema.getStartDateOrDateTime(), dosage.administrationAccordingToSchema.getEndDateOrDateTime());
    }
}
