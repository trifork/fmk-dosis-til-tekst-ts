import { LongTextConverterImpl } from "./longtextconverterimpl/LongTextConverterImpl";
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { DailyRepeatedConverterImpl } from "./longtextconverterimpl/DailyRepeatedConverterImpl";
import { FreeTextConverterImpl } from "./longtextconverterimpl/FreeTextConverterImpl";
import { AdministrationAccordingToSchemaConverterImpl } from "./longtextconverterimpl/AdministrationAccordingToSchemaConverterImpl";
import { DefaultLongTextConverterImpl } from "./longtextconverterimpl/DefaultLongTextConverterImpl";
import { EmptyStructureConverterImpl } from "./longtextconverterimpl/EmptyStructureConverterImpl";
import { TwoDaysRepeatedConverterImpl } from "./longtextconverterimpl/TwoDaysRepeatedConverterImpl";
import { WeeklyRepeatedConverterImpl } from "./longtextconverterimpl/WeeklyRepeatedConverterImpl";
import { DefaultMultiPeriodeLongTextConverterImpl } from "./longtextconverterimpl/DefaultMultiPeriodeLongTextConverterImpl";

export class LongTextConverter {

    private static _converters: LongTextConverterImpl[];

    private static get converters() {
        if (!LongTextConverter._converters) {
            LongTextConverter._converters = new Array<LongTextConverterImpl>();
            LongTextConverter._converters.push(new AdministrationAccordingToSchemaConverterImpl());
            LongTextConverter._converters.push(new FreeTextConverterImpl());
            LongTextConverter._converters.push(new EmptyStructureConverterImpl());
            LongTextConverter._converters.push(new DailyRepeatedConverterImpl());
            LongTextConverter._converters.push(new TwoDaysRepeatedConverterImpl());
            LongTextConverter._converters.push(new WeeklyRepeatedConverterImpl());
            LongTextConverter._converters.push(new DefaultLongTextConverterImpl());
            LongTextConverter._converters.push(new DefaultMultiPeriodeLongTextConverterImpl());
        }

        return LongTextConverter._converters;
    }

    public convert(dosageJson: any): string {
        let dosage = DosageWrapper.fromJsonObject(dosageJson);
        return LongTextConverter.convertWrapper(dosage);
    }

    public static convertWrapper(dosage: DosageWrapper): string {
        for (let converter of LongTextConverter.converters) {
            if (converter.canConvert(dosage)) {

                return converter.doConvert(dosage);
            }
        }
        return null;
    }

    public static getConverter(dosage: DosageWrapper): LongTextConverterImpl {
        for (let converter of this.converters) {
            if (converter.canConvert(dosage))
                return converter;
        }
        return null;
    }
}
