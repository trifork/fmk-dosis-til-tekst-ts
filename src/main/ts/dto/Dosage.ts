

export interface Dosage {
    administrationAccordingToSchema?: AdministrationAccordingToSchema;
    freeText?: FreeText;
    structures?: Structures;
}

export interface AdministrationAccordingToSchema {
    startDate: DateOnly;
    endDate?: DateOnly;
}

export interface FreeText {
    startDate: DateOnly;
    endDate?: DateOnly;
    text: string;
}

export interface Structures {
    startDate: DateOnly;
    endDate?: DateOnly;
    unitOrUnits: UnitOrUnits;
    structures: Structure[];
    isPartOfMultiPeriodDosage?: boolean;
}

export interface UnitOrUnits extends Unit, Units {

}

export interface Unit {
    unit?: string;
}

export interface Units {
    unitSingular?: string;
    unitPlural?: string;
}

export interface Structure {
    /**
      * @isInt iterationInterval must be specified in whole days
      * @minimum 0
      */
    iterationInterval: number;
    startDate: DateOnly;
    endDate?: DateOnly;
    days: Day[];
    dosagePeriodPostfix?: string;
    supplText?: string;
}

/**
 * @format date
 * @isDate must be a valid date
 */
export type DateOnly = string;

export interface DateTime {
    /**
     * @format date-time
     * @isDateTime must be a valid datetime
     * @deprecated datetimes are no longer used
     */
    dateTime?: string;
}

export interface Day {
    /**
     * @isInt dayNumber must be an integer value
     * @minimum 0
     */
    dayNumber: number;
    allDoses: Dose[];

}

export interface Dose {
    minimalDoseQuantity?: number;
    maximalDoseQuantity?: number;
    doseQuantity?: number;
    isAccordingToNeed: boolean;
    type: "MorningDoseWrapper" | "NoonDoseWrapper" | "EveningDoseWrapper" | "NightDoseWrapper" | "PlainDoseWrapper" | "TimedDoseWrapper";
    // The time property logically belongs only in TimedDose, but insisting on that means we have to declare Day.allDoses as a type union
    // of all Dose interfaces => AnyOf in the openapi spec => complicated client side mappings + we break compatibility with earlier
    // versions of the d2t service.
    // As a pragmatic workaround, we declare time as an optional property here..
    time?: LocalTime;
}

export interface MorningDose extends Dose {
    type: "MorningDoseWrapper";
}

export interface NoonDose extends Dose {
    type: "NoonDoseWrapper";
}

export interface EveningDose extends Dose {
    type: "EveningDoseWrapper";
}

export interface NightDose extends Dose {
    type: "NightDoseWrapper";
}

export interface PlainDose extends Dose {
    type: "PlainDoseWrapper";
}

export interface TimedDose extends Dose {
    type: "TimedDoseWrapper";
    time: LocalTime;
}

export interface LocalTime {
    /**
     * @isInt hour must be an integer value
     * @minimum 0
     * @maximum 23
     */
    hour: number;
    /**
     * @isInt minute must be an integer value
     * @minimum 0
     * @maximum 59
     */
    minute: number;
    /**
     * @isInt second must be an integer value
     * @minimum 0
     * @maximum 59
     */
    second?: number;
}
