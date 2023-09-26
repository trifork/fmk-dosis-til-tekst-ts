/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { TimedDoseWrapper, LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper, LocalTime } from "../../../main/ts/index";
import { TextOptions } from '../../../main/ts/TextOptions';

describe('WeeklyRepeatedConverterImpl', () => {

    it('should return mandag and torsdag morgen', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new MorningDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new MorningDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 - gentages hver uge:\n" +
            "Mandag: 2 tabletter morgen\n" +
            "Torsdag: 1 tablet morgen");
    });

    it('should not write "gentages hver uge" when dosageperiod <= 7 days', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 25), undefined), [
                new DayWrapper(2, [new MorningDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new MorningDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 til d. 25. jan. 2020:\n" +
            "Mandag: 2 tabletter morgen\n" +
            "Torsdag: 1 tablet morgen");
    });

    it('should only write weekday once', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2,
                    [new MorningDoseWrapper(1, undefined, undefined, false),
                    new EveningDoseWrapper(2, undefined, undefined, false)
                    ]),
                new DayWrapper(6, [new MorningDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 - gentages hver uge:\n" +
            "Mandag: 2 tabletter morgen\n" +
            "Torsdag: 1 tablet morgen og 2 tabletter aften");
    });

    it('should return mandag og torsdag', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 - gentages hver uge:\n" +
            "Mandag: 2 tabletter\n" +
            "Torsdag: 1 tablet");
    });

    it('should return mandag og torsdag', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false),new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020 - gentages hver uge:\n" +
            "Mandag: 2 tabletter\n" +
            "Torsdag: 1 tablet 2 gange");
    });


    it('should return  mandag and torsdag without "gentages hver uge"', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, true)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, true)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020:\n" +
            "Mandag: 2 tabletter efter behov, højst 1 gang dagligt\n" +
            "Torsdag: 1 tablet efter behov, højst 1 gang dagligt");
    });


    it('should return hver mandag and torsdag morgen efter behov, wihtout "højst.."', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
                new DayWrapper(2, [new MorningDoseWrapper(1, undefined, undefined, true)]),
                new DayWrapper(6, [new MorningDoseWrapper(2, undefined, undefined, true)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 22. jan. 2020:\n" +
            "Mandag: 2 tabletter morgen efter behov\n" +
            "Torsdag: 1 tablet morgen efter behov");
    });

    it('should return all days for VKA', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2021, 2, 1), undefined), [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 22. jan. 2021 til d. 1. mar. 2021 - gentages hver uge:\n" +
            "Mandag: 0 tabletter\n" +
            "Tirsdag: 0 tabletter\n" +
            "Onsdag: 2 tabletter\n" +
            "Torsdag: 0 tabletter\n" +
            "Fredag: 0 tabletter\n" +
            "Lørdag: 1 tablet\n" +
            "Søndag: 0 tabletter");
    });

    it('should return all days for VKA without "gentages" with less than 7 days dosageperiod', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2021, 0, 25), undefined), [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 22. jan. 2021 til d. 25. jan. 2021:\n" +
            "Mandag: 0 tabletter\n" +
            "Tirsdag: 0 tabletter\n" +
            "Onsdag: 2 tabletter\n" +
            "Torsdag: 0 tabletter\n" +
            "Fredag: 0 tabletter\n" +
            "Lørdag: 1 tablet\n" +
            "Søndag: 0 tabletter");
    });

    it('should return all days for VKA without "gentages" with dosagestart=dosageend', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2021, 0, 22), undefined), [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 22. jan. 2021 til d. 22. jan. 2021:\n" +
            "Mandag: 0 tabletter\n" +
            "Tirsdag: 0 tabletter\n" +
            "Onsdag: 2 tabletter\n" +
            "Torsdag: 0 tabletter\n" +
            "Fredag: 0 tabletter\n" +
            "Lørdag: 1 tablet\n" +
            "Søndag: 0 tabletter");
    });



    it('should not return gentages with less than 7 remaining days', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2021, 2, 1), undefined), [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA, new Date(2021, 1, 27))).to.equal(
            "Dosering fra d. 22. jan. 2021 til d. 1. mar. 2021:\n" +
            "Mandag: 0 tabletter\n" +
            "Tirsdag: 0 tabletter\n" +
            "Onsdag: 2 tabletter\n" +
            "Torsdag: 0 tabletter\n" +
            "Fredag: 0 tabletter\n" +
            "Lørdag: 1 tablet\n" +
            "Søndag: 0 tabletter");
    });

    it('should return gentages with less than 7 remaining days but enddate expired', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2021, 2, 1), undefined), [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA, new Date(2021, 1, 30))).to.equal(
            "Dosering fra d. 22. jan. 2021 til d. 1. mar. 2021 - gentages hver uge:\n" +
            "Mandag: 0 tabletter\n" +
            "Tirsdag: 0 tabletter\n" +
            "Onsdag: 2 tabletter\n" +
            "Torsdag: 0 tabletter\n" +
            "Fredag: 0 tabletter\n" +
            "Lørdag: 1 tablet\n" +
            "Søndag: 0 tabletter");
    });


    it('should return all days for both periods (VKA) - no warnings', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined),
            new DateOrDateTimeWrapper(new Date(2020, 3, 1), undefined),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 24), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined),

            new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 25), undefined), null, [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)

            ], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 22. jan. 2020 til d. 24. jan. 2020:\n" +
            "Onsdag d. 22. jan. 2020: 1 tablet\n" +
            "Torsdag d. 23. jan. 2020: 0 tabletter\n" +
            "Fredag d. 24. jan. 2020: 2 tabletter\n\n" +
            "Dosering fra d. 25. jan. 2020 - gentages hver uge:\n" +
            "Mandag: 0 tabletter\n" +
            "Tirsdag: 0 tabletter\n" +
            "Onsdag: 0 tabletter\n" +
            "Torsdag: 2 tabletter\n" +
            "Fredag: 0 tabletter\n" +
            "Lørdag: 0 tabletter\n" +
            "Søndag: 1 tablet");
    });

    it('should return all days for VKA with markup', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 2, 1), undefined), [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA_WITH_MARKUP)).to.equal(
            '<div class="d2t-vkadosagetext">\n' + 
            '<div class="d2t-period"><div class="d2t-periodtext">Fra 22. jan. 2020 til 1. mar. 2020<span class="d2t-iterationtext">gentages hver uge</span>:</div>\n' +
            '<dl class="d2t-weekly-schema">\n' +
            '<dt>Mandag:</dt><dd>2 tabletter</dd>\n' +
            '<dt>Tirsdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Onsdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Torsdag:</dt><dd>1 tablet</dd>\n' +
            '<dt>Fredag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Lørdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Søndag:</dt><dd>0 tabletter</dd>\n' +
            '</dl>\n\n</div></div>');
    });

    it('should return all days for VKA with markup including suppl.text div', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "Bemærkninger til ugeskema", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 2, 1), undefined), [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA_WITH_MARKUP)).to.equal(
            '<div class="d2t-vkadosagetext">\n' + 
            '<div class="d2t-period"><div class="d2t-periodtext">Fra 22. jan. 2020 til 1. mar. 2020<span class="d2t-iterationtext">gentages hver uge</span>:</div>\n' +
            '<dl class="d2t-weekly-schema">\n' +
            '<dt>Mandag:</dt><dd>2 tabletter</dd>\n' +
            '<dt>Tirsdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Onsdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Torsdag:</dt><dd>1 tablet</dd>\n' +
            '<dt>Fredag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Lørdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Søndag:</dt><dd>0 tabletter</dd>\n' +
            '</dl>\n\n<div class="d2t-suppltext">Bemærk: Bemærkninger til ugeskema</div>\n</div></div>');
    });

    it('should return all days for both periods (VKA_WITH_MARKUP)  - no warnings', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined),
            new DateOrDateTimeWrapper(new Date(2020, 3, 1), undefined),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 24), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined),

            new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 25), undefined), null, [
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)

            ], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA_WITH_MARKUP)).to.equal(
            '<div class="d2t-vkadosagetext">\n' + 
            '<div class="d2t-period"><div class="d2t-periodtext">Fra 22. jan. 2020 til 24. jan. 2020:</div>\n' +
            '<dl class="d2t-adjustmentperiod">\n' +
            '<dt>Onsdag d. 22. jan. 2020:</dt><dd>1 tablet</dd>\n' +
            '<dt>Torsdag d. 23. jan. 2020:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Fredag d. 24. jan. 2020:</dt><dd>2 tabletter</dd>\n' +
            '</dl>\n</div>\n' +
            '<div class="d2t-period"><div class="d2t-periodtext">Fra 25. jan. 2020<span class="d2t-iterationtext">gentages hver uge</span>:</div>\n' +
            '<dl class="d2t-weekly-schema">\n' +
            '<dt>Mandag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Tirsdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Onsdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Torsdag:</dt><dd>2 tabletter</dd>\n' +
            '<dt>Fredag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Lørdag:</dt><dd>0 tabletter</dd>\n' +
            '<dt>Søndag:</dt><dd>1 tablet</dd>\n' +
            '</dl>\n\n</div>\n</div>');
    });

    it('should handle empty days without crash and missing days in vka text', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper("mg", undefined, undefined),
            new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined),
            new DateOrDateTimeWrapper(new Date(2020, 3, 1), undefined),
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 24), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(15, undefined, undefined, false)]),
                new DayWrapper(2, [new PlainDoseWrapper(15, undefined, undefined, false)]),
                new DayWrapper(3, [])
            ], undefined)

            ], false));

            expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA_WITH_MARKUP)).to.equal(
                '<div class="d2t-vkadosagetext">\n' + 
                '<div class="d2t-period"><div class="d2t-periodtext">Fra 22. jan. 2020 til 24. jan. 2020:</div>\n' +
                '<dl class="d2t-weekly-schema">\n' +
            '<dt>Mandag:</dt><dd>0 mg</dd>\n' +
            '<dt>Tirsdag:</dt><dd>0 mg</dd>\n' +
            '<dt>Onsdag:</dt><dd>15 mg</dd>\n' +
            '<dt>Torsdag:</dt><dd>15 mg</dd>\n' +
            '<dt>Fredag:</dt><dd>0 mg</dd>\n' +
            '<dt>Lørdag:</dt><dd>0 mg</dd>\n' +
            '<dt>Søndag:</dt><dd>0 mg</dd>\n' +
            '</dl>\n\n</div></div>');
        });

});

