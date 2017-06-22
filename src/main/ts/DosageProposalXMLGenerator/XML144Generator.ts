import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";
import { XML142Generator } from "./XML142Generator";
import { DosagePeriod } from "./DosagePeriod";

export class XML144Generator extends XML142Generator implements XMLGenerator {

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected getNamespace(): string {
        return "m15";
    }


    public generateXml(periods: DosagePeriod[], unitTextSingular: string, unitTextPlural: string, supplementaryText?: string): string {
        let dosageElement: string =
            "<m15:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2015/01/01 ../../../2015/01/01/DosageForRequest.xsd\" " +
            "xmlns:m15=\"http://www.dkma.dk/medicinecard/xml.schema/2015/01/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m15:Structures>" +
            "<m15:UnitTexts source=\"Doseringsforslag\">" +
            "<m15:Singular>" + this.escape(unitTextSingular) + "</m15:Singular>" +
            "<m15:Plural>" + this.escape(unitTextPlural) + "</m15:Plural>" +
            "</m15:UnitTexts>";

        dosageElement += this.generateStructuresXml(periods, unitTextSingular, unitTextPlural, supplementaryText);

        return dosageElement + "</" + this.getNamespace() + ":Structures></" + this.getNamespace() + ":Dosage>";
    }

    protected generatePeriodXml(period: DosagePeriod, unitTextSingular: string, unitTextPlural: string, supplementaryText: string): string {
        switch (period.getType()) {
            case "M+M+A+N":
                return this.generateMMANXml(period.getIteration(), period.getMapping(), unitTextSingular, unitTextPlural, supplementaryText, this.getNamespace(), period.getBeginDate(), period.getEndDate());
            case "N daglig":
                return this.generateDailyXml(period.getIteration(), period.getMapping(), unitTextSingular, unitTextPlural, supplementaryText, false, this.getNamespace(), period.getBeginDate(), period.getEndDate());
            case "PN":
                return this.generateDailyXml(period.getIteration(), period.getMapping(), unitTextSingular, unitTextPlural, supplementaryText, true, this.getNamespace(), period.getBeginDate(), period.getEndDate());
            default:
                throw new DosisTilTekstException("No support for type value '" + period.getType() + "'");
        }
    }
}