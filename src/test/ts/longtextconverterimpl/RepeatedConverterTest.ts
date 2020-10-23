/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect } from 'chai';
import { LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper,  PlainDoseWrapper } from "../../../main/ts/index";

describe('RepeatedConverterImpl', () => {

    it('should return hver 3. dag', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(3, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet morgen hver 3. dag");
    });
});

