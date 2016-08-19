import { AdministrationAccordingToSchemaWrapper } from './AdministrationAccordingToSchemaWrapper';
import { FreeTextWrapper } from './FreeTextWrapper';
import { DayWrapper } from './DayWrapper';
import { StructuresWrapper } from './StructuresWrapper';
import { Validator } from '../Validator';

export class DosageWrapper {

// Wrapped values
	private _administrationAccordingToSchema: AdministrationAccordingToSchemaWrapper ;
	private _freeText: FreeTextWrapper ;
	private _structures: StructuresWrapper ;
		
	public static  makeStructuredDosage(structures: StructuresWrapper ): DosageWrapper {
		return new DosageWrapper(null, null, structures);
	}

	public static  makeFreeTextDosage(freeText: FreeTextWrapper ): DosageWrapper {
		return new DosageWrapper(null, freeText, null);
	}

	public static makeAccordingToSchemaDosage(administrationAccordingToSchema: AdministrationAccordingToSchemaWrapper): DosageWrapper {
		return new DosageWrapper(administrationAccordingToSchema, null, null);
	}
	
	constructor(administrationAccordingToSchema: AdministrationAccordingToSchemaWrapper , freeText: FreeTextWrapper ,structures:  StructuresWrapper ) {
		this.administrationAccordingToSchema = administrationAccordingToSchema;
		this._freeText = freeText; 
		this.structures = structures;
		Validator.validate(this);
	}
	
	/**
	 * @return Returns true if the dosage is "according to schema..." 
	 */
	public isAdministrationAccordingToSchema(): boolean {
		return this.administrationAccordingToSchema != null;
	}
	
	/**
	 * @return Returns true if the dosage is a free text dosage
	 */
	public isFreeText(): boolean {
		return this.freeText!=null;
	}
	
	/**
	 * @return Returns true if the dosage is structured
	 */
	public isStructured(): boolean {
		return this.structures != null;
	}

	/**
	 * @return The free text dosage, or null if the dosage is not of this kind 
	 */
	get freeText(): FreeTextWrapper {
		return this.freeText;
	}
	
	/**
	 * @return "according to schema..." dosage
	 */
	get administrationAccordingToSchema(): AdministrationAccordingToSchemaWrapper {
		return this._administrationAccordingToSchema;
	}
	
	/**
	 * @return A wrapped DosageTimes object containing a structured dosage, or null if the 
	 * dosage is not of this kind 
	 */
	get structures(): StructuresWrapper {
		return this._structures;
	}
	

}