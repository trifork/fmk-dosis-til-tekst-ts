import { DateOrDateTimeWrapper } from './DateOrDateTimeWrapper';
import { DayWrapper } from './DayWrapper';
import { DoseWrapper } from './DoseWrapper';
import { Interval } from '../Interval';
import { DosisTilTekstException } from '../DosisTilTekstException';

export class StructureWrapper {
	
	// Mapped values
	private _iterationInterval: number;
	private _supplText: string;	
	private _startDateOrDateTime: DateOrDateTimeWrapper;
	private _endDateOrDateTime: DateOrDateTimeWrapper;
	private _days: Array<DayWrapper> ;
	private _refToSource;
	private _dosagePeriodPostfix: string;
	
	// Cached values
	private _areAllDaysTheSame: boolean;
	private _areAllDosesTheSame: boolean;

    /*
	private static final Comparator<DayWrapper> DAY_COMPARATOR = new Comparator<DayWrapper>() {
		@Override
		public int compare(DayWrapper o1, DayWrapper o2) {
			return o1.dayNumber - o2.dayNumber;
		}
	};
	*/

    static dayComparator(day1: DayWrapper, day2: DayWrapper): number {
        return day1.dayNumber - day2.dayNumber
    };
	/**
	 * Factory metod to create structured dosages
	 */
	public static  makeStructure(iterationInterval: number, supplText: string, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, ...days: DayWrapper[]): StructureWrapper {
        return StructureWrapper.makeStructure(iterationInterval, supplText, startDateOrDateTime, endDateOrDateTime, null, ...days);
	}
	
	/**
	 * Factory metod to create structured dosages
	 */
	public static makeStructureWithSourceRef(iterationInterval: number, supplText: string, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper,  refToSource: Object, ...days: DayWrapper[] ): StructureWrapper {
		
        let sortedList = days.sort(StructureWrapper.dayComparator); 
		return new StructureWrapper(iterationInterval, supplText, startDateOrDateTime, endDateOrDateTime, null, sortedList);
	}
	

	
	constructor(iterationInterval: number, supplText: string, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper , refToSource: Object, days: Array<DayWrapper>) {
		this.iterationInterval = iterationInterval;
		this.supplText = supplText;
		this.startDateOrDateTime = startDateOrDateTime;
		this.endDateOrDateTime = endDateOrDateTime;

		if(days) {
			this.days = days;
			this.refToSource = refToSource;
		}
		else {
			throw new DosisTilTekstException("StructureWrapper: days must be set in StructureWrapper");
		}
	}


    get iterationInterval() : number {
        return this._iterationInterval
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

	set dosagePeriodPostfix(v : string) {
		this._dosagePeriodPostfix = v;
	}

	public startsAndEndsSameDay(): boolean  {
		if(this.startDateOrDateTime && this.endDateOrDateTime) {
			let startDate = this.startDateOrDateTime.getDateOrDateTime();
			let endDate = this.endDateOrDateTime.getDateOrDateTime();

			return startDate.getFullYear() == endDate.getFullYear()
				&& startDate.getMonth() == endDate.getMonth()
				&& startDate.getDate() == endDate.getDate();
		}
		else {
			return false;
		}
    }	

	get days() {
		return this._days;
	}	
	
	public getDay(dayNumber: number): DayWrapper {
		for(let day of this.days) 
			if(day.dayNumber == dayNumber)
				return day;
		return null;
	}
	
	public sameDayOfWeek(): boolean  {
        if(this.days.length == 1) {
			 return false;
        }

		let remainder = -1;
		 for(let day of this.days) {
			 let r = day.dayNumber % 7;
			 if(remainder >= 0 && remainder != r)
				return false;
			 remainder = r;
		 }
		 return true;
	}
	
	public allDaysAreTheSame(): boolean {
		if(this._areAllDaysTheSame == undefined) {
			this._areAllDaysTheSame = true;
			let day0: DayWrapper = null;
			for(let day of this.days) {
				if(day0 == null) {
					day0 = day;
				}
				else {
					if(day0.getNumberOfDoses() != day.getNumberOfDoses()) {
						this._areAllDaysTheSame = false;
						break;						
					}
					else {
						for(let d=0; d<day0.getNumberOfDoses(); d++) {
							if(!day0.allDoses[d].theSameAs(day.allDoses[d])) {
								this._areAllDaysTheSame = false;
								break;						
							}
						}
					}
				}
			}
		}
		return this._areAllDaysTheSame;
	}	

	public daysAreInUninteruptedSequenceFromOne(): boolean  {
		let dayNumber = 1;
		for(let day of this.days) {
			if(day.dayNumber!=dayNumber)
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
		if(this._areAllDosesTheSame) {
			return this._areAllDosesTheSame;
		}

		this._areAllDosesTheSame = true;
		let  dose0: DoseWrapper = null;
		for(let day of this.days) {
			for(let dose of day.allDoses) {
				if(dose0==null) {
					dose0 = dose;
				}
				else if(!dose0.theSameAs(dose)) {
					this._areAllDosesTheSame = false;
					break;
				}	
			}
		}
	}
		
	public containsMorningNoonEveningNightDoses(): boolean  {
		return this.days.some(d => d.containsMorningNoonEveningNightDoses());
	}	
	
	public containsPlainDose():  boolean {
		return this.days.some(d => d.containsPlainDose());
	}

	public containsTimedDose(): boolean {
		return this.days.some(d => d.containsTimedDose());
	}	
	
	public containsAccordingToNeedDosesOnly():  boolean {
		return this.days.every(d => d.containsAccordingToNeedDosesOnly());
	}

	public containsAccordingToNeedDose():  boolean {
		return this.days.some(d => d.containsAccordingToNeedDose());		
	}

	public  getSumOfDoses(): Interval<number> {
		let allSum: Interval<number>;

		for(let day of this.days) {
			let daySum = day.getSumOfDoses(); 
			if(allSum == undefined) {
				allSum = daySum;
			}
			else {
				allSum = { minimum: allSum.minimum + daySum.minimum, maximum: allSum.maximum + daySum.maximum };
			}
		}
		return allSum;
	}

}
