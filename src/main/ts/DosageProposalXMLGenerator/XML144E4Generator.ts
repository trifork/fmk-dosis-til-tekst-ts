import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";
import { DosagePeriod } from "./DosagePeriod";
import { TextHelper } from "../TextHelper";

export class XML144E4Generator extends AbstractXMLGenerator implements XMLGenerator {

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected getNamespace(): string {
        return "m15";
    }


    public generateXml(periods: DosagePeriod[], unitTextSingular: string, unitTextPlural: string, supplementaryText?: string): string {
        let dosageElement: string =
            "<m15e4:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2015/01/01 ../../../2015/01/01/DosageForRequest.xsd\" " +
            "xmlns:m15=\"http://www.dkma.dk/medicinecard/xml.schema/2015/01/01\" " +
            "xmlns:m15e4=\"http://www.dkma.dk/medicinecard/xml.schema/2015/01/01/E4\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m15:Structures>" +
            "<m15:UnitTexts source=\"Doseringsforslag\">" +
            "<m15:Singular>" + this.escape(unitTextSingular) + "</m15:Singular>" +
            "<m15:Plural>" + this.escape(unitTextPlural) + "</m15:Plural>" +
            "</m15:UnitTexts>";

        dosageElement += this.generateStructuresXml(periods, unitTextSingular, unitTextPlural, supplementaryText);

        return dosageElement + "</m15:Structures></m15e4:Dosage>";
    }


    protected generateMMANXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, dosageNS: string, beginDate: Date, endDate: Date): string {

        let mmanMapping = AbstractXMLGenerator.parseMapping(mapping);
        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, beginDate, endDate);

        xml += "<" + this.getNamespace() + ":Day>" +
            "<" + dosageNS + ":Number>1</" + dosageNS + ":Number>";

        if (mmanMapping.getMorning()) {
            xml += "<" + dosageNS + ":Dose>"
                + "<" + dosageNS + ":Time>morning</" + dosageNS + ":Time>"
                + "<" + dosageNS + ":Quantity>" + mmanMapping.getMorning() + "</" + dosageNS + ":Quantity>"
                + "</" + dosageNS + ":Dose>";
        }

        if (mmanMapping.getNoon()) {
            xml += "<" + dosageNS + ":Dose>"
                + "<" + dosageNS + ":Time>noon</" + dosageNS + ":Time>"
                + "<" + dosageNS + ":Quantity>" + mmanMapping.getNoon() + "</" + dosageNS + ":Quantity>"
                + "</" + dosageNS + ":Dose>";
        }

        if (mmanMapping.getEvening()) {
            xml += "<" + dosageNS + ":Dose>"
                + "<" + dosageNS + ":Time>evening</" + dosageNS + ":Time>"
                + "<" + dosageNS + ":Quantity>" + mmanMapping.getEvening() + "</" + dosageNS + ":Quantity>"
                + "</" + dosageNS + ":Dose>";
        }

        if (mmanMapping.getNight()) {
            xml += "<" + dosageNS + ":Dose>"
                + "<" + dosageNS + ":Time>night</" + dosageNS + ":Time>"
                + "<" + dosageNS + ":Quantity>" + mmanMapping.getNight() + "</" + dosageNS + ":Quantity>"
                + "</" + dosageNS + ":Dose>";
        }

        xml += "</" + this.getNamespace() + ":Day>";

        return xml;
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

    protected generateDailyXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean, dosageNS: string, beginDate: Date, endDate: Date): string {


        if (mapping.indexOf("dag ") >= 0) {
            return this.generateXmlForSeparateDays(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, isPN, dosageNS, beginDate, endDate);
        }
        else {
            return this.generateXmlForSameDay(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, isPN, dosageNS, beginDate, endDate);
        }
    }


    private generateXmlForSameDay(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean, dosageNS: string, beginDate: Date, endDate: Date): string {

        let splittedMapping = mapping.split(";");
        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, beginDate, endDate);

        xml += "<" + this.getNamespace() + ":Day>" +
            "<" + dosageNS + ":Number>1</" + dosageNS + ":Number>" +
            this.getQuantityString(splittedMapping, isPN, dosageNS) +
            "</" + this.getNamespace() + ":Day>";

        return xml;
    }

    protected getQuantityString(quantities: string[], isPN: boolean, dosageNS: string): string {
        let xml = "";

        for (let dose of quantities) {
            xml += "<" + dosageNS + ":Dose><" + dosageNS + ":Quantity>" + dose + "</" + dosageNS + ":Quantity>";
            if (isPN) {
                xml += "<" + dosageNS + ":IsAccordingToNeed/>";
            }
            xml += "</" + dosageNS + ":Dose>";
        }

        return xml;
    }

    private generateXmlForSeparateDays(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean, dosageNS: string, beginDate: Date, endDate: Date): string {

        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, beginDate, endDate);
        let result: string[];

        while ((result = this.daysMappingRegExp.exec(mapping)) != null) {
            let dayno = result[1];
            let quantity = result[2];

            xml += "<" + this.getNamespace() + ":Day><" + dosageNS + ":Number>" + dayno + "</" + dosageNS + ":Number>"
                + this.getQuantityString(quantity.split(";"), isPN, dosageNS)
                + "</" + this.getNamespace() + ":Day>";
        }

        return xml;
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