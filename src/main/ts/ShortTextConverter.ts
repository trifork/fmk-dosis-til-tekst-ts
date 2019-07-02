import { ShortTextConverterImpl } from "./shorttextconverterimpl/ShortTextConverterImpl";
import { AdministrationAccordingToSchemaConverterImpl } from "./shorttextconverterimpl/AdministrationAccordingToSchemaConverterImpl";
import { FreeTextConverterImpl } from "./shorttextconverterimpl/FreeTextConverterImpl";
import { MorningNoonEveningNightEyeOrEarConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightEyeOrEarConverterImpl";
import { MorningNoonEveningNightConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightConverterImpl";
import { SimpleLimitedAccordingToNeedConverterImpl } from "./shorttextconverterimpl/SimpleLimitedAccordingToNeedConverterImpl";
import { MorningNoonEveningNightAndAccordingToNeedConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightAndAccordingToNeedConverterImpl";
import { WeeklyMorningNoonEveningNightConverterImpl } from "./shorttextconverterimpl/WeeklyMorningNoonEveningNightConverterImpl";
import { RepeatedEyeOrEarConverterImpl } from "./shorttextconverterimpl/RepeatedEyeOrEarConverterImpl";
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
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { TextHelper } from "./TextHelper";

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
            new MorningNoonEveningNightEyeOrEarConverterImpl(),
            new MorningNoonEveningNightConverterImpl(),
            new WeeklyMorningNoonEveningNightConverterImpl(),
            new RepeatedEyeOrEarConverterImpl(),
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

    public getConverterClassName(dosageJson: any, maxLength = ShortTextConverter.MAX_LENGTH): string {
        return this.getConverterClassNameWrapper(DosageWrapper.fromJsonObject(dosageJson), maxLength);
    }

    public getConverterClassNameStr(jsonStr: string): string {
        if (jsonStr === undefined || jsonStr === null) {
            return null;
        }

        return this.getConverterClassName(JSON.parse(jsonStr));
    }

    public getConverterClassNameWrapper(dosage: DosageWrapper, maxLength: number): string {
        for (let converter of ShortTextConverter._converters) {
            if (converter.canConvert(dosage)) {

                let s: string = converter.doConvert(dosage);
                if (s.length <= maxLength) {
                    return converter.constructor["name"];
                } else if (this.notRepeatedHasBeenAdded(dosage, s, maxLength)) {
                    return converter.constructor["name"];
                }
            }
        }
        return null;
    }

    public notRepeatedHasBeenAdded(dosage: DosageWrapper, s: string, maxLength: number): boolean {
        return s.indexOf(TextHelper.NOT_REPEATED) >= 0 && s.length - TextHelper.NOT_REPEATED.length < maxLength && dosage.hasNotIteratedDosageStructure();
    }

    /**
	 * Performs a conversion to a short text if possible. Otherwise null.
	 * @param dosage
	 * @return A short text string describing the dosage
	 */
    public convertWrapper(dosage: DosageWrapper, maxLength = ShortTextConverter.MAX_LENGTH): string {
        return ShortTextConverter.getInstance().doConvert(dosage, maxLength);
    }

    public convert(dosageJson: any, maxLength = ShortTextConverter.MAX_LENGTH): string {

        if (dosageJson === undefined || dosageJson === null) {
            return null;
        }

        let dosage = DosageWrapper.fromJsonObject(dosageJson);
        return ShortTextConverter.getInstance().doConvert(dosage, maxLength);
    }

    public convertStr(jsonStr: string, maxLength = ShortTextConverter.MAX_LENGTH) {

        if (jsonStr === undefined || jsonStr === null) {
            return null;
        }

        return this.convert(JSON.parse(jsonStr), maxLength);
    }


    /**
	 * Performs a conversion to a short text with a custom maximum length. Returns translation if possible, otherwise null.
	 * @param dosage
	 * @param maxLength
	 * @return A short text string describing the dosage
	 */
    public doConvert(dosage: DosageWrapper, maxLength: number): string {
        for (let converter of ShortTextConverter._converters) {
            if (converter.canConvert(dosage)) {
                let s = converter.doConvert(dosage);

                if (s) {

                    if (s.length <= maxLength) {
                        return s;
                    }
                    else if (this.notRepeatedHasBeenAdded(dosage, s, maxLength) && s.length - TextHelper.NOT_REPEATED.length <= maxLength) {
                        // In case we have added "(gentages ikke)", but it causes the shorttext to be too long, remove it again in case it fits without
                        let indexNotRepeated = s.indexOf(TextHelper.NOT_REPEATED);
                        return s.substr(0, indexNotRepeated) + s.substr(indexNotRepeated + TextHelper.NOT_REPEATED.length);
                    }
                }
            }
        }
        return null;
    }

    public canConvert(dosage: DosageWrapper): boolean {
        for (let converter of ShortTextConverter._converters) {
            if (converter.canConvert(dosage)) {
                return true;
            }
        }
        return false;
    }
}
