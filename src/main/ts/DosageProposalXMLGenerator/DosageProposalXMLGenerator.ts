import { DosageProposalXML } from "./DosageProposalXML";
import { XMLGenerator } from "./XMLGenerator";
import { XML144Generator } from "./XML144Generator";
import { XML144E2Generator } from "./XML144E2Generator";
import { XML144E4Generator } from "./XML144E4Generator";
import { XML146Generator } from "./XML146Generator";
import { XML146E2Generator } from "./XML146E2Generator";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { ShortTextConverter } from "../ShortTextConverter";
import { LongTextConverter } from "../LongTextConverter";
import { DosagePeriod } from "./DosagePeriod";
import { TextOptions } from "../TextOptions";
import { Day, Dosage, Dose, EveningDose, MorningDose, NightDose, NoonDose, PlainDose, Structure } from "../dto/Dosage";
import { formatDateOnly } from "../DateUtil";

export class DosageProposalXMLGenerator {

    private static readonly xml144Generator: XML144Generator = new XML144Generator();
    private static readonly xml144E2Generator: XML144E2Generator = new XML144E2Generator();
    private static readonly xml144E4Generator: XML144E4Generator = new XML144E4Generator();
    private static readonly xml146Generator: XML146Generator = new XML146Generator();
    private static readonly xml146E2Generator: XML146E2Generator = new XML146E2Generator();

    private static readonly dosageProposalXMLGeneratorVersion = 1;

    public static getPeriodStrings(s: string): string[] {
        const firstBracePos = s.indexOf("{");
        if (firstBracePos === -1) {
            // Only one period without braces
            return [s];
        }

        const periods: Array<string> = [];
        let openBracePos: number = 0;
        let closeBracePos: number = 0;

        while (closeBracePos < s.length - 1) {
            openBracePos = s.indexOf("{", closeBracePos);
            closeBracePos = s.indexOf("}", openBracePos);
            if (closeBracePos === -1) {
                throw new Error("Mismatching {} braces in period string " + s);
            }
            periods.push(s.substr(openBracePos + 1, closeBracePos - openBracePos - 1));
        }

        return periods;
    }


    public static generateXMLSnippet(type: string, iteration: string, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, beginDates: Date[], endDates: (Date | null |undefined)[], fmkversion: string, dosageProposalVersion: number, shortTextMaxLength: number = ShortTextConverter.MAX_LENGTH): DosageProposalXML {

        if (dosageProposalVersion !== DosageProposalXMLGenerator.dosageProposalXMLGeneratorVersion) {
            throw new Error("Unsupported dosageProposalXMLGeneratorVersion, only version " + DosageProposalXMLGenerator.dosageProposalXMLGeneratorVersion + " is supported");
        }

        const periodTypes: string[] = DosageProposalXMLGenerator.getPeriodStrings(type);
        const periodMappings: string[] = DosageProposalXMLGenerator.getPeriodStrings(mapping);
        const periodIterations: number[] = DosageProposalXMLGenerator.getPeriodStrings(iteration).map(i => parseInt(i));

        if (periodTypes.length !== periodMappings.length) {
            throw new Error("Number of periods in 'type' argument " + periodTypes.length + " differs from number of periods in 'mapping' argument " + periodMappings.length);
        }

        if (periodTypes.length !== beginDates.length) {
            throw new Error("Number of periods in 'type' argument " + periodTypes.length + " differs from number of periods in 'beginDates' argument " + beginDates.length);
        }


        if (periodTypes.length !== endDates.length) {
            throw new Error("Number of periods in 'type' argument " + periodTypes.length + " differs from number of periods in 'endDates' argument " + endDates.length);
        }

        if (periodTypes.length !== periodIterations.length) {
            throw new Error("Number of periods in 'type' argument " + periodTypes.length + " differs from number of periods in 'iteration' argument " + periodIterations.length);
        }


        const periods: Structure[] = [];
        const dosagePeriods: DosagePeriod[] = [];

        for (let periodNo = 0; periodNo < periodTypes.length; periodNo++) {
            const structure: Structure = {
                iterationInterval: periodIterations[periodNo],
                startDate: formatDateOnly(beginDates[periodNo]),
                supplText: supplementaryText,
                days: DosageProposalXMLGenerator.getDays(periodTypes[periodNo], periodMappings[periodNo])
            };
            if (endDates[periodNo]) {
                structure.endDate = formatDateOnly(endDates[periodNo]);
            }
            periods.push(structure);

            dosagePeriods.push(new DosagePeriod(periodTypes[periodNo], periodMappings[periodNo], periodIterations[periodNo], beginDates[periodNo], endDates[periodNo]));
        }

        const xml: string = DosageProposalXMLGenerator.getXMLGenerator(fmkversion).generateXml(dosagePeriods, unitTextSingular, unitTextPlural, supplementaryText);

        const dosage: Dosage = {
            structures: {
                startDate: undefined,
                endDate: undefined,
                unitOrUnits: {
                    unit: undefined,
                    unitSingular: unitTextSingular,
                    unitPlural: unitTextPlural
                },
                structures: periods,
                isPartOfMultiPeriodDosage: false
            }
        };

        return new DosageProposalXML(xml, ShortTextConverter.getInstance().convert(dosage, TextOptions.STANDARD, shortTextMaxLength), LongTextConverter.getInstance().convert(dosage, TextOptions.STANDARD));
    }

    static isMMAN(type: string): boolean {
        return type === "M+M+A+N";
    }

    static getMMANDoses(mapping: string): Dose[] {
        const doses: Dose[] = [];
        const mmanMapping = AbstractXMLGenerator.parseMapping(mapping);
        if (mmanMapping.getMorning()) {
            const morningDose: MorningDose = {
                type: "MorningDoseWrapper",
                doseQuantity: mmanMapping.getMorning(),
                isAccordingToNeed: false
            };
            doses.push(morningDose);
        }
        if (mmanMapping.getNoon()) {
            const noonDose: NoonDose = {
                type: "NoonDoseWrapper",
                doseQuantity: mmanMapping.getNoon(),
                isAccordingToNeed: false
            };
            doses.push(noonDose);
        }
        if (mmanMapping.getEvening()) {
            const eveningDose: EveningDose = {
                type: "EveningDoseWrapper",
                doseQuantity: mmanMapping.getEvening(),
                isAccordingToNeed: false
            };
            doses.push(eveningDose);
        }
        if (mmanMapping.getNight()) {
            const nightDose: NightDose = {
                type: "NightDoseWrapper",
                doseQuantity: mmanMapping.getNight(),
                isAccordingToNeed: false
            };
            doses.push(nightDose);
        }

        return doses;
    }

    static getDays(type: string, mapping: string): Day[] {

        let days: Day[];
        if (DosageProposalXMLGenerator.isMMAN(type) && (mapping.indexOf("dag ") < 0)) {
            const doses: Dose[] = DosageProposalXMLGenerator.getMMANDoses(mapping);
            days = [{ dayNumber: 1, allDoses: doses }];
        }
        else {
            if (mapping.indexOf("dag ") >= 0) {
                let result: string[];
                days = [];

                while ((result = this.xml146Generator.daysMappingRegExp.exec(mapping)) != null) {
                    const dayno = parseInt(result[1]);

                    if (DosageProposalXMLGenerator.isMMAN(type)) {
                        const doses: Dose[] = DosageProposalXMLGenerator.getMMANDoses(result[2]);
                        const day: Day = { dayNumber: dayno, allDoses: doses};
                        days.push(day);
                    }
                    else {

                        const day: Day = { dayNumber: dayno, allDoses: DosageProposalXMLGenerator.getDoses(result[2], type) };
                        days.push(day);
                    }
                }
            }
            else {
                const day: Day = { dayNumber: 1, allDoses: DosageProposalXMLGenerator.getDoses(mapping, type)};
                days = [day];
            }
        }

        return days;
    }

    private static getDoses(quantity: string, type: string): Dose[] {
        const splittedQuantity = quantity.split(";");
        const doses: Dose[] = [];
        for (const quantity of splittedQuantity) {
            const plainDose: PlainDose = {
                type: "PlainDoseWrapper",
                doseQuantity: parseFloat(quantity),
                isAccordingToNeed: type === "PN"
            };
            doses.push(plainDose);
        }

        return doses;
    }

    static getXMLGenerator(fmkversion: string): XMLGenerator {

        switch (fmkversion) {
            case "FMK144":
                return DosageProposalXMLGenerator.xml144Generator;
            case "FMK144E2":
                return DosageProposalXMLGenerator.xml144E2Generator;
            case "FMK144E4":
                return DosageProposalXMLGenerator.xml144E4Generator;
            case "FMK146":
                return DosageProposalXMLGenerator.xml146Generator;
            case "FMK146E2":
                return DosageProposalXMLGenerator.xml146E2Generator;
            default:
                throw new Error("Unexpected fmk version: " + fmkversion);
        }
    }
}