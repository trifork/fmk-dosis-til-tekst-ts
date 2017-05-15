import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";
import { XML142Generator } from "./XML142Generator";

export class XML144Generator extends XML142Generator implements XMLGenerator {

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected getNamespace(): string {
        return "m15";
    }


    public generateXml(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText?: string): string {
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

        let subElement: string;

        switch (type) {
            case "M+M+A+N":
                subElement = this.generateMMANXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, "m15");
                break;
            case "N daglig":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, false, "m15");
                break;
            case "PN":
                subElement = this.generateDailyXml(iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, true, "m15");
                break;
            default:
                throw new DosisTilTekstException("No support for type value '" + type + "'");
        }

        return dosageElement + subElement + "</m15:Structure></m15:Structures></m15:Dosage>";
    }
}