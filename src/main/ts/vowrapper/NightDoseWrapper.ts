import { DoseWrapper } from './DoseWrapper';

export class NightDoseWrapper extends DoseWrapper {
	
	constructor(
			doseQuantity: number, minimalDoseQuantity: number, maximalDoseQuantity: number, 
			doseQuantitystring: string , minimalDoseQuantitystring: string , maximalDoseQuantitystring: string , 
			isAccordingToNeed: boolean) {
		super(doseQuantity, minimalDoseQuantity, maximalDoseQuantity, isAccordingToNeed);
	}

	public static makeDose(quantity: number, isAccordingToNeed = false): NightDoseWrapper {
		if(NightDoseWrapper.isZero(quantity))
			return null;
		return new NightDoseWrapper(quantity, null, null, null, null, null, false);
	}

	public static makeDoseWithText(quantity: number, supplText: string, isAccordingToNeed = false): NightDoseWrapper  {
		if(NightDoseWrapper.isZero(quantity))
			return null;
		return new NightDoseWrapper(quantity, null, null, supplText, null, null, isAccordingToNeed);
	}

	public static  makeDoseWithMinMax(minimalQuantity: number, maximalQuantity: number, isAccordingToNeed = false): NightDoseWrapper {
		if(NightDoseWrapper.isMinAndMaxZero(minimalQuantity, maximalQuantity))
			return null;
		return new NightDoseWrapper(null, minimalQuantity, maximalQuantity, null, null, null, isAccordingToNeed);
	}	
	
	static LABEL = "før sengetid";  

	public getLabel() {
		return NightDoseWrapper.LABEL;
	}
}
