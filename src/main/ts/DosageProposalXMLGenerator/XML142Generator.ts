import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";
import { XML140Generator } from "./XML140Generator";
import { TextHelper } from "../TextHelper";
import { DosagePeriod } from "./DosagePeriod";

export class XML142Generator extends XML140Generator implements XMLGenerator {

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected getNamespace(): string {
        return "m13";
    }



    public generateXml(periods: DosagePeriod[], unitTextSingular: string, unitTextPlural: string, supplementaryText?: string): string {
        let dosageElement: string =
            "<m13:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2013/06/01 ../../../2013/06/01/DosageForRequest.xsd\" " +
            "xmlns:m13=\"http://www.dkma.dk/medicinecard/xml.schema/2013/06/01\" " +
            "xmlns:m12=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m13:Structures>" +
            "<m13:UnitTexts source=\"Doseringsforslag\">" +
            "<m12:Singular>" + this.escape(unitTextSingular) + "</m12:Singular>" +
            "<m12:Plural>" + this.escape(unitTextPlural) + "</m12:Plural>" +
            "</m13:UnitTexts>";

        dosageElement += this.generateStructuresXml(periods, unitTextSingular, unitTextPlural, supplementaryText);

        return dosageElement + "</" + this.getNamespace() + ":Structures></" + this.getNamespace() + ":Dosage>";
    }

    protected generateStructuresXml(periods: DosagePeriod[], unitTextSingular: string, unitTextPlural: string, supplementaryText?: string) {
        let dosageElement = "";
        let subElement: string;

        periods.forEach(p => {
            dosageElement += ("<" + this.getNamespace() + ":Structure>");
            subElement = this.generatePeriodXml(p, unitTextSingular, unitTextPlural, supplementaryText);
            dosageElement += subElement + "</" + this.getNamespace() + ":Structure>";
        });

        return dosageElement;
    }

    protected generatePeriodXml(period: DosagePeriod, unitTextSingular: string, unitTextPlural: string, supplementaryText: string): string {
        switch (period.getType()) {
            case "M+M+A+N":
                return this.generateMMANXml(period.getIteration(), period.getMapping(), unitTextSingular, unitTextPlural, supplementaryText, "m12", period.getBeginDate(), period.getEndDate());
            case "N daglig":
                return this.generateDailyXml(period.getIteration(), period.getMapping(), unitTextSingular, unitTextPlural, supplementaryText, false, "m12", period.getBeginDate(), period.getEndDate());
            case "PN":
                return this.generateDailyXml(period.getIteration(), period.getMapping(), unitTextSingular, unitTextPlural, supplementaryText, true, "m12", period.getBeginDate(), period.getEndDate());
            default:
                throw new DosisTilTekstException("No support for type value '" + period.getType() + "'");
        }
    }

    protected generateCommonXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, beginDate: Date, endDate: Date): string {

        let xml = "";

        if (iteration === 0) {
            xml += "<" + this.getNamespace() + ":NotIterated/>";
        }
        else {
            xml += "<" + this.getNamespace() + ":IterationInterval>" + iteration + "</" + this.getNamespace() + ":IterationInterval>";
        }

        xml += "<" + this.getNamespace() + ":StartDate>" + TextHelper.formatYYYYMMDD(beginDate) + "</" + this.getNamespace() + ":StartDate>";
        if (endDate) {
            xml += "<" + this.getNamespace() + ":EndDate>" + TextHelper.formatYYYYMMDD(endDate) + "</" + this.getNamespace() + ":EndDate>";
        }
        else {
            xml += "<" + this.getNamespace() + ":DosageEndingUndetermined/>";
        }

        if (supplementaryText && supplementaryText.length > 0) {
            xml += "<" + this.getNamespace() + ":SupplementaryText>" + this.escape(supplementaryText) + "</" + this.getNamespace() + ":SupplementaryText>";
        }

        return xml;
    }
}