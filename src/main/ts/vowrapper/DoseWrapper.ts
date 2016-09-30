import { TextHelper } from "../TextHelper";

export abstract class DoseWrapper {

    // Wrapped values
    private _minimalDoseQuantity: number;
    private _maximalDoseQuantity: number;
    private _doseQuantity: number;

    private _minimalDoseQuantityString: string;
    private _maximalDoseQuantityString: string;
    private _doseQuantityString: string;

    private _isAccordingToNeed: boolean;

    constructor(
        doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number, isAccordingToNeed: boolean) {
        this._doseQuantity = doseQuantity;
        this._minimalDoseQuantity = minimalDoseQuantity;
        this._maximalDoseQuantity = maximalDoseQuantity;
        this._isAccordingToNeed = isAccordingToNeed;
        if (minimalDoseQuantity !== undefined)
            this._minimalDoseQuantityString = TextHelper.formatQuantity(minimalDoseQuantity);
        if (maximalDoseQuantity !== undefined)
            this._maximalDoseQuantityString = TextHelper.formatQuantity(maximalDoseQuantity);
        if (doseQuantity !== undefined)
            this._doseQuantityString = TextHelper.formatQuantity(doseQuantity).replace(".", ",");
    }

    public abstract getLabel(): string;
    /*
    public static  to(value: number) {
        if(value==null)
            return null;
         v = new (value);
        v = v.setScale(9, .ROUND_HALF_UP);
        return v;
    }
      */

    protected static isZero(quantity: number): boolean {
        if (quantity) {
            return quantity < 0.000000001;
        }
        else {
            return true;
        }
    }

    protected static isMinAndMaxZero(minimalQuantity, maximalQuantity): boolean {
        return !minimalQuantity && !maximalQuantity;
    }

    public getMinimalDoseQuantity() {
        return this._minimalDoseQuantity;
    }

    public getMaximalDoseQuantity() {
        return this._maximalDoseQuantity;
    }

    public getDoseQuantity() {
        return this._doseQuantity;
    }

    public getMinimalDoseQuantityString() {
        return this._minimalDoseQuantityString;
    }

    public getMaximalDoseQuantityString() {
        return this._maximalDoseQuantityString;
    }

    public getDoseQuantityString() {
        return this._doseQuantityString;
    }

    public getIsAccordingToNeed() {
        return this._isAccordingToNeed;
    }

    public getAnyDoseQuantityString() {
        if (this.getDoseQuantityString())
            return this.getDoseQuantityString();
        else
            return this.getMinimalDoseQuantityString() + "-" + this.getMaximalDoseQuantityString();
    }

    public theSameAs(other: DoseWrapper): boolean {
        if (this.getLabel() !== other.getLabel())
            return false;
        if (this.getIsAccordingToNeed() !== other.getIsAccordingToNeed())
            return false;
        if (!this.equalsWhereNullsAreTrue(this.getMinimalDoseQuantityString(), other.getMinimalDoseQuantityString()))
            return false;
        if (!this.equalsWhereNullsAreTrue(this.getMaximalDoseQuantityString(), other.getMaximalDoseQuantityString()))
            return false;
        if (!this.equalsWhereNullsAreTrue(this.getDoseQuantityString(), other.getDoseQuantityString()))
            return false;
        return true;
    }

    private equalsWhereNullsAreTrue(a: string, b: string): boolean {
        if (a === undefined && b === undefined)
            return true;
        else if ((a === undefined && b) || (a && b === undefined)) {
            return false;
        }
        else {
            return a === b;
        }
    }
}
