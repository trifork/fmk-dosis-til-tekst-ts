import { LongTextConverter } from "./LongTextConverter";
import { ShortTextConverter } from "./ShortTextConverter";
import { DailyDosisCalculator } from "./DailyDosisCalculator";
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { StructuresWrapper } from "./vowrapper/StructuresWrapper";
import { CombinedConversion } from "./CombinedConversion";
import { DailyDosis } from "./DailyDosis";
import { TextOptions } from "./TextOptions";

export class CombinedTextConverter {

    public static convertStr(jsonStr: string, options: string) {
        if (jsonStr === undefined || jsonStr === null) {
            return null;
        }

        return CombinedTextConverter.convert(JSON.parse(jsonStr), (<any>TextOptions)[options]);
    }

    public static convert(dosageJson: any, options: TextOptions): CombinedConversion {
        if (dosageJson === undefined || dosageJson === null) {
            return null;
        }

        let dosage: DosageWrapper = DosageWrapper.fromJsonObject(dosageJson);
        return CombinedTextConverter.convertWrapper(dosage, options);
    }

    public static convertWrapper(dosage: DosageWrapper, options: TextOptions) {
        let shortText = ShortTextConverter.getInstance().convertWrapper(dosage, options);
        let longText = LongTextConverter.getInstance().convertWrapper(dosage, options);
        let dailyDosis = DailyDosisCalculator.calculateWrapper(dosage);
        let periodTexts: Array<[string, string, DailyDosis]> = new Array<[string, string, DailyDosis]>();

        if (dosage.isStructured()) {
            for (let period of dosage.structures.getStructures()) {
                let structuresWithOnePeriod: StructuresWrapper = new StructuresWrapper(dosage.structures.getUnitOrUnits(), [period]);
                let dosageWrapperWithOnePeriod = DosageWrapper.makeStructuredDosage(structuresWithOnePeriod);
                let periodShortText = ShortTextConverter.getInstance().convertWrapper(dosageWrapperWithOnePeriod, options);
                let periodLongText = LongTextConverter.getInstance().convertWrapper(dosageWrapperWithOnePeriod, options);
                let dailyDosis = DailyDosisCalculator.calculateWrapper(dosageWrapperWithOnePeriod);
                periodTexts.push([periodShortText, periodLongText, dailyDosis]);
            }
        }

        return new CombinedConversion(shortText, longText, dailyDosis, periodTexts);
    }
}