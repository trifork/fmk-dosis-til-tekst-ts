import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";

export class XML140Generator extends AbstractXMLGenerator implements XMLGenerator {

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected getNamespace(): string {
        return "m12";
    }

    public generateXml(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText?: string): string {
        let dosageElement: string =
            "<m12:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01 ../../../2012/06/01/Dosage.xsd\" " +
            "xmlns:m12=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m12:Structure>";

        let subElement: string;

        switch (type) {
            case "M+M+A+N":
                subElement = this.generateMMANXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, "m12");
                break;
            case "N daglig":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, false, "m12");
                break;
            case "PN":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, true, "m12");
                break;
            default:
                throw new DosisTilTekstException("No support for type value '" + type + "'");
        }

        return dosageElement + subElement + "</m12:Structure></m12:Dosage>";
    }

    protected generateCommonXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string): string {
        let xml = "";

        if (iteration === 0) {
            xml += "<m12:NotIterated/>";
        }
        else {
            xml += "<m12:IterationInterval>" + iteration + "</m12:IterationInterval>";
        }

        xml += "<m12:StartDate>2010-01-01</m12:StartDate>" +
            "<m12:EndDate>2110-01-01</m12:EndDate>" +
            "<m12:UnitTexts source=\"Doseringsforslag\">" +
            "<m12:Singular>" + this.escape(unitTextSingular) + "</m12:Singular>" +
            "<m12:Plural>" + this.escape(unitTextPlural) + "</m12:Plural>" +
            "</m12:UnitTexts>";

        if (supplementaryText && supplementaryText.length > 0) {
            xml += "<m12:SupplementaryText>" + this.escape(supplementaryText) + "</m12:SupplementaryText>";
        }

        return xml;
    }

    protected generateMMANXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, dosageNS: string): string {

        let mmanMapping = this.parseMapping(mapping);
        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText);

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


    protected generateDailyXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean, dosageNS: string): string {

    
        if (mapping.indexOf("dag ") >= 0) {
            return this.generateXmlForSeparateDays(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, isPN, dosageNS);
        }
        else {
            return this.generateXmlForSameDay(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, isPN, dosageNS);
        }
    }

    private generateXmlForSameDay(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean, dosageNS: string): string {

        let splittedMapping = mapping.split(";");
        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText);

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
            if(isPN) {
                xml += "<" + dosageNS + ":IsAccordingToNeed/>";
            }
            xml += "</" + dosageNS + ":Dose>";
        }

        return xml;
    }

    private generateXmlForSeparateDays(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean, dosageNS: string): string {

        let regexp = /dag\s(\d+):\s(\d+(\.\d+)?(;\d+(\.\d+)?)?)/g;  /* Match på ex. "dag 1: 1", "dag 1: 1;2", "dag 1: 1 dag 2: 2" og "dag 1: 1;1 dag 2: 1;3" */
        let result: string[];
        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText);

        while ((result = regexp.exec(mapping)) != null) {
            let dayno = result[1];
            let quantity = result[2];

            xml += "<" + this.getNamespace() + ":Day><" + dosageNS + ":Number>" + dayno + "</" + dosageNS + ":Number>"
                + this.getQuantityString(quantity.split(";"), isPN, dosageNS)
                + "</" + this.getNamespace() + ":Day>";
        }

        return xml;
    }
}