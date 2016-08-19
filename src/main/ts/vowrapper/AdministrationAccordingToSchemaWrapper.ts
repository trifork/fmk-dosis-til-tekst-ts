import { DateOrDateTimeWrapper } from './DateOrDateTimeWrapper';

export class AdministrationAccordingToSchemaWrapper {
	
	private startDateOrDateTime: DateOrDateTimeWrapper ;
	private endDateOrDateTime: DateOrDateTimeWrapper ;
	
	public static makeAdministrationAccordingToSchema(startDateOrDateTime: DateOrDateTimeWrapper , endDateOrDateTime: DateOrDateTimeWrapper): AdministrationAccordingToSchemaWrapper {
		return new AdministrationAccordingToSchemaWrapper(startDateOrDateTime, endDateOrDateTime);
	}
	
	constructor (startDateOrDateTime: DateOrDateTimeWrapper , endDateOrDateTime: DateOrDateTimeWrapper) {
		this.startDateOrDateTime = startDateOrDateTime;
		this.endDateOrDateTime = endDateOrDateTime;
	}
	
	public getStartDateOrDateTime(): DateOrDateTimeWrapper  {
		return this.startDateOrDateTime;
	}

	public getEndDateOrDateTime(): DateOrDateTimeWrapper {
		return this.endDateOrDateTime;
	}
	
}