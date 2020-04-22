/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect } from 'chai';
import { LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper,  PlainDoseWrapper, FreeTextWrapper } from "../../../main/ts/index";

describe('FreeTextConverterImpl', () => {

    it('should return freetext', () => {
        let dose = new DosageWrapper(undefined, new FreeTextWrapper(new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), null, "1,5 tabl om morgenen"), null);

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1,5 tabl om morgenen");
    });
});
