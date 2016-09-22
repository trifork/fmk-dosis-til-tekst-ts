import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";
import { DayWrapper } from "./DayWrapper";
import { DoseWrapper } from "./DoseWrapper";
import { Interval } from "../Interval";
import { DosisTilTekstException } from "../DosisTilTekstException";

export class StructureWrapper {

    // Mapped values
    private _iterationInterval: number;
    private _supplText: string;
    private _startDateOrDateTime: DateOrDateTimeWrapper;
    private _endDateOrDateTime: DateOrDateTimeWrapper;
    private _days: Array<DayWrapper>;
    private _refToSource;
    private _dosagePeriodPostfix: string;

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
        this._iterationInterval = iterationInterval;
        this._supplText = supplText;
        this._startDateOrDateTime = startDateOrDateTime;
        this._endDateOrDateTime = endDateOrDateTime;
        this._dosagePeriodPostfix = dosagePeriodPostfix;

        if (days) {
            this._days = days.sort((d1, d2) => d1.dayNumber - d2.dayNumber);
        }
        else {
            throw new DosisTilTekstException("StructureWrapper: days must be set in StructureWrapper");
        }
    }

    get iterationInterval(): number {
        return this._iterationInterval;
    }

    get supplText(): string {
        return this._supplText;
    }

    get startDateOrDateTime(): DateOrDateTimeWrapper {
        return this._startDateOrDateTime;
    }

    get endDateOrDateTime(): DateOrDateTimeWrapper {
        return this._endDateOrDateTime;
    }

    get refToSource(): Object {
        return this._refToSource;
    }

    get dosagePeriodPostfix(): string {
        return this._dosagePeriodPostfix;
    }

    set dosagePeriodPostfix(v: string) {
        this._dosagePeriodPostfix = v;
    }

    public startsAndEndsSameDay(): boolean {
        if (this._startDateOrDateTime && this.endDateOrDateTime) {
            let startDate = this._startDateOrDateTime.getDateOrDateTime();
            let endDate = this.endDateOrDateTime.getDateOrDateTime();

            return startDate.getFullYear() === endDate.getFullYear()
                && startDate.getMonth() === endDate.getMonth()
                && startDate.getDate() === endDate.getDate();
        }
        else {
            return false;
        }
    }

    get days() {
        return this._days;
    }

    public sameDayOfWeek(): boolean {
        if (this.days.length === 1) {
            return false;
        }

        let remainder = -1;
        for (let day of this.days) {
            let r = day.dayNumber % 7;
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
            for (let day of this.days) {
                if (day0) {
                    if (day0.getNumberOfDoses() !== day.getNumberOfDoses()) {
                        this._areAllDaysTheSame = false;
                        break;
                    }
                    else {
                        for (let d = 0; d < day0.getNumberOfDoses(); d++) {
                            if (!day0.allDoses[d].theSameAs(day.allDoses[d])) {
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
        for (let day of this.days) {
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
    public allDosesAreTheSame(): boolean {
        if (this._areAllDosesTheSame === undefined) {
            this._areAllDosesTheSame = true;
            let dose0: DoseWrapper;
            for (let day of this.days) {
                for (let dose of day.allDoses) {
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
        return this.days.some(d => d.containsMorningNoonEveningNightDoses());
    }

    public containsPlainDose(): boolean {
        return this.days.some(d => d.containsPlainDose());
    }

    public containsTimedDose(): boolean {
        return this.days.some(d => d.containsTimedDose());
    }

    public containsAccordingToNeedDosesOnly(): boolean {
        return this.days.every(d => d.containsAccordingToNeedDosesOnly());
    }

    public containsAccordingToNeedDose(): boolean {
        return this.days.some(d => d.containsAccordingToNeedDose());
    }

    public getSumOfDoses(): Interval<number> {
        let allSum: Interval<number>;

        for (let day of this.days) {
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

}
