import { DosisTilTekstException } from "../DosisTilTekstException";
import { Day, Dose, Structure } from "../dto/Dosage";
import { DateOrDateTimeHelper } from "./DateOrDateTimeHelper";
import { DayHelper } from "./DayHelper";
import { DoseHelper } from "./DoseHelper";

export class StructureHelper {

    public static startsAndEndsSameDay(structuredDosage: Structure): boolean {
        if (structuredDosage.startDate && structuredDosage.endDate) {
            const startDate = DateOrDateTimeHelper.getDate(structuredDosage.startDate);
            const endDate = DateOrDateTimeHelper.getDate(structuredDosage.endDate);

            return startDate && endDate
                && startDate.getFullYear() === endDate.getFullYear()
                && startDate.getMonth() === endDate.getMonth()
                && startDate.getDate() === endDate.getDate();
        }
        else {
            return false;
        }
    }

    // public static getDays() {
    //     return this.days;
    // }

    // public static setDays(days: Day[]) {
    //     if (days) {
    //         this.days = days.sort((d1, d2) => d1.dayNumber - d2.dayNumber);
    //     }
    //     else {
    //         throw new DosisTilTekstException("StructureWrapper: days must be set in StructureWrapper");
    //     }
    // }

    public static getDay(structuredDosage: Structure, dayNumber: number): Day {
        for (const day of structuredDosage.days)
            if (day.dayNumber === dayNumber)
                return day;
        return undefined;
    }

    public static sameDayOfWeek(structuredDosage: Structure): boolean {
        if (structuredDosage.days.length === 1) {
            return false;
        }

        let remainder = -1;
        for (const day of structuredDosage.days) {
            const r = day.dayNumber % 7;
            if (remainder >= 0 && remainder !== r)
                return false;
            remainder = r;
        }
        return true;
    }

    public static allDaysAreTheSame(structuredDosage: Structure): boolean {
        let areAllDaysTheSame = true;
        let day0: Day;
        for (const day of structuredDosage.days) {
            if (day0) {
                if (day0.allDoses?.length !== day.allDoses?.length) {
                    areAllDaysTheSame = false;
                    break;
                } else {
                    for (let d = 0; d < day0.allDoses?.length; d++) {
                        if (!DoseHelper.theSameAs(day0.allDoses[d], day.allDoses[d])) {
                            areAllDaysTheSame = false;
                            break;
                        }
                    }
                }
            }
            else {
                day0 = day;
            }
        }
        return areAllDaysTheSame;
    }

    public static daysAreInUninteruptedSequenceFromOne(structuredDosage: Structure): boolean {
        let dayNumber = 1;
        for (const day of structuredDosage.days) {
            if (day.dayNumber !== dayNumber)
                return false;
            dayNumber++;
        }
        return true;
    }

    /**
     * Compares dosage quantities and the dosages label (the type of the dosage)
     * @return true if all dosages are of the same type and has the same quantity
     */
    public static allDosesAreTheSame(structuredDosage: Structure): boolean {
        let areAllDosesTheSame = true;
        let dose0: Dose;
        for (const day of structuredDosage.days) {
            for (const dose of day.allDoses) {
                if (!dose0) {
                    dose0 = dose;
                } else if (!DoseHelper.theSameAs(dose0, dose)) {
                    areAllDosesTheSame = false;
                    break;
                }
            }
        }

        return areAllDosesTheSame;
    }

    public static containsMorningNoonEveningNightDoses(structuredDosage: Structure): boolean {
        return structuredDosage.days.some(day => day.allDoses.some(dose => dose.type === "MorningDoseWrapper" || dose.type === "NoonDoseWrapper" || dose.type === "EveningDoseWrapper" || dose.type === "NightDoseWrapper"));
    }

    public static containsPlainDose(structuredDosage: Structure): boolean {
        return structuredDosage.days.some(day => day.allDoses.some(dose => dose.type === "PlainDoseWrapper"));
    }

    public static containsTimedDose(structuredDosage: Structure): boolean {
        return structuredDosage.days.some(day => day.allDoses.some(dose => dose.type === "TimedDoseWrapper"));
    }

    public static containsAccordingToNeedDosesOnly(structuredDosage: Structure): boolean {
        return structuredDosage.days.length > 0 && structuredDosage.days.every(day => day.allDoses.every(dose => dose.isAccordingToNeed));
    }

    public static containsAccordingToNeedDose(structuredDosage: Structure): boolean {
        return structuredDosage.days.some(day => day.allDoses.some(dose => dose.isAccordingToNeed));
    }

    public static containsEmptyDosagesOnly(structuredDosage: Structure): boolean {
        return structuredDosage.days.every(day => !day.allDoses || day.allDoses.every(dose => dose.doseQuantity === 0));
    }

    public static getSumOfDoses(structuredDosage: Structure): { minimum: number, maximum: number } {
        let minimum = 0;
        let maximum = 0;

        for (const day of structuredDosage.days) {
            for (const dose of day.allDoses) {
                if (typeof dose.doseQuantity === "number") {
                    minimum += dose.doseQuantity;
                    maximum += dose.doseQuantity;
                } else if (typeof dose.minimalDoseQuantity === "number" && typeof dose.maximalDoseQuantity === "number") {
                    minimum += dose.minimalDoseQuantity;
                    maximum += dose.maximalDoseQuantity;
                } else {
                    throw new DosisTilTekstException("DoseQuantity eller minimalDoseQuantity+MaximalDoseQuantity skal være sat");
                }
            }
        }

        return { minimum, maximum };
    }

    public static isIterationToLong(structuredDosage: Structure): boolean {
        const start = DateOrDateTimeHelper.getDate(structuredDosage.startDate);
        const end = DateOrDateTimeHelper.getDate(structuredDosage.endDate);

        if (!end || !start) {
            return false;
        }
        const totalDays = Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1;
        const iterationInterval = structuredDosage.iterationInterval;
        return totalDays < iterationInterval;
    }

    public static isEmpty(structuredDosage: Structure): boolean {
        return structuredDosage.days.length === 0;
    }

    // PN dosage without limit: not iterated PN only with one dosage element means take as many as you want per day
    public static isPNWithoutLimit(structuredDosage: Structure): boolean {
        return (structuredDosage.iterationInterval === 0 || StructureHelper.isIterationToLong(structuredDosage))
            && StructureHelper.containsAccordingToNeedDosesOnly(structuredDosage)
            && structuredDosage.days[0].dayNumber <= 1
            && DayHelper.getNumberOfAccordingToNeedDoses(structuredDosage.days[0]) === 1
            && structuredDosage.days[0].allDoses.length === 1
            && DayHelper.getNumberOfPlainDoses(structuredDosage.days[0]) === 1;
    }

    public static trimLeadingCommas(s: string) {
        return s?.replace(/^, */, "") || undefined;
    }
}