import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";
import { XML140Generator } from "./XML140Generator";
import { TextHelper } from "../TextHelper";

export class XML142Generator extends XML140Generator implements XMLGenerator {

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected getNamespace(): string {
        return "m13";
    }

    public generateXml(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, beginDate: Date, endDate: Date, supplementaryText?: string): string {
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
                subElement = this.generateMMANXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, "m12", beginDate, endDate);
                break;
            case "N daglig":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, false, "m12", beginDate, endDate);
                break;
            case "PN":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, true, "m12", beginDate, endDate);
                break;
            default:
                throw new DosisTilTekstException("No support for type value '" + type + "'");
        }

        return dosageElement + subElement + "</m13:Structure></m13:Structures></m13:Dosage>";
    }

    protected generateCommonXml(iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, beginDate: Date, endDate: Date): string {
        let xml = "<" + this.getNamespace() + ":Structure>";

        if (iteration === 0) {
            xml += "<" + this.getNamespace() + ":NotIterated/>";
        }
        else {
            xml += "<" + this.getNamespace() + ":IterationInterval>" + iteration + "</" + this.getNamespace() + ":IterationInterval>";
        }

        xml += "<" + this.getNamespace() + ":StartDate>" + TextHelper.formatYYYYMMDD(beginDate) + "</" + this.getNamespace() + ":StartDate>" +
            "<" + this.getNamespace() + ":EndDate>" + TextHelper.formatYYYYMMDD(endDate) + "</" + this.getNamespace() + ":EndDate>";

        if (supplementaryText && supplementaryText.length > 0) {
            xml += "<" + this.getNamespace() + ":SupplementaryText>" + this.escape(supplementaryText) + "</" + this.getNamespace() + ":SupplementaryText>";
        }

        return xml;
    }
}