import { Dosage } from "../dto/Dosage";
import { ShortTextConverterImpl } from "./ShortTextConverterImpl";

export class AdministrationAccordingToSchemaConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "AdministrationAccordingToSchemaConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        return !!dosage.administrationAccordingToSchema;
    }

    public doConvert(dosage: Dosage): string {
        return "Dosering efter skriftlig anvisning";
    }
}