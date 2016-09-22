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

export class ShortTextConverter {

    private static MAX_LENGTH = 70;

    private static _converters: ShortTextConverterImpl[];

	/**
	 * Populate a list of implemented converters 
	 * Consider the order: The tests are evaluated in order, adding the most likely to succeed
	 * first improves performance
	 */

    private static get converters() {
        if (!ShortTextConverter._converters) {
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

        return ShortTextConverter._converters;
    }

    public getConverterClassName(dosageJson: any): string {
        return this.getConverterClassNameWrapper(DosageWrapper.fromJsonObject(dosageJson));
    }

    public getConverterClassNameWrapper(dosage: DosageWrapper): string {
        for (let converter of ShortTextConverter.converters) {
            if (converter.canConvert(dosage) && converter.doConvert(dosage).length <= ShortTextConverter.MAX_LENGTH) {
                return converter.constructor["name"];
            }
        }
        return null;
    }

	/**
	 * Performs a conversion to a short text if possible. Otherwise null.
	 * @param dosage
	 * @return A short text string describing the dosage 
	 */
    public convertWrapper(dosage: DosageWrapper): string {
        return ShortTextConverter.doConvert(dosage, ShortTextConverter.MAX_LENGTH);
    }

    public convert(dosageJson: any): string {
        let dosage = DosageWrapper.fromJsonObject(dosageJson);
        return ShortTextConverter.doConvert(dosage, ShortTextConverter.MAX_LENGTH);
    }


	/**
	 * Performs a conversion to a short text with a custom maximum length. Returns translation if possible, otherwise null.
	 * @param dosage
	 * @param maxLength
	 * @return A short text string describing the dosage 
	 */
    public static doConvert(dosage: DosageWrapper, maxLength: number): string {
        for (let converter of ShortTextConverter.converters) {
            if (converter.canConvert(dosage)) {
                let s = converter.doConvert(dosage);
                if (s.length <= maxLength)
                    return s;
            }
        }
        return null;
    }

    public static canConvert(dosage: DosageWrapper): boolean {
        for (let converter of ShortTextConverter.converters) {
            if (converter.canConvert(dosage)) {
                return true;
            }
        }
        return false;
    }
}