import { AdministrationAccordingToSchemaWrapper } from "./AdministrationAccordingToSchemaWrapper";
import { FreeTextWrapper } from "./FreeTextWrapper";
import { DayWrapper } from "./DayWrapper";
import { StructuresWrapper } from "./StructuresWrapper";
import { Validator } from "../Validator";
import { Dosage } from "../dto/Dosage";

export class DosageWrapper {

    readonly value: Dosage;

    public static makeStructure(structures: StructuresWrapper): DosageWrapper {
        return new DosageWrapper(undefined, undefined, structures);
    }

    public static makeFreeTextDosage(freeText: FreeTextWrapper): DosageWrapper {
        return new DosageWrapper(undefined, freeText, undefined);
    }

    public static makeAccordingToSchemaDosage(administrationAccordingToSchema: AdministrationAccordingToSchemaWrapper): DosageWrapper {
        return new DosageWrapper(administrationAccordingToSchema, undefined, undefined);
    }

    constructor(administrationAccordingToSchema: AdministrationAccordingToSchemaWrapper, freeText: FreeTextWrapper, structures: StructuresWrapper) {
        this.value = {};

        if (administrationAccordingToSchema) {
            this.value.administrationAccordingToSchema = administrationAccordingToSchema.value;
        } else if (freeText) {
            this.value.freeText = freeText.value;
        } else if (structures) {
            this.value.structures = structures.value;
        }
    }
}