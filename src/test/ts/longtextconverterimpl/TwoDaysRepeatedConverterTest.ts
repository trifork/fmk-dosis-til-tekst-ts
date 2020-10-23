/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect } from 'chai';
import { LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper,  PlainDoseWrapper } from "../../../main/ts/index";

describe('TwoDaysRepeatedConverterImpl', () => {

    it('should return hver 2. dag with morning', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet morgen hver 2. dag");
    });

    it('should return hver 2. dag with dagligt', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet hver 2. dag");
    });

    it('should return hver 2. dag with dagligt and efter behov', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet efter behov højst 1 gang dagligt hver 2. dag");
    });

    it('should not use hver 2. dag', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 26), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 til d. 26. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 2 tabletter morgen");
    });

    it('should not use hver 2. dag pn', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 26), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, true)])], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 til d. 26. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen efter behov højst 1 gang dagligt\n" +
            "Dag 2: 2 tabletter morgen efter behov højst 1 gang dagligt");
    });

});

