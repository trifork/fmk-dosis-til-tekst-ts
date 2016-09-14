import { ShortTextConverterImpl } from "./shorttextconverterimpl/ShortTextConverterImpl";
import { AdministrationAccordingToSchemaConverterImpl } from "./shorttextconverterimpl/AdministrationAccordingToSchemaConverterImpl";
import { FreeTextConverterImpl } from "./shorttextconverterimpl/FreeTextConverterImpl";
import { MorningNoonEveningNightEyeOrEarConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightEyeOrEarConverterImpl";
import { MorningNoonEveningNightConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightConverterImpl";
import { SimpleLimitedAccordingToNeedConverterImpl } from "./shorttextconverterimpl/SimpleLimitedAccordingToNeedConverterImpl";
import { MorningNoonEveningNightAndAccordingToNeedConverterImpl } from "./shorttextconverterimpl/MorningNoonEveningNightAndAccordingToNeedConverterImpl";
import { WeeklyMorningNoonEveningNightConverterImpl } from "./shorttextconverterimpl/WeeklyMorningNoonEveningNightConverterImpl";
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { LoggerService } from "./LoggerService";

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
            ShortTextConverter._converters = new Array<ShortTextConverterImpl>();

            ShortTextConverter._converters.push(new AdministrationAccordingToSchemaConverterImpl());
            ShortTextConverter._converters.push(new FreeTextConverterImpl());
            ShortTextConverter._converters.push(new MorningNoonEveningNightEyeOrEarConverterImpl());
            ShortTextConverter._converters.push(new MorningNoonEveningNightConverterImpl());


            ShortTextConverter._converters.push(new WeeklyMorningNoonEveningNightConverterImpl());
            /*
            ShortTextConverter._converters.push(new RepeatedEyeOrEarConverterImpl());
            ShortTextConverter._converters.push(new RepeatedConverterImpl());
            ShortTextConverter._converters.push(new SimpleNonRepeatedConverterImpl());
            ShortTextConverter._converters.push(new MorningNoonEveningNightInNDaysConverterImp());
            ShortTextConverter._converters.push(new SimpleAccordingToNeedConverterImpl());
            ShortTextConverter._converters.push(new LimitedNumberOfDaysConverterImpl()); */
            ShortTextConverter._converters.push(new SimpleLimitedAccordingToNeedConverterImpl());
            /*
            ShortTextConverter._converters.push(new WeeklyRepeatedConverterImpl());
            ShortTextConverter._converters.push(new ParacetamolConverterImpl());*/
            ShortTextConverter._converters.push(new MorningNoonEveningNightAndAccordingToNeedConverterImpl());
            /*ShortTextConverter._converters.push(new MultipleDaysNonRepeatedConverterImpl());
            ShortTextConverter._converters.push(new NumberOfWholeWeeksConverterImpl());
            ShortTextConverter._converters.push(new DayInWeekConverterImpl());
            // Converters for more than one periode:
            ShortTextConverter._converters.push(new CombinedTwoPeriodesConverterImpl());
            */
        }

        return ShortTextConverter._converters;
    }

    public getConverterClassName(dosageJson: any): string {
        let dosage = DosageWrapper.fromJsonObject(dosageJson);
        for (let converter of ShortTextConverter.converters) {
            if (converter.canConvert(dosage)) {
                return converter.constructor["name"];
            }
        }
        return "Ikke fundet";
    }

	/**
	 * Performs a conversion to a short text if possible. Otherwise null.
	 * @param dosage
	 * @return A short text string describing the dosage 
	 */
    public static convert(dosage: DosageWrapper): string {
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
                LoggerService.info(converter.constructor["name"]);
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