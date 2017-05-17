import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";
import { XML144Generator } from "./XML144Generator";

export class XML146Generator extends XML144Generator implements XMLGenerator {

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected getNamespace(): string {
        return "m16";
    }


    public generateXml(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, beginDate: Date, endDate: Date, supplementaryText?: string): string {
        let dosageElement: string =
            "<m16:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2015/06/01 ../../../2015/06/01/DosageForRequest.xsd\" " +
            "xmlns:m16=\"http://www.dkma.dk/medicinecard/xml.schema/2015/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m16:UnitTexts source=\"Doseringsforslag\">" +
            "<m16:Singular>" + this.escape(unitTextSingular) + "</m16:Singular>" +
            "<m16:Plural>" + this.escape(unitTextPlural) + "</m16:Plural>" +
            "</m16:UnitTexts>";

        if (type === "PN") {
            dosageElement += "<m16:StructuresAccordingToNeed>";
        }
        else {
            dosageElement += "<m16:StructuresFixed>";
        }

        let subElement: string;

        switch (type) {
            case "M+M+A+N":
                subElement = this.generateMMANXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, "m16", beginDate, endDate);
                break;
            case "N daglig":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, false, "m16", beginDate, endDate);
                break;
            case "PN":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, true, "m16", beginDate, endDate);
                break;
            default:
                throw new DosisTilTekstException("No support for type value '" + type + "'");
        }

        dosageElement += (subElement + "</m16:Structure>");

        if (type === "PN") {
            dosageElement += "</m16:StructuresAccordingToNeed>";
        }
        else {
            dosageElement += "</m16:StructuresFixed>";
        }
        dosageElement += "</m16:Dosage>";

        return dosageElement;
    }

    protected getQuantityString(quantities: string[], isPN: boolean, dosageNS: string): string {
        let xml = "";

        for (let dose of quantities) {
            xml += "<" + dosageNS + ":Dose><" + dosageNS + ":Quantity>" + dose + "</" + dosageNS + ":Quantity>" + "</" + dosageNS + ":Dose>";
        }

        return xml;
    }
}