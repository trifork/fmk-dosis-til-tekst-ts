import { LongTextConverterImpl } from './LongTextConverterImpl';
import { DateOrDateTimeWrapper } from '../vowrapper/DateOrDateTimeWrapper';
/*
export abstract class SimpleLongTextConverterImpl extends LongTextConverterImpl {
	
	public  doConvert(text: string, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper): string {

        let s = "";
        
		if(startDateOrDateTime && endDateOrDateTime && startDateOrDateTime.equals(endDateOrDateTime)) { 
			// Same day dosage
			s += "Doseringen foretages kun "+this.datesToLongText(endDateOrDateTime)+".\n"+"   Dosering:\n   ";
		}
		else if(startDateOrDateTime!=null) {
			appendDosageStart(s, startDateOrDateTime);
			if(endDateOrDateTime!=null) {
				s.append(" og ophører "+datesToLongText(endDateOrDateTime)+".\n"+"   Doseringsforløb:\n   ");
			}
			else {
				s.append(".\n   Doseringsforløb:\n   ");
			}
		}
		else if(startDateOrDateTime==null) {
			if(endDateOrDateTime!=null) {
				s.append("Doseringsforløbet ophører "+datesToLongText(endDateOrDateTime)+".\n"+"   Doseringsforløb:\n   ");
			}
		}
		
		s.append(text);
		
		return s.toString();
	}
	
}
*/