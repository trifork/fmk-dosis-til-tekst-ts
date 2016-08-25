/*
import { DayOfWeek } from "./vowrapper/DayOfWeek";
import { AdministrationAccordingToSchemaWrapper } from "./vowrapper/AdministrationAccordingToSchemaWrapper";



import { StructuresWrapper } from "./vowrapper/StructuresWrapper";
import { Validator } from "./Validator";
*/
import { StructureWrapper } from "./vowrapper/StructureWrapper";
import { FreeTextWrapper } from "./vowrapper/FreeTextWrapper";

import { LongTextConverter } from "./LongTextConverter";
import { DateOrDateTimeWrapper } from "./vowrapper/DateOrDateTimeWrapper";
import { DosageWrapper } from "./vowrapper/DosageWrapper";

export class Factory {
    /*
        private _converters: DayOfWeek;
    
        public getNoget() { this._converters = new DayOfWeek(1, "", null); return this._converters; }
        public getNogetAndet() { return new DateOrDateTimeWrapper(new Date(), new Date()); }
    
        public getNoget3() { return new AdministrationAccordingToSchemaWrapper(null, null); }
    public getNoget4() { return new FreeTextWrapper(null, null, "dims"); }
    
    public getNoget6() { return new StructuresWrapper(null, null); }
    public getNoget7() { return new Validator(); }
    */
    public static getLongTextConverter() { return new LongTextConverter(); }
    public static getDateOrDateTimeWrapper() { return new DateOrDateTimeWrapper(null, null); }
    public static getStructureWrapper() { return new StructureWrapper(null, null, null, null, null, null); }
    public static getDosageWrapper() { return new DosageWrapper(null, new FreeTextWrapper(new DateOrDateTimeWrapper(new Date(), null), null, "dims"), null); }
}
