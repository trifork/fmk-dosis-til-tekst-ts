import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";

export class XML140Generator extends AbstractXMLGenerator implements XMLGenerator {

    public generateXml(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string = undefined): string {
        let dosageElement: string =
            "<m12:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01 ../../../2012/06/01/Dosage.xsd\" " +
            "xmlns:m12=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m12:Structure>";

        let subElement: string;

        switch (type) {
            case "M+M+A+N":
                subElement = this.generateMMANXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText);
                break;
            case "N daglig":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, false);
                break;
            case "PN":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, true);
                break;
            default:
                throw new DosisTilTekstException("No support for type value '" + type + "'");
        }

        return dosageElement + subElement + "</m12:Structure></m12:Dosage>";
    }

    private generateCommonXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string): string {
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

    private generateMMANXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string): string {

        let mmanMapping = this.parseMapping(mapping);
        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText);

        xml += "<m12:Day>" +
            "<m12:Number>1</m12:Number>";

        if (mmanMapping.getMorning()) {
            xml += "<m12:Dose>"
                + "<m12:Time>morning</m12:Time>"
                + "<m12:Quantity>" + mmanMapping.getMorning() + "</m12:Quantity>"
                + "</m12:Dose>";
        }

        if (mmanMapping.getNoon()) {
            xml += "<m12:Dose>"
                + "<m12:Time>noon</m12:Time>"
                + "<m12:Quantity>" + mmanMapping.getNoon() + "</m12:Quantity>"
                + "</m12:Dose>";
        }

        if (mmanMapping.getEvening()) {
            xml += "<m12:Dose>"
                + "<m12:Time>evening</m12:Time>"
                + "<m12:Quantity>" + mmanMapping.getEvening() + "</m12:Quantity>"
                + "</m12:Dose>";
        }

        if (mmanMapping.getNight()) {
            xml += "<m12:Dose>"
                + "<m12:Time>night</m12:Time>"
                + "<m12:Quantity>" + mmanMapping.getNight() + "</m12:Quantity>"
                + "</m12:Dose>";
        }

        xml += "</m12:Day>";

        return xml;
    }


    private generateDailyXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean): string {

    
        if (mapping.indexOf("dag ") >= 0) {
            return this.generateXmlForSeparateDays(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, isPN);
        }
        else {
            return this.generateXmlForSameDay(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, isPN);
        }
    }

    private generateXmlForSameDay(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean): string {

        let splittedMapping = mapping.split(";");
        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText);

        xml += "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            this.getQuantityString(splittedMapping, isPN) +
            "</m12:Day>";

        return xml;
    }

    private getQuantityString(quantities: string[], isPN: boolean): string {
        let xml = "";

        for (let dose of quantities) {
            xml += "<m12:Dose><m12:Quantity>" + dose + "</m12:Quantity>";
            if(isPN) {
                xml += "<m12:IsAccordingToNeed/>";
            }
            xml += "</m12:Dose>";
        }

        return xml;
    }

    private generateXmlForSeparateDays(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, isPN: boolean): string {

        let regexp = /dag\s(\d+):\s(\d+(\.\d+)?(;\d+(\.\d+)?)?)/g;  /* Match på ex. "dag 1: 1", "dag 1: 1;2", "dag 1: 1 dag 2: 2" og "dag 1: 1;1 dag 2: 1;3" */
        let result: string[];
        let xml = this.generateCommonXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText);

        while ((result = regexp.exec(mapping)) != null) {
            let dayno = result[1];
            let quantity = result[2];

            xml += "<m12:Day><m12:Number>" + dayno + "</m12:Number>"
                + this.getQuantityString(quantity.split(";"), isPN)
                + "</m12:Day>";
        }

        return xml;
    }
}