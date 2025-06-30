import { LongTextConverterImpl } from "./longtextconverterimpl/LongTextConverterImpl";
import { DailyRepeatedConverterImpl } from "./longtextconverterimpl/DailyRepeatedConverterImpl";
import { FreeTextConverterImpl } from "./longtextconverterimpl/FreeTextConverterImpl";
import { AdministrationAccordingToSchemaConverterImpl } from "./longtextconverterimpl/AdministrationAccordingToSchemaConverterImpl";
import { DefaultLongTextConverterImpl } from "./longtextconverterimpl/DefaultLongTextConverterImpl";
import { EmptyStructureConverterImpl } from "./longtextconverterimpl/EmptyStructureConverterImpl";
import { TwoDaysRepeatedConverterImpl } from "./longtextconverterimpl/TwoDaysRepeatedConverterImpl";
import { WeeklyRepeatedConverterImpl } from "./longtextconverterimpl/WeeklyRepeatedConverterImpl";
import { NWeeklyRepeatedConverterImpl } from "./longtextconverterimpl/NWeeklyRepeatedConverterImpl";
import { RepeatedConverterImpl } from "./longtextconverterimpl/RepeatedConverterImpl";
import { RepeatedPNConverterImpl } from "./longtextconverterimpl/RepeatedPNConverterImpl";
import { DefaultMultiPeriodeLongTextConverterImpl } from "./longtextconverterimpl/DefaultMultiPeriodeLongTextConverterImpl";
import { textOptionFromString, TextOptions } from "./TextOptions";
import { Dosage } from "./dto/Dosage";
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { StructureHelper } from "./helpers/StructureHelper";

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
        LongTextConverter._converters.push(new NWeeklyRepeatedConverterImpl());
        LongTextConverter._converters.push(new RepeatedConverterImpl());
        LongTextConverter._converters.push(new RepeatedPNConverterImpl());
        LongTextConverter._converters.push(new DefaultLongTextConverterImpl(this));
        LongTextConverter._converters.push(new DefaultMultiPeriodeLongTextConverterImpl(this));
    }

    public convertStr(jsonStr: string, options: string) {

        if (!jsonStr) {
            return null;
        }

        return this.convert(JSON.parse(jsonStr), textOptionFromString(options));
    }

    public convert(dosage: Dosage, options: TextOptions = TextOptions.STANDARD, currentTime?: Date): string {

        if (!dosage) {
            return null;
        }

        if (!currentTime) {
            currentTime = new Date();
        }

        dosage.structures?.structures.forEach(s => {
            s.supplText = StructureHelper.trimLeadingCommas(s.supplText);
        });

        for (const converter of LongTextConverter._converters) {
            if (converter.canConvert(dosage, options)) {
                return converter.doConvert(dosage, options, currentTime);
            }
        }
        return null;
    }

    /**
    * @deprecated This method and the corresponding wrapper classes will be removed. Use convert(dosage: Dosage, ...) instead.
    */
    public convertWrapper(dosage: DosageWrapper, options: TextOptions = TextOptions.STANDARD, currentTime?: Date): string {
        return this.convert(dosage.value, options, currentTime);
    }

    public getConverterClassNameStr(jsonStr: string): string {
        if (!jsonStr) {
            return null;
        }

        return this.getConverterClassName(JSON.parse(jsonStr));
    }

    public getConverterClassName(dosage: Dosage): string {
        for (const converter of LongTextConverter._converters) {
            if (converter.canConvert(dosage, TextOptions.STANDARD)) {
                return converter.getConverterClassName();
            }
        }
        return null;
    }
}
