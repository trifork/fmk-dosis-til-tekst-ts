import { AdministrationAccordingToSchemaWrapper } from "./AdministrationAccordingToSchemaWrapper";
import { FreeTextWrapper } from "./FreeTextWrapper";
import { DayWrapper } from "./DayWrapper";
import { StructuresWrapper } from "./StructuresWrapper";
import { Validator } from "../Validator";

export class DosageWrapper {

    // Wrapped values
    public administrationAccordingToSchema: AdministrationAccordingToSchemaWrapper;
    public freeText: FreeTextWrapper;
    public structures: StructuresWrapper;

    public static fromJsonObject(jsonObject: any): DosageWrapper {
        return new DosageWrapper(AdministrationAccordingToSchemaWrapper.fromJsonObject(jsonObject.administrationAccordingToSchema),
            FreeTextWrapper.fromJsonObject(jsonObject.freeText),
            StructuresWrapper.fromJsonObject(jsonObject.structures));
    }

    public static makeStructuredDosage(structures: StructuresWrapper): DosageWrapper {
        return new DosageWrapper(undefined, undefined, structures);
    }

    public static makeFreeTextDosage(freeText: FreeTextWrapper): DosageWrapper {
        return new DosageWrapper(undefined, freeText, undefined);
    }

    public static makeAccordingToSchemaDosage(administrationAccordingToSchema: AdministrationAccordingToSchemaWrapper): DosageWrapper {
        return new DosageWrapper(administrationAccordingToSchema, undefined, undefined);
    }

    constructor(administrationAccordingToSchema: AdministrationAccordingToSchemaWrapper, freeText: FreeTextWrapper, structures: StructuresWrapper) {
        this.administrationAccordingToSchema = administrationAccordingToSchema;
        this.freeText = freeText;
        this.structures = structures;
        Validator.validate(this);
    }

    /**
     * @return Returns true if the dosage is "according to schema..."
     */
    public isAdministrationAccordingToSchema(): boolean {
        return !(this.administrationAccordingToSchema == null);
    }

    /**
     * @return Returns true if the dosage is a free text dosage
     */
    public isFreeText(): boolean {
        return this.freeText !== undefined && this.freeText !== null;
    }

    /**
     * @return Returns true if the dosage is structured
     */
    public isStructured(): boolean {
        return this.structures !== undefined && this.structures !== null;
    }

    /**
     * @return The free text dosage, or null if the dosage is not of this kind

    get freeText(): FreeTextWrapper {
        return this.freeText;
    }*/

    /**
     * @return "according to schema..." dosage

    get administrationAccordingToSchema(): AdministrationAccordingToSchemaWrapper {
        return this._administrationAccordingToSchema;
    }*/

    /**
     * @return A wrapped DosageTimes object containing a structured dosage, or null if the
     * dosage is not of this kind

    get structures(): StructuresWrapper {
        return this._structures;
    }
    */

}