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

    public get minimalDoseQuantity() {
    return this._minimalDoseQuantity;
}

    public get maximalDoseQuantity() {
    return this._maximalDoseQuantity;
}

    public get doseQuantity() {
    return this._doseQuantity;
}

    public get minimalDoseQuantityString() {
    return this._minimalDoseQuantityString;
}

    public get maximalDoseQuantityString() {
    return this._maximalDoseQuantityString;
}

    public get doseQuantityString() {
    return this._doseQuantityString;
}

    public get isAccordingToNeed() {
    return this._isAccordingToNeed;
}

    public get anyDoseQuantityString() {
    if (this.doseQuantityString)
        return this.doseQuantityString;
    else
        return this.minimalDoseQuantityString + "-" + this.maximalDoseQuantityString;
}

    public theSameAs(other: DoseWrapper): boolean {
    if (this.getLabel() !== other.getLabel())
        return false;
    if (this.isAccordingToNeed !== other.isAccordingToNeed)
        return false;
    if (!this.equalsWhereNullsAreTrue(this.minimalDoseQuantityString, other.minimalDoseQuantityString))
        return false;
    if (!this.equalsWhereNullsAreTrue(this.maximalDoseQuantityString, other.maximalDoseQuantityString))
        return false;
    if (!this.equalsWhereNullsAreTrue(this.doseQuantityString, other.doseQuantityString))
        return false;
    return true;
}

    private equalsWhereNullsAreTrue(a, b): boolean {
    if (!a && !b)
        return true;
    else if ((!a && b) || (a && !b))
        return false;
    else
        return a.toString().equals(b.toString());
}
}