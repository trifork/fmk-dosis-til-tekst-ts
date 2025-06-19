import { AdministrationAccordingToSchema } from "../dto/Dosage";
import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";

export class AdministrationAccordingToSchemaWrapper {

    readonly value: AdministrationAccordingToSchema;

    public static makeAdministrationAccordingToSchema(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper): AdministrationAccordingToSchemaWrapper {
        return new AdministrationAccordingToSchemaWrapper(startDateOrDateTime, endDateOrDateTime);
    }

    constructor(startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper) {
        this.value = {
            startDate: startDateOrDateTime?.value,
            endDate: endDateOrDateTime?.value
        };
    }
}