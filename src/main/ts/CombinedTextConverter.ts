import { CombinedConversion } from "./CombinedConversion";
import { DailyDosis } from "./DailyDosis";
import { DailyDosisCalculator } from "./DailyDosisCalculator";
import { LongTextConverter } from "./LongTextConverter";
import { ShortTextConverter } from "./ShortTextConverter";
import { textOptionFromString, TextOptions } from "./TextOptions";
import { Dosage, Structures } from "./dto/Dosage";

export class CombinedTextConverter {

    public static convertStr(jsonStr: string, options: string) {
        if (!jsonStr) {
            return null;
        }

        return CombinedTextConverter.convert(JSON.parse(jsonStr), textOptionFromString(options));
    }

    public static convert(dosage: Dosage, options?: TextOptions): CombinedConversion {
        if (!dosage) {
            return null;
        }

        const shortText = ShortTextConverter.getInstance().convert(dosage, options);
        const longText = LongTextConverter.getInstance().convert(dosage, options);
        const dailyDosis = DailyDosisCalculator.calculate(dosage);
        const periodTexts: Array<[string, string, DailyDosis]> = new Array<[string, string, DailyDosis]>();

        if (dosage.structures) {
            for (const period of dosage.structures.structures) {
                const structuresWithOnePeriod: Structures = {
                    unitOrUnits: dosage.structures.unitOrUnits,
                    startDate: dosage.structures.startDate,
                    endDate: dosage.structures.endDate,
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