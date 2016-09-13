import { DoseWrapper } from "./DoseWrapper";
import { DosisTilTekstException } from "../DosisTilTekstException";
import { Interval } from "../Interval";
import { PlainDoseWrapper } from "./PlainDoseWrapper";
import { TimedDoseWrapper } from "./TimedDoseWrapper";
import { MorningDoseWrapper } from "./MorningDoseWrapper";
import { NoonDoseWrapper } from "./NoonDoseWrapper";
import { EveningDoseWrapper } from "./EveningDoseWrapper";
import { NightDoseWrapper } from "./NightDoseWrapper";

export class DayWrapper {

    // Wrapped values
    private _dayNumber: number;
    private _allDoses: Array<DoseWrapper>;

    // Doses were separate types before 2012-06-01. We keep them for now to maintain
    // compatibility in the dosis-to-text conversion
    // AccordingToNeed is merged into each type since 2012-06-01 schemas 
    // private List<AccordingToNeedDoseWrapper> accordingToNeedDoses = new ArrayList<AccordingToNeedDoseWrapper>();
    private _plainDoses: Array<PlainDoseWrapper> = [];
    private _timedDoses: Array<TimedDoseWrapper> = [];
    private _morningDose: MorningDoseWrapper;
    private _noonDose: NoonDoseWrapper;
    private _eveningDose: EveningDoseWrapper;
    private _nightDose: NightDoseWrapper;

    // Helper / cached values
    private _areAllDosesTheSame: boolean;
    private _areAllDosesHaveTheSameQuantity: boolean;
    private _accordingToNeedDoses: Array<DoseWrapper>;

    public static fromJsonObject(jsonObject: any) {

        if (jsonObject) {
            let allDoses: DoseWrapper[] = [];
            jsonObject.allDoses.forEach(d => {
                switch (d.type) {
                    case "MorningDoseWrapper":
                        allDoses.push(MorningDoseWrapper.fromJsonObject(d));
                        break;
                    case "NoonDoseWrapper":
                        allDoses.push(NoonDoseWrapper.fromJsonObject(d));
                        break;
                    case "EveningDoseWrapper":
                        allDoses.push(EveningDoseWrapper.fromJsonObject(d));
                        break;
                    case "NightDoseWrapper":
                        allDoses.push(NightDoseWrapper.fromJsonObject(d));
                        break;
                    case "PlainDoseWrapper":
                        allDoses.push(PlainDoseWrapper.fromJsonObject(d));
                        break;
                    case "TimedDoseWrapper":
                        allDoses.push(TimedDoseWrapper.fromJsonObject(d));
                        break;
                }
            });
            return new DayWrapper(jsonObject.dayNumber, allDoses);
        }
        return undefined;
    }


    public constructor(dayNumber: number, doses: DoseWrapper[]) {

        this._allDoses = doses;

        for (let dose of doses) {

            this._dayNumber = dayNumber;
            if (dose) {
                if (dose instanceof PlainDoseWrapper)
                    this._plainDoses.push(<PlainDoseWrapper>dose);
                else if (dose instanceof TimedDoseWrapper)
                    this._timedDoses.push(<TimedDoseWrapper>dose);
                else if (dose instanceof MorningDoseWrapper)
                    this._morningDose = <MorningDoseWrapper>dose;
                else if (dose instanceof NoonDoseWrapper)
                    this._noonDose = <NoonDoseWrapper>dose;
                else if (dose instanceof EveningDoseWrapper)
                    this._eveningDose = <EveningDoseWrapper>dose;
                else if (dose instanceof NightDoseWrapper)
                    this._nightDose = <NightDoseWrapper>dose;
            }

            this._areAllDosesTheSame = true;
            let compareDose: DoseWrapper;
            for (let dose of this.allDoses) {
                if (!compareDose) {
                    compareDose = dose;
                }
                else if (!compareDose.theSameAs(dose)) {
                    this._areAllDosesTheSame = false;
                    break;
                }
            }
        }
    }

    get dayNumber() {
        return this._dayNumber;
    }

    public getNumberOfDoses() {
        return this._allDoses.length;
    }

    public getDose(index: number): DoseWrapper {
        return this._allDoses[index];
    }


    public getNumberOfAccordingToNeedDoses() {
        return this._accordingToNeedDoses.length;
    }

    public getAccordingToNeedDoses(): Array<DoseWrapper> {
        // Since the 2012/06/01 namespace "according to need" is just a flag
        if (this._accordingToNeedDoses) {
            return this._accordingToNeedDoses;
        }
        else {
            this._accordingToNeedDoses = new Array<DoseWrapper>();
            for (let d of this._allDoses) {
                if (d.isAccordingToNeed)
                    this._accordingToNeedDoses.push(d);
            }
            return this._accordingToNeedDoses;
        }
    }

    get plainDoses() {
        return this._plainDoses;
    }

    public getNumberOfPlainDoses() {
        return this._plainDoses.length;
    }

    get morningDose() {
        return this._morningDose;
    }

    get noonDose() {
        return this._noonDose;
    }

    get eveningDose() {
        return this._eveningDose;
    }

    get nightDose() {
        return this._nightDose;
    }

    get allDoses() {
        return this._allDoses;
    }

    /**
     * Compares dosage quantities and the dosages label (the type of the dosage)
     * @return true if all dosages are of the same type and has the same quantity
     */
    public allDosesAreTheSame(): boolean {
        return this._areAllDosesTheSame;
    }

    /**
     * Compares dosage quantities (but not the dosages label)
     * @return true if all dosages has the same quantity
     */
    public allDosesHaveTheSameQuantity(): boolean {
        if (this._areAllDosesHaveTheSameQuantity) {
            return this._areAllDosesHaveTheSameQuantity;
        }
        this._areAllDosesHaveTheSameQuantity = true;
        if (this.allDoses.length > 1) {
            let dose0 = this.allDoses[0];
            for (let i = 1; i < this.allDoses.length; i++) {
                if (dose0.anyDoseQuantityString !== this.allDoses[i].anyDoseQuantityString) {
                    this._areAllDosesHaveTheSameQuantity = false;
                    break;
                }
            }
        }
    }

    public containsAccordingToNeedDose(): boolean {
        return this.allDoses.some(dose => dose.isAccordingToNeed);
    }

    public containsTimedDose(): boolean {
        return this.allDoses.some(dose => dose instanceof TimedDoseWrapper);
    }

    public containsPlainDose(): boolean {
        return this.allDoses.some(dose => dose instanceof PlainDoseWrapper);
    }

    public containsPlainNotAccordingToNeedDose(): boolean {
        return this.allDoses.some(dose => dose instanceof PlainDoseWrapper && !dose.isAccordingToNeed);
    }

    public containsMorningNoonEveningNightDoses(): boolean {
        return this.allDoses.some(dose => dose instanceof MorningDoseWrapper || dose instanceof NoonDoseWrapper
            || dose instanceof EveningDoseWrapper || dose instanceof NightDoseWrapper);
    }

    public containsAccordingToNeedDosesOnly(): boolean {
        return this.allDoses.every(d => d.isAccordingToNeed);
    }

    public getSumOfDoses(): Interval<number> {
        let minValue = DayWrapper.newDosage();
        let maxValue = DayWrapper.newDosage();
        for (let dose of this.allDoses) {
            if (dose.doseQuantity) {
                minValue = DayWrapper.addDosage(minValue, dose.doseQuantity);
                maxValue = DayWrapper.addDosage(maxValue, dose.doseQuantity);
            }
            else if (dose.minimalDoseQuantity && dose.maximalDoseQuantity) {
                minValue = DayWrapper.addDosage(minValue, dose.minimalDoseQuantity);
                maxValue = DayWrapper.addDosage(maxValue, dose.maximalDoseQuantity);
            }
            else {
                throw new DosisTilTekstException("DoseQuantity eller minimalDoseQuantity+MaximalDoseQuantity skal være sat");
            }
        }
        return { minimum: minValue, maximum: maxValue };
    }

    private static newDosage(): number {
        return 0;
        /* TODO Kan dette udelades?
        BigDecimal v = new BigDecimal(0.0);
        v = v.setScale(9, BigDecimal.ROUND_HALF_UP);
        return v; */
    }

    private static addDosage(bd: number, d: number): number {
        if (d) {
            return bd + d;
        }

        throw new DosisTilTekstException("addDosage: d skal være sat");
    }

}