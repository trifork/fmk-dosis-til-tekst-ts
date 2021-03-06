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
    private static _instance: LongTextConverter = new LongTextConverter();

    public static getInstance(): LongTextConverter { return LongTextConverter._instance; }

    constructor() {
        LongTextConverter._converters = new Array<LongTextConverterImpl>();
        LongTextConverter._converters.push(new AdministrationAccordingToSchemaConverterImpl());
        LongTextConverter._converters.push(new FreeTextConverterImpl());
        LongTextConverter._converters.push(new EmptyStructureConverterImpl());
        LongTextConverter._converters.push(new DailyRepeatedConverterImpl());
        LongTextConverter._converters.push(new TwoDaysRepeatedConverterImpl());
        LongTextConverter._converters.push(new WeeklyRepeatedConverterImpl());
        LongTextConverter._converters.push(new DefaultLongTextConverterImpl());
        LongTextConverter._converters.push(new DefaultMultiPeriodeLongTextConverterImpl(this));
    }

    public convertStr(jsonStr: string, options: string) {   // Options ignored in this version, for future use

        if (jsonStr === undefined || jsonStr === null) {
            return null;
        }

        return this.convert(JSON.parse(jsonStr));
    }

    public convert(dosageJson: any): string {

        if (dosageJson === undefined || dosageJson === null) {
            return null;
        }
        let dosage = DosageWrapper.fromJsonObject(dosageJson);
        return this.convertWrapper(dosage);
    }

    public convertWrapper(dosage: DosageWrapper): string {
        for (let converter of LongTextConverter._converters) {
            if (converter.canConvert(dosage)) {
                return converter.doConvert(dosage);
            }
        }
        return null;
    }

    /*
    public static getConverter(dosage: DosageWrapper): LongTextConverterImpl {
        for (let converter of this.getConverters()) {
            if (converter.canConvert(dosage))
                return converter;
        }
        return null;
    } */

    public getConverterClassName(dosageJson: any): string {
        return this.getConverterClassNameWrapper(DosageWrapper.fromJsonObject(dosageJson));
    }

    public getConverterClassNameStr(jsonStr: string): string {
        if (jsonStr === undefined || jsonStr === null) {
            return null;
        }

        return this.getConverterClassName(JSON.parse(jsonStr));
    }

    public getConverterClassNameWrapper(dosage: DosageWrapper): string {
        for (let converter of LongTextConverter._converters) {
            if (converter.canConvert(dosage)) {
                return converter.constructor["name"];
            }
        }
        return null;
    }
}
