import { DosageProposalXML } from "./DosageProposalXML";
import { DosisTilTekstException  } from "../DosisTilTekstException";
import { XMLGenerator  } from "./XMLGenerator";
import { XML140Generator  } from "./XML140Generator";

export enum FMKVersion {
    FMK140,
    FMK142,
    FMK144,
    FMK146
}

export class DosageProposalXMLGenerator {

    private static xml140Generator: XMLGenerator = new XML140Generator();

    public static generateXMLSnippet(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, fmkversion: FMKVersion): DosageProposalXML {

        let xml: string = DosageProposalXMLGenerator.getXMLGenerator(fmkversion).generateXml(type, iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText);

        // TODO: SHORT+LONG DOSAGETEXT
        return new DosageProposalXML(xml, "", "");
    }

    static getXMLGenerator(fmkversion: FMKVersion): XMLGenerator {
        switch(fmkversion) {
            case FMKVersion.FMK140:
                return DosageProposalXMLGenerator.xml140Generator;
            default:
                throw new DosisTilTekstException("Unexpected fmk version: " + fmkversion);
        }
    }

}