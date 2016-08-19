import { DoseWrapper } from './DoseWrapper';

export class MorningDoseWrapper extends DoseWrapper {
	
	constructor(
			doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number, 
			doseQuantitystring: string , minimalDoseQuantitystring: string , maximalDoseQuantitystring: string , 
			isAccordingToNeed: boolean) {
		super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
	}

	public static makeDose(quantity: number, isAccordingToNeed = false): MorningDoseWrapper {
		if(MorningDoseWrapper.isZero(quantity))
			return null;
		return new MorningDoseWrapper(quantity, null, null, null, null, null, false);
	}

	public static makeDoseWithText(quantity: number, supplText: string, isAccordingToNeed = false): MorningDoseWrapper  {
		if(MorningDoseWrapper.isZero(quantity))
			return null;
		return new MorningDoseWrapper(quantity, null, null, supplText, null, null, isAccordingToNeed);
	}

	public static  makeDoseWithMinMax(minimalQuantity: number, maximalQuantity: number, isAccordingToNeed = false): MorningDoseWrapper {
		if(MorningDoseWrapper.isMinAndMaxZero(minimalQuantity, maximalQuantity))
			return null;
		return new MorningDoseWrapper(null, minimalQuantity, maximalQuantity, null, null, null, isAccordingToNeed);
	}	
	
	static LABEL = "morgen";  

	public getLabel() {
		return MorningDoseWrapper.LABEL;
	}
}
