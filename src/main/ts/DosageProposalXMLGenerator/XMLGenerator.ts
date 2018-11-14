
import { DosagePeriod } from "./DosagePeriod";

export interface XMLGenerator {
    generateXml(dosagePeriods: DosagePeriod[], unitTextSingular: string, unitTextPlural: string, supplementaryText?: string, ): string;
}