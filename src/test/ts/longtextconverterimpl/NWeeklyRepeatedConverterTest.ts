
import { expect } from 'chai';
import { DateOrDateTimeWrapper, DayWrapper, DosageWrapper, LongTextConverter, MorningDoseWrapper, StructuresWrapper, StructureWrapper, UnitOrUnitsWrapper } from "../../../main/ts/index";

describe('NWeeklyRepeatedConverterImpl', () => {

    it('should return hver 2. mandag', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(14, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new MorningDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 - gentages hver 14. dag:\n" +
            "Hver 2. torsdag: 1 tablet morgen");
    });

    it('should return hver 3. torsdag', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(21, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new MorningDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 - gentages hver 21. dag:\n" +
            "Hver 3. torsdag: 1 tablet morgen");
    });

    it('should return hver 3. torsdag without 21. dag for PN', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(21, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new MorningDoseWrapper(1, undefined, undefined, true)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020:\n" +
            "Hver 3. torsdag: 1 tablet morgen efter behov");
    });


});

