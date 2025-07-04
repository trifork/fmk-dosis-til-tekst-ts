import { ShortTextConverterImpl } from "./shorttextconverterimpl/ShortTextConverterImpl";
import { AdministrationAccordingToSchemaConverterImpl } from "./shorttextconverterimpl/AdministrationAccordingToSchemaConverterImpl";
import { FreeTextConverterImpl } from "./shorttextconverterimpl/FreeTextConverterImpl";
import { MorningNoonEveningNightConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightConverterImpl";
import { SimpleLimitedAccordingToNeedConverterImpl } from "./shorttextconverterimpl/SimpleLimitedAccordingToNeedConverterImpl";
import { MorningNoonEveningNightAndAccordingToNeedConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightAndAccordingToNeedConverterImpl";
import { WeeklyMorningNoonEveningNightConverterImpl } from "./shorttextconverterimpl/WeeklyMorningNoonEveningNightConverterImpl";
import { RepeatedConverterImpl } from "./shorttextconverterimpl/RepeatedConverterImpl";
import { SimpleNonRepeatedConverterImpl } from "./shorttextconverterimpl/SimpleNonRepeatedConverterImpl";
import { MorningNoonEveningNightInNDaysConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightInNDaysConverterImpl";
import { SimpleAccordingToNeedConverterImpl } from "./shorttextconverterimpl/SimpleAccordingToNeedConverterImpl";
import { LimitedNumberOfDaysConverterImpl } from "./shorttextconverterimpl/LimitedNumberOfDaysConverterImpl";
import { WeeklyRepeatedConverterImpl } from "./shorttextconverterimpl/WeeklyRepeatedConverterImpl";
import { ParacetamolConverterImpl } from "./shorttextconverterimpl/ParacetamolConverterImpl";
import { MultipleDaysNonRepeatedConverterImpl } from "./shorttextconverterimpl/MultipleDaysNonRepeatedConverterImpl";
import { NumberOfWholeWeeksConverterImpl } from "./shorttextconverterimpl/NumberOfWholeWeeksConverterImpl";
import { DayInWeekConverterImpl } from "./shorttextconverterimpl/DayInWeekConverterImpl";
import { CombinedTwoPeriodesConverterImpl } from "./shorttextconverterimpl/CombinedTwoPeriodesConverterImpl";
import { textOptionFromString, TextOptions } from "./TextOptions";
import { LongTextConverterImpl } from "./longtextconverterimpl/LongTextConverterImpl";
import { Dosage } from "./dto/Dosage";
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { StructureHelper } from "./helpers/StructureHelper";

export class ShortTextConverter {

    public static MAX_LENGTH = 70;
    private static _converters: ShortTextConverterImpl[];
    private static _instance: ShortTextConverter = new ShortTextConverter();

    /**
     * Populate a list of implemented converters
     * Consider the order: The tests are evaluated in order, adding the most likely to succeed
     * first improves performance
     */

    constructor() {
        ShortTextConverter._converters = [
            new AdministrationAccordingToSchemaConverterImpl(),
            new FreeTextConverterImpl(),
            new MorningNoonEveningNightConverterImpl(),
            new WeeklyMorningNoonEveningNightConverterImpl(),
            new RepeatedConverterImpl(),
            new SimpleNonRepeatedConverterImpl(),
            new MorningNoonEveningNightInNDaysConverterImpl(),
            new SimpleAccordingToNeedConverterImpl(),
            new LimitedNumberOfDaysConverterImpl(),

            new SimpleLimitedAccordingToNeedConverterImpl(),
            new WeeklyRepeatedConverterImpl(),
            new ParacetamolConverterImpl(),
            new MorningNoonEveningNightAndAccordingToNeedConverterImpl(),
            new MultipleDaysNonRepeatedConverterImpl(),
            new NumberOfWholeWeeksConverterImpl(),
            new DayInWeekConverterImpl(),
            new CombinedTwoPeriodesConverterImpl()
        ];
    }


    public static getInstance(): ShortTextConverter { return ShortTextConverter._instance; }

    public getConverterClassNameStr(jsonStr: string): string {
        if (!jsonStr) {
            return null;
        }

        return this.getConverterClassName(JSON.parse(jsonStr));
    }

    public getConverterClassName(dosage: Dosage, maxLength = ShortTextConverter.MAX_LENGTH): string {
        for (const converter of ShortTextConverter._converters) {
            if (converter.canConvert(dosage) && converter.doConvert(dosage, TextOptions.STANDARD).length <= maxLength) {
                return converter.getConverterClassName();
            }
        }
        return null;
    }

    /**
     * Performs a conversion to a short text if possible. Otherwise null.
     * @param dosage
     * @return A short text string describing the dosage
     */
    public convert(dosage: Dosage, options: TextOptions = TextOptions.STANDARD, maxLength = ShortTextConverter.MAX_LENGTH): string {

        if (!dosage) {
            return null;
        }

        return ShortTextConverter.getInstance().doConvert(dosage, options, maxLength);
    }

    public convertStr(jsonStr: string, options: string = TextOptions.STANDARD.toString(), maxLength = ShortTextConverter.MAX_LENGTH) {

        if (!jsonStr) {
            return null;
        }

        return this.convert(JSON.parse(jsonStr), textOptionFromString(options), maxLength);
    }

    /**
    * @deprecated This method and the corresponding wrapper classes will be removed. Use convert(dosage: Dosage, ...) instead.
    */
    public convertWrapper(dosage: DosageWrapper, options: TextOptions = TextOptions.STANDARD, maxLength = ShortTextConverter.MAX_LENGTH): string {
        return ShortTextConverter.getInstance().doConvert(dosage.value, options, maxLength);
    }

    /**
     * Performs a conversion to a short text with a custom maximum length. Returns translation if possible, otherwise null.
     * @param dosage
     * @param maxLength
     * @return A short text string describing the dosage
     */
    public doConvert(dosage: Dosage, options: TextOptions, maxLength: number): string {

        dosage.structures?.structures.forEach(s => {
            s.supplText = StructureHelper.trimLeadingCommas(s.supplText);
        });

        if (LongTextConverterImpl.convertAsVKA(options)) {
            return null;
        }

        for (const converter of ShortTextConverter._converters) {
            if (converter.canConvert(dosage)) {
                const s = converter.doConvert(dosage, options);
                if (s && s.length <= maxLength)
                    return s;
            }
        }
        return null;
    }

    public canConvert(dosage: Dosage): boolean {
        for (const converter of ShortTextConverter._converters) {
            if (converter.canConvert(dosage)) {
                return true;
            }
        }
        return false;
    }
}
