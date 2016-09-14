import { StructureWrapper } from "./vowrapper/StructureWrapper";
import { FreeTextWrapper } from "./vowrapper/FreeTextWrapper";

import { LongTextConverter } from "./LongTextConverter";
import { ShortTextConverter } from "./ShortTextConverter";
import { DateOrDateTimeWrapper } from "./vowrapper/DateOrDateTimeWrapper";
import { DosageWrapper } from "./vowrapper/DosageWrapper";

export class Factory {
    public static getLongTextConverter() { return new LongTextConverter(); }
    public static getShortTextConverter() { return new ShortTextConverter(); }

    // These are dummy methods in order to let webpack know about the types
    private static getDateOrDateTimeWrapper() { return new DateOrDateTimeWrapper(null, null); }
    private static getStructureWrapper() { return new StructureWrapper(null, null, null, null, null, null); }
    private static getDosageWrapper() { return new DosageWrapper(null, new FreeTextWrapper(new DateOrDateTimeWrapper(new Date(), null), null, "dims"), null); }
}
