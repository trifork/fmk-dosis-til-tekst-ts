/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { TimedDoseWrapper, LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper, LocalTime } from "../../../main/ts/index";

describe('WeeklyRepeatedConverterImpl', () => {

    it('should return mandag and torsdag morgen', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(6, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020:\n" +
            "Mandag: 2 tabletter morgen\n" +
            "Torsdag: 1 tablet morgen");
    });

    it('should return mandag og torsdag', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020:\n" +
            "Mandag: 2 tabletter\n" +
            "Torsdag: 1 tablet");
    });


    it('should return hver mandag and torsdag morgen efter behov', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
                new DayWrapper(6, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, true)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020:\n" +
            "Mandag: 2 tabletter morgen efter behov højst 1 gang dagligt\n" +
            "Torsdag: 1 tablet morgen efter behov højst 1 gang dagligt");
    });
});

