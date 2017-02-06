import { StructureWrapper } from "./vowrapper/StructureWrapper";
import { FreeTextWrapper } from "./vowrapper/FreeTextWrapper";

import { LongTextConverter } from "./LongTextConverter";
import { ShortTextConverter } from "./ShortTextConverter";
import { CombinedTextConverter } from "./CombinedTextConverter";
import { DateOrDateTimeWrapper } from "./vowrapper/DateOrDateTimeWrapper";
import { DosageWrapper } from "./vowrapper/DosageWrapper";

export class Factory {

    static shortTextConverter: ShortTextConverter;

    public static getLongTextConverter() {
        return LongTextConverter.getInstance();
    }

    public static getShortTextConverter() {
        return ShortTextConverter.getInstance();
    }

    private static getCombinedTextConverter(): CombinedTextConverter {
        return null;
    }

    // These are dummy methods in order to let webpack know about the types
    private static getDateOrDateTimeWrapper() { return new DateOrDateTimeWrapper(null, null); }
    private static getStructureWrapper() { return new StructureWrapper(null, null, null, null, null, null); }
    private static getDosageWrapper() { return new DosageWrapper(null, new FreeTextWrapper(new DateOrDateTimeWrapper(new Date(), null), null, "dims"), null); }
}

