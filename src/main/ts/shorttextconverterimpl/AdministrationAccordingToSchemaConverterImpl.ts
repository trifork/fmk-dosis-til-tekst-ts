import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";

export class AdministrationAccordingToSchemaConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        return dosage.isAdministrationAccordingToSchema();
    }

    public doConvert(dosage: DosageWrapper): string {
        return "Dosering efter skriftlig anvisning";
    }
}