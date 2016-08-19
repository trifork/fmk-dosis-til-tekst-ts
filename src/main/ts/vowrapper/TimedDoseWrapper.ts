import { DoseWrapper } from './DoseWrapper';

export class TimedDoseWrapper extends DoseWrapper {

	private _time: Date;

	constructor(
            time: Date,
			doseQuantity:number, minimalDoseQuantity: number , maximalDoseQuantity: number , 
			doseQuantitystring: string ,  minimalDoseQuantitystring: string,  maximalDoseQuantitystring: string, 
			isAccordingToNeed: boolean ) {
		super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
		this._time = time;
	}

	public static  makeDose(time: Date,  quantity: number,  isAccordingToNeed: boolean): TimedDoseWrapper {
		if(TimedDoseWrapper.isZero(quantity))
			return null;
		return new TimedDoseWrapper(time, quantity, null, null, null, null, null, isAccordingToNeed);
	}

	public static  makeDoseWithText(time: Date, quantity: number , supplText: string ,  isAccordingToNeed: boolean): TimedDoseWrapper {
		if(TimedDoseWrapper.isZero(quantity))
			return null;
		return new TimedDoseWrapper(time, quantity, null, null, supplText, null, null, isAccordingToNeed);
	}
	
	public static  makeDoseWithMinMax(time: Date,  minimalQuantity: number,  maximalQuantity: number,  isAccordingToNeed: boolean): TimedDoseWrapper {
		if(TimedDoseWrapper.isMinAndMaxZero(minimalQuantity, maximalQuantity))
			return null;
		return new TimedDoseWrapper(time, null, minimalQuantity, maximalQuantity, null, null, null, isAccordingToNeed);
	}	

	public static  makeDoseWithMinMaxAndText(time: Date,  minimalQuantity: number, maximalQuantity:  number, minimalSupplText:  string, maximalSupplText:  string, isAccordingToNeed:  boolean): TimedDoseWrapper {
		if(TimedDoseWrapper.isMinAndMaxZero(minimalQuantity, maximalQuantity))
			return null;
		return new TimedDoseWrapper(time, null, minimalQuantity, maximalQuantity, null, minimalSupplText, maximalSupplText, isAccordingToNeed);
	}	
	
	static LABEL = "kl.";  
	
	public  getLabel() {
		return TimedDoseWrapper.LABEL+" " + this._time.toString();
	}

	public getTime(): string {
		return this._time.toString();
	}

	public  theSameAs( other: DoseWrapper): boolean {
		if(!(other instanceof TimedDoseWrapper))
			return false;
		if(!super.theSameAs(other))
			return false;
		return this.getTime() == (other as TimedDoseWrapper).getTime();
	}
}
