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
    private dayNumber: number;
    private allDoses: Array<DoseWrapper>;

    // Doses were separate types before 2012-06-01. We keep them for now to maintain
    // compatibility in the dosis-to-text conversion
    // AccordingToNeed is merged into each type since 2012-06-01 schemas
    // private List<AccordingToNeedDoseWrapper> accordingToNeedDoses = new ArrayList<AccordingToNeedDoseWrapper>();
    private plainDoses: Array<PlainDoseWrapper> = [];
    private timedDoses: Array<TimedDoseWrapper> = [];
    private morningDose: MorningDoseWrapper;
    private noonDose: NoonDoseWrapper;
    private eveningDose: EveningDoseWrapper;
    private nightDose: NightDoseWrapper;

    // Helper / cached values
    private areAllDosesTheSame: boolean;
    private areAllDosesHaveTheSameQuantity: boolean;
    private areAllDosesExceptTheFirstTheSame: boolean;
    private accordingToNeedDoses: Array<DoseWrapper>;

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

        this.allDoses = doses;

        for (let dose of doses) {

            this.dayNumber = dayNumber;
            if (dose) {
                if (dose instanceof PlainDoseWrapper)
                    this.plainDoses.push(<PlainDoseWrapper>dose);
                else if (dose instanceof TimedDoseWrapper)
                    this.timedDoses.push(<TimedDoseWrapper>dose);
                else if (dose instanceof MorningDoseWrapper)
                    this.morningDose = <MorningDoseWrapper>dose;
                else if (dose instanceof NoonDoseWrapper)
                    this.noonDose = <NoonDoseWrapper>dose;
                else if (dose instanceof EveningDoseWrapper)
                    this.eveningDose = <EveningDoseWrapper>dose;
                else if (dose instanceof NightDoseWrapper)
                    this.nightDose = <NightDoseWrapper>dose;
            }

            this.areAllDosesTheSame = true;
            let compareDose: DoseWrapper;
            for (let dose of this.getAllDoses()) {
                if (!compareDose) {
                    compareDose = dose;
                }
                else if (!compareDose.theSameAs(dose)) {
                    this.areAllDosesTheSame = false;
                    break;
                }
            }
        }
    }

    public getDayNumber() {
        return this.dayNumber;
    }

    public isAnyDay() {
        return this.getDayNumber() === 0;
    }

    public getNumberOfDoses() {
        return this.allDoses.length;
    }

    public getDose(index: number): DoseWrapper {
        return this.allDoses[index];
    }


    public getNumberOfAccordingToNeedDoses() {
        return this.getAccordingToNeedDoses().length;
    }

    public getAccordingToNeedDoses(): Array<DoseWrapper> {
        // Since the 2012/06/01 namespace "according to need" is just a flag
        if (this.accordingToNeedDoses) {
            return this.accordingToNeedDoses;
        }
        else {
            this.accordingToNeedDoses = new Array<DoseWrapper>();
            for (let d of this.allDoses) {
                if (d.getIsAccordingToNeed())
                    this.accordingToNeedDoses.push(d);
            }
            return this.accordingToNeedDoses;
        }
    }

    getPlainDoses() {
        return this.plainDoses;
    }

    public getNumberOfPlainDoses() {
        return this.plainDoses.length;
    }

    getMorningDose() {
        return this.morningDose;
    }

    getNoonDose() {
        return this.noonDose;
    }

    getEveningDose() {
        return this.eveningDose;
    }

    getNightDose() {
        return this.nightDose;
    }

    getAllDoses() {
        return this.allDoses;
    }

    /**
     * Compares dosage quantities and the dosages label (the type of the dosage)
     * @return true if all dosages are of the same type and has the same quantity
     */
    public allDosesAreTheSame(): boolean {
        return this.areAllDosesTheSame;
    }

    /**
     * Compares dosage quantities (but not the dosages label)
     * @return true if all dosages has the same quantity
     */
    public allDosesHaveTheSameQuantity(): boolean {
        if (this.areAllDosesHaveTheSameQuantity) {
            return this.areAllDosesHaveTheSameQuantity;
        }
        this.areAllDosesHaveTheSameQuantity = true;
        if (this.getAllDoses().length > 1) {
            let dose0 = this.getAllDoses()[0];
            for (let i = 1; i < this.getAllDoses().length; i++) {
                if (dose0.getAnyDoseQuantityString() !== this.getAllDoses()[i].getAnyDoseQuantityString()) {
                    this.areAllDosesHaveTheSameQuantity = false;
                    break;
                }
            }
        }
        return this.areAllDosesHaveTheSameQuantity;
    }


    public allDosesButTheFirstAreTheSame(): boolean {
        if (this.areAllDosesExceptTheFirstTheSame) {
            return this.areAllDosesExceptTheFirstTheSame;
        }
        else {
            this.areAllDosesExceptTheFirstTheSame = true;
            let dose0: DoseWrapper;
            for (let i = 1; i < this.getNumberOfDoses(); i++) {
                if (!dose0) {
                    dose0 = this.getAllDoses()[i];
                }
                else if (!dose0.theSameAs(this.getAllDoses()[i])) {
                    this.areAllDosesExceptTheFirstTheSame = false;
                    break;
                }
            }
        }
        return this.areAllDosesExceptTheFirstTheSame;
    }

    public containsOnlyPNOrFixedDoses(): boolean {
        return this.containsAccordingToNeedDosesOnly() || this.containsFixedDosesOnly();
    }

    public containsAccordingToNeedDose(): boolean {
        return this.getAllDoses().some(dose => dose.getIsAccordingToNeed());
    }

    public containsTimedDose(): boolean {
        return this.getAllDoses().some(dose => dose instanceof TimedDoseWrapper);
    }

    public containsPlainDose(): boolean {
        return this.getAllDoses().some(dose => dose instanceof PlainDoseWrapper);
    }

    public containsPlainNotAccordingToNeedDose(): boolean {
        return this.getAllDoses().some(dose => dose instanceof PlainDoseWrapper && !dose.getIsAccordingToNeed());
    }

    public containsMorningNoonEveningNightDoses(): boolean {
        return this.getAllDoses().some(dose => dose instanceof MorningDoseWrapper || dose instanceof NoonDoseWrapper
            || dose instanceof EveningDoseWrapper || dose instanceof NightDoseWrapper);
    }

    public containsAccordingToNeedDosesOnly(): boolean {
        return this.getAllDoses().every(d => d.getIsAccordingToNeed());
    }


    public containsFixedDosesOnly(): boolean {
        return this.getAllDoses().every(d => !d.getIsAccordingToNeed());
    }

    public getSumOfDoses(): Interval<number> {
        let minValue = DayWrapper.newDosage();
        let maxValue = DayWrapper.newDosage();
        for (let dose of this.getAllDoses()) {
            if (dose.getDoseQuantity() !== undefined) {
                minValue = DayWrapper.addDosage(minValue, dose.getDoseQuantity());
                maxValue = DayWrapper.addDosage(maxValue, dose.getDoseQuantity());
            }
            else if (dose.getMinimalDoseQuantity() !== undefined && dose.getMaximalDoseQuantity() !== undefined) {
                minValue = DayWrapper.addDosage(minValue, dose.getMinimalDoseQuantity());
                maxValue = DayWrapper.addDosage(maxValue, dose.getMaximalDoseQuantity());
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
        if (d !== undefined) {
            return bd + d;
        }

        throw new DosisTilTekstException("addDosage: d skal være sat");
    }

}
