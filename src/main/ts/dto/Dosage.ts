

export interface Dosage {
    administrationAccordingToSchema?: AdministrationAccordingToSchema;
    freeText?: FreeText;
    structures?: Structures;
    // structured: boolean;
}

export interface AdministrationAccordingToSchema {
    startDateOrDateTime: DateOrDateTime;
    endDateOrDateTime?: DateOrDateTime;
}

export interface FreeText {
    startDateOrDateTime: DateOrDateTime;
    endDateOrDateTime?: DateOrDateTime;
    text: string;
}

export interface Structures {
    startDateOrDateTime: DateOrDateTime;
    endDateOrDateTime?: DateOrDateTime;
    unitOrUnits: UnitOrUnits;
    structures: Structure[];
    isPartOfMultiPeriodDosage: boolean;
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
    iterationInterval: number;
    startDateOrDateTime: DateOrDateTime;
    endDateOrDateTime?: DateOrDateTime;
    days: Day[];
    dosagePeriodPostfix?: string;
    supplText?: string;
}

export interface DateOrDateTime extends DateOnly,  DateTime {

}

export interface DateOnly {
    date?: string;
}

export interface DateTime {
    /**
    * @deprecated datetimes are no longer used
    */
    dateTime?: string;
}

export interface Day {
    dayNumber: number;
    allDoses: Dose[];

}

export interface Dose {
    minimalDoseQuantity?: number;
    maximalDoseQuantity?: number;
    doseQuantity?: number;
    isAccordingToNeed: boolean;
    type: "MorningDoseWrapper" | "NoonDoseWrapper" | "EveningDoseWrapper" | "NightDoseWrapper" | "PlainDoseWrapper" | "TimedDoseWrapper";
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
    hour: number;
    minute: number;
    second: number;
}
