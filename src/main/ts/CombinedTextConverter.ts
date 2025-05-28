import { LongTextConverter } from "./LongTextConverter";
import { ShortTextConverter } from "./ShortTextConverter";
import { DailyDosisCalculator } from "./DailyDosisCalculator";
import { CombinedConversion } from "./CombinedConversion";
import { DailyDosis } from "./DailyDosis";
import { TextOptions } from "./TextOptions";
import { Dosage, Structure, Structures } from "./dto/Dosage";

export class CombinedTextConverter {

    public static convertStr(jsonStr: string, options: string) {
        if (!jsonStr) {
            return null;
        }

        return CombinedTextConverter.convert(JSON.parse(jsonStr), (<any>TextOptions)[options]);
    }

    public static convert(dosage: Dosage, options?: TextOptions): CombinedConversion {
        if (!dosage) {
            return null;
        }

        let shortText = ShortTextConverter.getInstance().convert(dosage, options);
        let longText = LongTextConverter.getInstance().convert(dosage, options);
        let dailyDosis = DailyDosisCalculator.calculate(dosage);
        let periodTexts: Array<[string, string, DailyDosis]> = new Array<[string, string, DailyDosis]>();

        if (dosage.structures) {
            for (let period of dosage.structures.structures) {
                // let structuresWithOnePeriod: Structures = new StructuresWrapper(dosage.structures.unitOrUnits, dosage.structures.startDateOrDateTime, dosage.structures.endDateOrDateTime, [period], true);
                // let dosageWrapperWithOnePeriod = DosageWrapper.makeStructure(structuresWithOnePeriod);
                const structuresWithOnePeriod: Structures = {
                    unitOrUnits: dosage.structures.unitOrUnits,
                    startDateOrDateTime: dosage.structures.startDateOrDateTime,
                    endDateOrDateTime: dosage.structures.endDateOrDateTime,
                    structures: [period],
                    isPartOfMultiPeriodDosage: true};
                const dosageWithOnePeriod: Dosage = { structures: structuresWithOnePeriod };

                const periodShortText = ShortTextConverter.getInstance().convert(dosageWithOnePeriod, options);
                const periodLongText = LongTextConverter.getInstance().convert(dosageWithOnePeriod, options);
                const dailyDosis = DailyDosisCalculator.calculate(dosageWithOnePeriod);
                periodTexts.push([periodShortText, periodLongText, dailyDosis]);
            }
        }

        return new CombinedConversion(shortText, longText, dailyDosis, periodTexts);
    }
}