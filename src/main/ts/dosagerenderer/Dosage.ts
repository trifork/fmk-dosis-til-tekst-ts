import { DateOnly, LocalTime } from "../dto/Dosage";

export interface DosageV2 {
    IsSelfAdministration?: boolean;
    Precondition?: Precondition;
    UnitText?: string;
    UnitTexts?: DoseUnitTexts;
    Parameter?: DosageParameter[];
    DosagePeriod?: DosagePeriodType[];
    FreeText?: DosageFreeText;
    AdministrationAccordingToSchemaInLocalSystem?: AdministrationAccordingToSchemaInLocalSystem;
    Type?: PredefinedDosageTypeEnum;   // Skal ikke renderes, men er det en støtte til rendering?
}

export interface Precondition {
    ValidFrom?: DateOnly;
    UpdateValidFromUponHandover?: boolean;
    PRNTrigger?: string;
    EpisodicTreatment?: EpisodicTreatment;
}

export interface DosageParameter {
    ParameterName: string;
    ParameterLabel?: string;
    ParameterUnit?: string;
    ParameterSchema: DosageParameterSchema;
}

export interface DosageFreeText {
    StartDate?: DateOnly;
    EndDate?: DateOnly;
    DosageEndingUndetermined?: boolean;
    Text: string;
}

export interface AdministrationAccordingToSchemaInLocalSystem {
    StartDate?: DateOnly;
    EndDate?: DateOnly;
    DosageEndingUndetermined?: boolean;
}

export type PredefinedDosageTypeEnum =
    "Fixed"
    | "PRN"
    | "Combined";

export interface EpisodicTreatment {
    Trigger: string;
    /**
      * @isInt MinimumDaysBetweenEpisodes must be specified in whole days
      * @minimum 0
      */
    MinimumDaysBetweenEpisodes?: number;
}

export interface DosageParameterSchema {
    ParametricQuantity: DosageParametricQuantity[];
}

export interface DosagePeriodType {
    // One-of PeriodLength, PeriodLengthFreeText
    /**
      * @isInt PeriodLength must be specified in whole days
      * @minimum 1
      */
    PeriodLength?: number;
    PeriodLengthFreeText?: string;
    // One-of Empty, Unspecified, [Fixed, PRN]
    Empty?: boolean;
    Unspecified?: boolean;
    Fixed?: DosageStructure;
    PRN?: DosageStructure;
}

export interface DosageStructure {
    Restriction?: DosageRestriction;
    Instruction?: string;
    /**
      * @isInt IterationInterval must be specified in whole days
      * @minimum 0
      */
    IterationInterval?: number;
    Day?: DayType[];
    UnspecifiedDay?: DayUnspecified;
    Week?: WeekType[];
}

export interface DosageParametricQuantity {
    // One-of FromValue, Criterion
    FromValue?: number;
    Criterion?: string;

    // One-of Quantity, [MinimumQuantity, MaximumQuantity], Instruction
    Quantity?: number;
    MinimumQuantity?: number;
    MaximumQuantity?: number;
    Instruction?: string;
}

export interface DosageRestriction {
    MaximumDailyDose?: number;
    /**
      * @isInt MinimumDurationBetweenDoses must be specified in whole days
      * @minimum 0
      */
    MinimumDurationBetweenDoses?: number;
}

export interface DayType {
    /**
      * @isInt Index must be specified in whole days
      * @minimum 1
      */
    Index: number;
    Dosage: DosageChoice;
}

export interface DayUnspecified {
    Dosage: DosageChoice;
}

export interface WeekType {
    Weekday: Weekday[];
}

export interface DosageChoice {
    TimeOfDayDosage?: TimeOfDay[];
    PartOfDayDosage?: PartOfDayDosage;
    TimesPerDayDosage?: TimesPerDayDosage;
    UnlimitedDayDosage?: DoseType;
}

export interface Weekday {
    Label: WeekdayLabel;
    Dosage: DosageChoice;
}

export interface PartOfDayDosage {
    Morning?: DoseType;
    Noon?: DoseType;
    Evening?: DoseType;
    Night?: DoseType;
}

export interface TimesPerDayDosage extends DoseType {
    /**
      * @isInt TimesPerDay must be specified in whole days
      * @minimum 0
      */
    TimesPerDay: number;
}

export type WeekdayLabel =
    "Monday"
    | "Tuesday"
    | "Wednesday"
    | "Thursday"
    | "Friday"
    | "Saturday"
    | "Sunday";

export interface TimeOfDay extends DoseType {
    Time: LocalTime;
}

export interface DoseUnitTexts {
    Singular: string;
    Plural: string;
}

export interface DoseType {
    // One-of:  Quantity, [MinimumQuantity, MaximumQuantity], AccordingToParameterSchema, Infusion
    Quantity?: number;
    MinimumQuantity?: number;
    MaximumQuantity?: number;
    AccordingToParameterSchema?: string;
    Infusion?: InfusionDose;
}

export interface InfusionDose {
    Duration?: number;
    MinimumDuration?: number;
    MaximumDuration?: number;
    InfusionRate?: number;
    MinimumInfusionRate?: number;
    MaximumInfusionRate?: number;
}
