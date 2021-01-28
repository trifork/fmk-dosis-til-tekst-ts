/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect } from 'chai';
import { LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, NoonDoseWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, PlainDoseWrapper } from "../../../main/ts/index";

describe('RepeatedPNConverterImpl', () => {

    it('should not return gentages hver 4. dag', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(4, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, true)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "2 tabletter efter behov, højst 1 gang dagligt hver 4. dag");
    });
});

