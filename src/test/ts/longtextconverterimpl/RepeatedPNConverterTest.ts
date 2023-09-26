/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect } from 'chai';
import { LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, NoonDoseWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, PlainDoseWrapper, TimedDoseWrapper, LocalTime } from "../../../main/ts/index";

describe('RepeatedPNConverterImpl', () => {

    it('should not return gentages hver 4. dag', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(4, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(2, undefined, undefined, true)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "2 tabletter efter behov, højst 1 gang dagligt hver 4. dag");
    });


    it('should return efter behov uden max for iter=0 and day=0', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(0, [new PlainDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet efter behov");
    });

    it('should return efter behov uden max for iter=0 and day=1', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet efter behov");
    });

    it('should return efter behov med dagligt max for iter=0 and day=1 and 2 plain doses', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, true), new PlainDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 18. apr. 2019:\n" +
            "1 tablet efter behov, højst 2 gange dagligt");
    });


    it('should return efter behov med max for day=0 and iter=1', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(0, [new PlainDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet efter behov, højst 1 gang dagligt");
    });

    it('should return efter behov med max for day=1 and iter=1', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet efter behov, højst 1 gang dagligt");
    });

    it('should return efter behov med dagligt max for day=1 and iter=1 and 2 plain doses', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, true), new PlainDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet efter behov, højst 2 gange dagligt");
    });


    it('should return efter behov med dagligt max for day=1 and iter=0 and 1 timed dose', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), undefined, [
                new DayWrapper(1, [new TimedDoseWrapper(new LocalTime(10, 0, 0), 1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 18. apr. 2019:\n" +
            "1 tablet kl. 10:00 efter behov");
    });

});