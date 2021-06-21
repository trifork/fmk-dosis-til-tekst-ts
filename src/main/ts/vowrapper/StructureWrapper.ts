import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";
import { DayWrapper } from "./DayWrapper";
import { DoseWrapper } from "./DoseWrapper";
import { Interval } from "../Interval";
import { DosisTilTekstException } from "../DosisTilTekstException";

export class StructureWrapper {

    // Mapped values
    private iterationInterval: number;
    private supplText: string;
    private startDateOrDateTime: DateOrDateTimeWrapper;
    private endDateOrDateTime: DateOrDateTimeWrapper;
    private days: Array<DayWrapper>;
    private refToSource;
    private dosagePeriodPostfix: string;

    // Cached values
    private _areAllDaysTheSame: boolean;
    private _areAllDosesTheSame: boolean;

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new StructureWrapper(jsonObject.iterationInterval,
                jsonObject.supplText,
                DateOrDateTimeWrapper.fromJsonObject(jsonObject.startDateOrDateTime),
                DateOrDateTimeWrapper.fromJsonObject(jsonObject.endDateOrDateTime),
                jsonObject.days.map(d => DayWrapper.fromJsonObject(d)),
                jsonObject.dosagePeriodPostfix)
            : undefined;
    }

    constructor(iterationInterval: number, supplText: string, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, days: Array<DayWrapper>, dosagePeriodPostfix: string) {
        this.iterationInterval = iterationInterval;
        this.supplText = supplText;
        this.startDateOrDateTime = startDateOrDateTime;
        this.endDateOrDateTime = endDateOrDateTime;
        this.dosagePeriodPostfix = dosagePeriodPostfix;

        if (days) {
            this.days = days.sort((d1, d2) => d1.getDayNumber() - d2.getDayNumber());
        }
        else {
            throw new DosisTilTekstException("StructureWrapper: days must be set in StructureWrapper");
        }
    }

    getIterationInterval(): number {
        return this.iterationInterval;
    }

    getSupplText(): string {
        return this.supplText;
    }

    setSupplText(st: string) {
        this.supplText = st;
    }

    getStartDateOrDateTime(): DateOrDateTimeWrapper {
        return this.startDateOrDateTime;
    }

    getEndDateOrDateTime(): DateOrDateTimeWrapper {
        return this.endDateOrDateTime;
    }

    getRefToSource(): Object {
        return this.refToSource;
    }

    getDosagePeriodPostfix(): string {
        return this.dosagePeriodPostfix;
    }

    setDosagePeriodPostfix(v: string) {
        this.dosagePeriodPostfix = v;
    }

    public startsAndEndsSameDay(): boolean {
        if (this.startDateOrDateTime && this.getEndDateOrDateTime()) {
            let startDate = this.startDateOrDateTime.getDateOrDateTime();
            let endDate = this.getEndDateOrDateTime().getDateOrDateTime();

            return startDate && endDate
                && startDate.getFullYear() === endDate.getFullYear()
                && startDate.getMonth() === endDate.getMonth()
                && startDate.getDate() === endDate.getDate();
        }
        else {
            return false;
        }
    }

    public getDays() {
        return this.days;
    }

    public getDay(dayNumber: number): DayWrapper {
        for (let day of this.days)
            if (day.getDayNumber() === dayNumber)
                return day;
        return undefined;
    }

    public sameDayOfWeek(): boolean {
        if (this.getDays().length === 1) {
            return false;
        }

        let remainder = -1;
        for (let day of this.getDays()) {
            let r = day.getDayNumber() % 7;
            if (remainder >= 0 && remainder !== r)
                return false;
            remainder = r;
        }
        return true;
    }

    public allDaysAreTheSame(): boolean {
        if (this._areAllDaysTheSame === undefined) {
            this._areAllDaysTheSame = true;
            let day0: DayWrapper;
            for (let day of this.getDays()) {
                if (day0) {
                    if (day0.getNumberOfDoses() !== day.getNumberOfDoses()) {
                        this._areAllDaysTheSame = false;
                        break;
                    }
                    else {
                        for (let d = 0; d < day0.getNumberOfDoses(); d++) {
                            if (!day0.getAllDoses()[d].theSameAs(day.getAllDoses()[d])) {
                                this._areAllDaysTheSame = false;
                                break;
                            }
                        }
                    }
                }
                else {
                    day0 = day;
                }
            }
        }
        return this._areAllDaysTheSame;
    }

    public daysAreInUninteruptedSequenceFromOne(): boolean {
        let dayNumber = 1;
        for (let day of this.getDays()) {
            if (day.getDayNumber() !== dayNumber)
                return false;
            dayNumber++;
        }
        return true;
    }

    /**
     * Compares dosage quantities and the dosages label (the type of the dosage)
     * @return true if all dosages are of the same type and has the same quantity
     */
    public allDosesAreTheSame(): boolean {
        if (this._areAllDosesTheSame === undefined) {
            this._areAllDosesTheSame = true;
            let dose0: DoseWrapper;
            for (let day of this.getDays()) {
                for (let dose of day.getAllDoses()) {
                    if (dose0 === undefined) {
                        dose0 = dose;
                    }
                    else if (!dose0.theSameAs(dose)) {
                        this._areAllDosesTheSame = false;
                        break;
                    }
                }
            }
        }

        return this._areAllDosesTheSame;
    }

    public containsMorningNoonEveningNightDoses(): boolean {
        return this.getDays().some(d => d.containsMorningNoonEveningNightDoses());
    }

    public containsPlainDose(): boolean {
        return this.getDays().some(d => d.containsPlainDose());
    }

    public containsTimedDose(): boolean {
        return this.getDays().some(d => d.containsTimedDose());
    }

    public containsAccordingToNeedDosesOnly(): boolean {
        return this.getDays().length > 0 && this.getDays().every(d => d.containsAccordingToNeedDosesOnly());
    }

    public containsAccordingToNeedDose(): boolean {
        return this.getDays().some(d => d.containsAccordingToNeedDose());
    }

    public getSumOfDoses(): Interval<number> {
        let allSum: Interval<number>;

        for (let day of this.getDays()) {
            let daySum = day.getSumOfDoses();
            if (allSum === undefined) {
                allSum = daySum;
            }
            else {
                allSum = { minimum: allSum.minimum + daySum.minimum, maximum: allSum.maximum + daySum.maximum };
            }
        }
        return allSum;
    }

    public isEmpty(): boolean {
        return this.getDays().length === 0;
    }

    // PN dosage without limit: not iterated PN only with one dosage element means take as many as you want per day
    public isPNWithoutLimit(): boolean {
        return this.getIterationInterval() === 0
            && this.containsAccordingToNeedDosesOnly()
            && this.getDays()[0].getDayNumber() <= 1
            && this.getDays()[0].getNumberOfAccordingToNeedDoses() === 1
            && this.getDays()[0].getNumberOfDoses() === 1
            && this.getDays()[0].getNumberOfPlainDoses() === 1;
    }
}
