import { DosageProposalXML } from "./DosageProposalXML";
import { DosisTilTekstException } from "../DosisTilTekstException";
import { XMLGenerator } from "./XMLGenerator";
import { XML140Generator } from "./XML140Generator";
import { XML142Generator } from "./XML142Generator";
import { XML144Generator } from "./XML144Generator";
import { XML146Generator } from "./XML146Generator";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { ShortTextConverter } from "../ShortTextConverter";
import { LongTextConverter } from "../LongTextConverter";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructuresWrapper } from "../vowrapper/StructuresWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { MorningDoseWrapper } from "../vowrapper/MorningDoseWrapper";
import { NoonDoseWrapper } from "../vowrapper/NoonDoseWrapper";
import { EveningDoseWrapper } from "../vowrapper/EveningDoseWrapper";
import { NightDoseWrapper } from "../vowrapper/NightDoseWrapper";
import { PlainDoseWrapper } from "../vowrapper/PlainDoseWrapper";

export enum FMKVersion {
    FMK140,
    FMK142,
    FMK144,
    FMK146
}

export class DosageProposalXMLGenerator {

    private static readonly xml140Generator: XML140Generator = new XML140Generator();
    private static readonly xml142Generator: XML142Generator = new XML142Generator();
    private static readonly xml144Generator: XML144Generator = new XML144Generator();
    private static readonly xml146Generator: XML146Generator = new XML146Generator();

    private static readonly dosageProposalXMLGeneratorVersion = 1;

    public static generateXMLSnippet(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, beginDate: Date, endDate: Date, fmkversion: FMKVersion, dosageProposalVersion: number): DosageProposalXML {

        if(dosageProposalVersion !== DosageProposalXMLGenerator.dosageProposalXMLGeneratorVersion) {
            throw new Error("Unsupported dosageProposalXMLGeneratorVersion, only version " + DosageProposalXMLGenerator.dosageProposalXMLGeneratorVersion + " is supported");
        }

        let xml: string = DosageProposalXMLGenerator.getXMLGenerator(fmkversion).generateXml(type, iteration, mapping, unitTextSingular, unitTextPlural, beginDate, endDate, supplementaryText);

        let dosageWrapper: DosageWrapper = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, unitTextSingular, unitTextPlural),
            [new StructureWrapper(iteration, supplementaryText, new DateOrDateTimeWrapper(beginDate, undefined), new DateOrDateTimeWrapper(endDate, undefined), DosageProposalXMLGenerator.getDayWrappers(type, mapping), undefined)]
        ));

        return new DosageProposalXML(xml, ShortTextConverter.getInstance().convertWrapper(dosageWrapper), LongTextConverter.getInstance().convertWrapper(dosageWrapper));
    }

    static getDayWrappers(type: string, mapping: string): DayWrapper[] {


        let dayWrappers: DayWrapper[];
        if (type === "M+M+A+N") {
            let doses: DoseWrapper[] = [];
            let mmanMapping = AbstractXMLGenerator.parseMapping(mapping);
            if (mmanMapping.getMorning()) {
                doses.push(new MorningDoseWrapper(mmanMapping.getMorning(), undefined, undefined, undefined, undefined, undefined, false));
            }
            if (mmanMapping.getNoon()) {
                doses.push(new NoonDoseWrapper(mmanMapping.getNoon(), undefined, undefined, undefined, undefined, undefined, false));
            }
            if (mmanMapping.getEvening()) {
                doses.push(new EveningDoseWrapper(mmanMapping.getEvening(), undefined, undefined, undefined, undefined, undefined, false));
            }
            if (mmanMapping.getNight()) {
                doses.push(new NightDoseWrapper(mmanMapping.getNight(), undefined, undefined, undefined, undefined, undefined, false));
            }

            dayWrappers = [new DayWrapper(1, doses)];
        }
        else {
            if (mapping.indexOf("dag ") >= 0) {
                let result: string[];
                dayWrappers = [];

                while ((result = this.xml146Generator.daysMappingRegExp.exec(mapping)) != null) {
                    let dayno = parseInt(result[1]);
                    console.log(dayno);
                    let day: DayWrapper = new DayWrapper(dayno, DosageProposalXMLGenerator.getDoses(result[2], type));
                    dayWrappers.push(day);
                }
            }
            else {
                let day: DayWrapper = new DayWrapper(1, DosageProposalXMLGenerator.getDoses(mapping, type));
                dayWrappers = [day];
            }
        }

        return dayWrappers;
    }

    private static getDoses(quantity: string, type: string): DoseWrapper[] {
        let splittedQuantity = quantity.split(";");
        let doses: DoseWrapper[] = [];
        for (let quantity of splittedQuantity) {
            doses.push(new PlainDoseWrapper(parseFloat(quantity), undefined, undefined, undefined, undefined, undefined, type === "PN"));
        }

        return doses;
    }

    static getXMLGenerator(fmkversion: FMKVersion): XMLGenerator {
        switch (fmkversion) {
            case FMKVersion.FMK140:
                return DosageProposalXMLGenerator.xml140Generator;
            case FMKVersion.FMK142:
                return DosageProposalXMLGenerator.xml142Generator;
            case FMKVersion.FMK144:
                return DosageProposalXMLGenerator.xml144Generator;
            case FMKVersion.FMK146:
                return DosageProposalXMLGenerator.xml146Generator;
            default:
                throw new Error("Unexpected fmk version: " + fmkversion);
        }
    }
}