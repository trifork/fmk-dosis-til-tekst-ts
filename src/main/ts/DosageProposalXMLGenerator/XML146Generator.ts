import { DosisTilTekstException } from "../DosisTilTekstException";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { XMLGenerator } from "./XMLGenerator";
import { XML144Generator } from "./XML144Generator";
import { DosagePeriod } from "./DosagePeriod";

export class XML146Generator extends XML144Generator implements XMLGenerator {

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected getNamespace(): string {
        return "m16";
    }

    public generateXml(periods: DosagePeriod[], unitTextSingular: string, unitTextPlural: string, supplementaryText?: string): string {
        let dosageElement: string =
            "<m16:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2015/06/01 ../../../2015/06/01/DosageForRequest.xsd\" " +
            "xmlns:m16=\"http://www.dkma.dk/medicinecard/xml.schema/2015/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m16:UnitTexts source=\"Doseringsforslag\">" +
            "<m16:Singular>" + this.escape(unitTextSingular) + "</m16:Singular>" +
            "<m16:Plural>" + this.escape(unitTextPlural) + "</m16:Plural>" +
            "</m16:UnitTexts>";

        let fixedPeriods = periods.filter(p => p.getType() !== "PN");
        let pnPeriods = periods.filter(p => p.getType() === "PN");

        if (fixedPeriods.length > 0) {
            dosageElement += "<" + this.getNamespace() + ":StructuresFixed>";
            dosageElement += this.generateStructuresXml(fixedPeriods, unitTextSingular, unitTextPlural, supplementaryText);
            dosageElement += "</" + this.getNamespace() + ":StructuresFixed>";
        }

        if (pnPeriods.length > 0) {
            dosageElement += "<" + this.getNamespace() + ":StructuresAccordingToNeed>";
            dosageElement += this.generateStructuresXml(pnPeriods, unitTextSingular, unitTextPlural, supplementaryText);
            dosageElement += "</" + this.getNamespace() + ":StructuresAccordingToNeed>";
        }

        return dosageElement + "</" + this.getNamespace() + ":Dosage>";
    }

    protected getQuantityString(quantities: string[], isPN: boolean, dosageNS: string): string {
        let xml = "";

        for (let dose of quantities) {
            xml += "<" + dosageNS + ":Dose><" + dosageNS + ":Quantity>" + dose + "</" + dosageNS + ":Quantity>" + "</" + dosageNS + ":Dose>";
        }

        return xml;
    }
}