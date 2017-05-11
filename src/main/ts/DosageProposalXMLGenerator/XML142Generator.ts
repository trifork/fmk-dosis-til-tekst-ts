import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";
import { XML140Generator } from "./XML140Generator";

export class XML142Generator extends XML140Generator implements XMLGenerator {

    protected getDayNamespace(): string {
        return "m13";
    }


    public generateXml(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string = undefined): string {
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

        return dosageElement + subElement + "</m13:Structure></m13:Structures></m13:Dosage>";
    }

    protected generateCommonXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string): string {
        let xml = "<m13:Structure>";

        if (iteration === 0) {
            xml += "<m13:NotIterated/>";
        }
        else {
            xml += "<m13:IterationInterval>" + iteration + "</m13:IterationInterval>";
        }

        xml += "<m13:StartDate>2010-01-01</m13:StartDate>" +
            "<m13:EndDate>2110-01-01</m13:EndDate>";

        if (supplementaryText && supplementaryText.length > 0) {
            xml += "<m13:SupplementaryText>" + this.escape(supplementaryText) + "</m13:SupplementaryText>";
        }

        return xml;
    }
}