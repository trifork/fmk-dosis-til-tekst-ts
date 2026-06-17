import { DayType, DosageV2, DosageChoice, DosagePeriodType, DoseType, PartOfDayDosage, TimeOfDay, TimesPerDayDosage, Weekday, WeekdayLabel, WeekType } from "../dosagerenderer/Dosage";
import { DateOnly, Day, Dosage as OldDosage, Dose as OldDose, Structure } from "../dto/Dosage";
import { DateOrDateTimeHelper } from "./DateOrDateTimeHelper";


export class OldToNewDosageConverter {
    static WEEKDAYS: WeekdayLabel[] = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
    ];

    static WEEKDAYS_TO_INDEX: Record<WeekdayLabel, number> =
        Object.fromEntries(this.WEEKDAYS.map((day, index) => [day, index])) as Record<WeekdayLabel, number>;

    convertDosage(oldDosage: OldDosage): DosageV2 {
        const dosage: DosageV2 = {
        };

        const oldUnitOrUnits = oldDosage.structures?.unitOrUnits;
        if (oldUnitOrUnits) {
            if (oldUnitOrUnits.unitPlural && oldUnitOrUnits.unitSingular) {
                dosage.UnitTexts = {
                    Singular: oldUnitOrUnits.unitSingular,
                    Plural: oldUnitOrUnits.unitPlural
                };
            } else {
                dosage.UnitText = oldUnitOrUnits.unit;
            }
        }

        if (oldDosage.administrationAccordingToSchema) {
            dosage.AdministrationAccordingToSchemaInLocalSystem = {
                StartDate: oldDosage.administrationAccordingToSchema.startDate
            };
            if (oldDosage.administrationAccordingToSchema.endDate) {
                dosage.AdministrationAccordingToSchemaInLocalSystem.EndDate = oldDosage.administrationAccordingToSchema.endDate;
            } else {
                dosage.AdministrationAccordingToSchemaInLocalSystem.DosageEndingUndetermined = true;
            }
        } else if (oldDosage.freeText) {
            dosage.FreeText = {
                StartDate: oldDosage.freeText.startDate,
                Text: oldDosage.freeText.text
            };
            if (oldDosage.freeText.endDate) {
                dosage.FreeText.EndDate = oldDosage.freeText.endDate;
            } else {
                dosage.FreeText.DosageEndingUndetermined = true;
            }
        } else if (oldDosage.structures) {
            const oldStructures = oldDosage.structures;
            dosage.DosagePeriod = oldStructures.structures.map(p => this.convertPeriod(p));
        }
        // Type?: PredefinedDosageTypeEnum;   // Skal ikke renderes, men er det en støtte til rendering?

        return dosage;
    }

    convertPeriod(structure: Structure): DosagePeriodType {
        const period: DosagePeriodType = {};

        if (structure.startDate && structure.endDate) {
            period.PeriodLength = DateOrDateTimeHelper.daysBetween(structure.startDate, structure.endDate);
        }

        if (structure.startDate && structure.iterationInterval > 0 && structure.iterationInterval % 7 === 0) {
            // Weekly
            const numWeeks = structure.iterationInterval / 7;
            const fixedWeeks: WeekType[] = [];
            const prnWeeks: WeekType[] = [];

            for (let weekNo = 0; weekNo < numWeeks; weekNo++) {
                const minDayInWeek = weekNo * 7;
                const maxDayInWeek = (weekNo + 1) * 7;

                const fixedWeekDays = structure.days
                    .filter(d => d.dayNumber > minDayInWeek && d.dayNumber < maxDayInWeek)
                    .map(d => this.convertWeekDay(d, structure.startDate, false))
                    .filter(d => !!d)
                    .sort((d1, d2) => OldToNewDosageConverter.WEEKDAYS_TO_INDEX[d1.Label] - OldToNewDosageConverter.WEEKDAYS_TO_INDEX[d2.Label]);

                const prnWeekDays = structure.days
                    .filter(d => d.dayNumber > minDayInWeek && d.dayNumber < maxDayInWeek)
                    .map(d => this.convertWeekDay(d, structure.startDate, true))
                    .filter(d => !!d)
                    .sort((d1, d2) => OldToNewDosageConverter.WEEKDAYS_TO_INDEX[d1.Label] - OldToNewDosageConverter.WEEKDAYS_TO_INDEX[d2.Label]);

                fixedWeeks.push({
                    Weekday: fixedWeekDays
                });

                prnWeeks.push({
                    Weekday: prnWeekDays
                });
            }

            if (fixedWeeks.find(week => week.Weekday.length > 0)) {
                period.Fixed = {
                    IterationInterval: structure.iterationInterval / 7,
                    Week: fixedWeeks
                }
            }

            if (prnWeeks.find(week => week.Weekday.length > 0)) {
                period.PRN = {
                    IterationInterval: structure.iterationInterval / 7,
                    Week: prnWeeks
                }
            }

        } else {
            const fixedDays = structure.days
                .map(d => this.convertDay(d, false))
                .filter(d => !!d);

            const prnDays = structure.days
                .map(d => this.convertDay(d, true))
                .filter(d => !!d);

            if (fixedDays.length > 0) {
                period.Fixed = {
                    IterationInterval: structure.iterationInterval,
                    Day: fixedDays
                };
            }

            if (prnDays.length > 0) {
                period.PRN = {
                    IterationInterval: structure.iterationInterval,
                    Day: prnDays
                };
            }
        }

        if (!period.Fixed && !period.PRN) {
            period.Empty = true;
        }

        if (structure.supplText) {
            if (period.Fixed) {
                period.Fixed.Instruction = structure.supplText;
            }

            if (period.PRN) {
                period.PRN.Instruction = structure.supplText;
            }
        }

        return period;
    }

    convertWeekDay(d: Day, startDate: DateOnly, pn: boolean): Weekday {
        const dosageChoice = this.convertDosageChoice(d, pn);

        if (dosageChoice) {
            return {
                Label: this.dateAndIndexToWeekDayLabel(startDate, d.dayNumber),
                Dosage: dosageChoice
            };
        }
    }

    dateAndIndexToWeekDayLabel(startDate: DateOnly, dayNumber: number): WeekdayLabel {
        // Note: Javascript Date.getDay() handles sunday as day 0
        const dayOffset = new Date(startDate).getDay() - 1;
        const dayIndex = (dayNumber - 1 + dayOffset) % 7;

        return OldToNewDosageConverter.WEEKDAYS[dayIndex];
    }

    convertDay(oldDay: Day, pn: boolean): DayType {
        const dosageChoice: DosageChoice = this.convertDosageChoice(oldDay, pn);

        if (dosageChoice) {
            return {
                Index: oldDay.dayNumber,
                Dosage: dosageChoice
            }
        }
    }

    convertDosageChoice(oldDay: Day, pn: boolean): DosageChoice {
        const dosageChoice: DosageChoice = {
        };

        const morningDose: DoseType = this.getPartOfDayDose(oldDay.allDoses, pn, "MorningDoseWrapper");
        const noonDose: DoseType = this.getPartOfDayDose(oldDay.allDoses, pn, "NoonDoseWrapper");
        const eveningDose: DoseType = this.getPartOfDayDose(oldDay.allDoses, pn, "EveningDoseWrapper");
        const nightDose: DoseType = this.getPartOfDayDose(oldDay.allDoses, pn, "NightDoseWrapper");

        if (morningDose || noonDose || eveningDose || nightDose) {
            const partOfDayDosage: PartOfDayDosage = {
            };

            if (morningDose) {
                partOfDayDosage.Morning = morningDose;
            }
            if (noonDose) {
                partOfDayDosage.Noon = noonDose;
            }
            if (eveningDose) {
                partOfDayDosage.Evening = eveningDose;
            }
            if (nightDose) {
                partOfDayDosage.Night = nightDose;
            }
            dosageChoice.PartOfDayDosage = partOfDayDosage;
        }

        if (oldDay.allDoses.find(dose => dose.isAccordingToNeed === pn && "PlainDoseWrapper" === dose.type)) {
            const dose = this.convertDose(oldDay.allDoses.find(dose => dose.isAccordingToNeed === pn && "PlainDoseWrapper" === dose.type)) as TimesPerDayDosage;
            dose.TimesPerDay = oldDay.allDoses.filter(dose => dose.isAccordingToNeed === pn && "PlainDoseWrapper" === dose.type).length

            dosageChoice.TimesPerDayDosage = dose;
        }

        if (oldDay.allDoses.find(dose => dose.isAccordingToNeed === pn && "TimedDoseWrapper" === dose.type)) {
            const timeOfDayDoses = oldDay.allDoses.filter(dose => dose.isAccordingToNeed === pn && "TimedDoseWrapper" === dose.type).map(dose => this.convertTimeOfDayDose(dose));

            dosageChoice.TimeOfDayDosage = timeOfDayDoses;
        }

        if (Object.keys(dosageChoice).length > 0) {
            return dosageChoice;
        }

    }

    getPartOfDayDose(oldDoses: OldDose[], isAccordingToNeed: boolean, doseType: string) {
        return oldDoses.filter(dose => dose.isAccordingToNeed == isAccordingToNeed && doseType === dose.type).map(dose => this.convertDose(dose))[0];
    }

    convertDose(oldDose: OldDose): DoseType {
        const dose: DoseType = {};

        if (oldDose.doseQuantity != null) {
            dose.Quantity = oldDose.doseQuantity;
        }

        if (oldDose.minimalDoseQuantity != null) {
            dose.MinimumQuantity = oldDose.minimalDoseQuantity;
        }

        if (oldDose.maximalDoseQuantity != null) {
            dose.MaximumQuantity = oldDose.maximalDoseQuantity;
        }

        if (oldDose.time) {
            (dose as TimeOfDay).Time = oldDose.time;
        }

        return dose;

    }

    convertTimeOfDayDose(oldDose: OldDose): TimeOfDay {
        const dose = this.convertDose(oldDose) as TimeOfDay;
        dose.Time = oldDose.time;

        return dose;
    }

}

