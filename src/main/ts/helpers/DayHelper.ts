import { Day, Dose } from "../dto/Dosage";
import { DoseHelper } from "./DoseHelper";

export class DayHelper {

    public static isAnyDay(day: Day) {
        return day.dayNumber === 0;
    }

    public static getNumberOfDoses(day: Day) {
        return day.allDoses.length;
    }

    public static getDose(day: Day, index: number): Dose {
        return day.allDoses[index];
    }


    public static getNumberOfAccordingToNeedDoses(day: Day) {
        return DayHelper.getAccordingToNeedDoses(day).length;
    }

    public static getAccordingToNeedDoses(day: Day): Array<Dose> {
        // Since the 2012/06/01 namespace "according to need" is just a flag
        return day.allDoses.filter(dose => dose.isAccordingToNeed);
    }

    public static getPlainDoses(day: Day) {
        return day.allDoses.filter(dose => dose.type === "PlainDoseWrapper");
    }

    public static getNumberOfPlainDoses(day: Day) {
        return DayHelper.getPlainDoses(day).length;
    }

    public static getMorningDose(day: Day) {
        return day.allDoses.find(dose => dose.type === "MorningDoseWrapper");
    }

    public static getNoonDose(day: Day) {
        return day.allDoses.find(dose => dose.type === "NoonDoseWrapper");
    }

    public static getEveningDose(day: Day) {
        return day.allDoses.find(dose => dose.type === "EveningDoseWrapper");
    }

    public static getNightDose(day: Day) {
        return day.allDoses.find(dose => dose.type === "NightDoseWrapper");
    }

    /**
     * Compares dosage quantities and the dosages label (the type of the dosage)
     * @return true if all dosages are of the same type and has the same quantity
     */
    public static allDosesAreTheSame(day: Day): boolean {
        const dose0 = day.allDoses[0];
        return !day.allDoses.some(dose => !DoseHelper.theSameAs(dose0, dose));
    }

    /**
     * Compares dosage quantities (but not the dosages label)
     * @return true if all dosages has the same quantity
     */
    public static allDosesHaveTheSameQuantity(day: Day): boolean {
        const dose0 = day.allDoses[0];
        return !day.allDoses.some(dose => dose0.doseQuantity !== dose.doseQuantity || dose0.minimalDoseQuantity !== dose.minimalDoseQuantity || dose0.maximalDoseQuantity !== dose.maximalDoseQuantity);
    }


    public static allDosesButTheFirstAreTheSame(day: Day): boolean {
        return day.allDoses.length <= 1 || !day.allDoses.slice(1).some(dose => !DoseHelper.theSameAs(day.allDoses[1], dose));
    }

    public static containsOnlyPNOrFixedDoses(day: Day): boolean {
        return DayHelper.containsAccordingToNeedDosesOnly(day) || DayHelper.containsFixedDosesOnly(day);
    }

    public static containsAccordingToNeedDose(day: Day): boolean {
        return day.allDoses.some(dose => dose.isAccordingToNeed);
    }

    public static containsTimedDose(day: Day): boolean {
        return day.allDoses.some(dose => dose.type === "TimedDoseWrapper");
    }

    public static containsPlainDose(day: Day): boolean {
        return day.allDoses.some(dose => dose.type === "PlainDoseWrapper");
    }

    public static containsPlainNotAccordingToNeedDose(day: Day): boolean {
        return day.allDoses.some(dose => dose.type === "PlainDoseWrapper" && !dose.isAccordingToNeed);
    }

    public static containsMorningNoonEveningNightDoses(day: Day): boolean {
        return day.allDoses.some(dose =>
            dose.type === "MorningDoseWrapper" ||
            dose.type === "NoonDoseWrapper" ||
            dose.type === "EveningDoseWrapper" ||
            dose.type === "NightDoseWrapper");
    }

    public static containsAccordingToNeedDosesOnly(day: Day): boolean {
        return day.allDoses.every(d => d.isAccordingToNeed);
    }


    public static containsFixedDosesOnly(day: Day): boolean {
        return day.allDoses.every(d => !d.isAccordingToNeed);
    }
}