import { LongTextConverter } from "./LongTextConverter";
import { ShortTextConverter } from "./ShortTextConverter";
import { DailyDosisCalculator } from "./DailyDosisCalculator";
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { StructuresWrapper } from "./vowrapper/StructuresWrapper";
import { CombinedConversion } from "./CombinedConversion";
import { DailyDosis } from "./DailyDosis";

export class CombinedTextConverter {

    public static convertStr(jsonStr: string) {
        if (jsonStr === undefined || jsonStr === null) {
            return null;
        }

        return CombinedTextConverter.convert(JSON.parse(jsonStr));
    }

    public static convert(dosageJson: any): CombinedConversion {
        if (dosageJson === undefined || dosageJson === null) {
            return null;
        }

        let dosage: DosageWrapper = DosageWrapper.fromJsonObject(dosageJson);
        return CombinedTextConverter.convertWrapper(dosage);
    }

    public static convertWrapper(dosage: DosageWrapper) {
        let shortText = ShortTextConverter.getInstance().convertWrapper(dosage);
        let longText = LongTextConverter.getInstance().convertWrapper(dosage);
        let dailyDosis = DailyDosisCalculator.calculateWrapper(dosage);
        let periodTexts: Array<[string, string, DailyDosis]> = new Array<[string, string, DailyDosis]>();

        if (dosage.isStructured()) {
            for (let period of dosage.structures.getStructures()) {
                let structuresWithOnePeriod: StructuresWrapper = new StructuresWrapper(dosage.structures.getUnitOrUnits(), [period]);
                let dosageWrapperWithOnePeriod = DosageWrapper.makeStructuredDosage(structuresWithOnePeriod);
                let periodShortText = ShortTextConverter.getInstance().convertWrapper(dosageWrapperWithOnePeriod);
                let periodLongText = LongTextConverter.getInstance().convertWrapper(dosageWrapperWithOnePeriod);
                let dailyDosis = DailyDosisCalculator.calculateWrapper(dosageWrapperWithOnePeriod);
                periodTexts.push([periodShortText, periodLongText, dailyDosis]);
            }
        }

        return new CombinedConversion(shortText, longText, dailyDosis, periodTexts);
    }
}