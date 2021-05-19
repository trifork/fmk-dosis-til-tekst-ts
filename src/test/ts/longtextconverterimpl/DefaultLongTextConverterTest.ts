/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { TimedDoseWrapper, LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper, LocalTime } from "../../../main/ts/index";
import { TextOptions } from '../../../main/ts/TextOptions';

describe('DefaultLongTextConverterImpl', () => {

    it('should return 1-time dosage', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null, [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new NightDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 5. dec. 2018:\n" +
            "2 tabletter morgen, 2 tabletter aften og 2 tabletter nat");
    });

    it('not-iterated should not write daglig', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(Date.parse("2020-08-27")), undefined), new DateOrDateTimeWrapper(new Date(Date.parse("2020-09-02")), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(3, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)


            ], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal("Dosering kun d. 27. aug. 2020:\n3 tabletter morgen");

    });


    it('should return 1-time dosage with suppl text', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "tages med rigeligt vand", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new NightDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 4. dec. 2018:\n" +
            "2 tabletter morgen, 2 tabletter aften og 2 tabletter nat\n" +
            "Bemærk: tages med rigeligt vand");
    });

    it('should return list of days when iteration != 7', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(4, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(2, [new MorningDoseWrapper(0.5, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(3, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(4, [new MorningDoseWrapper(1.5, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018 - gentages hver 4. dag:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 0,5 tablet morgen\n" +
            "Dag 3: 2 tabletter morgen\n" +
            "Dag 4: 1,5 tabletter morgen");
    });

    it('should return list of dates when not iterated', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false), new NoonDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false), new NoonDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(3, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new NoonDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(4, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(5, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(6, [new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "Torsdag d. 18. apr. 2019: 2 tabletter morgen, 2 tabletter middag og 2 tabletter aften\n" +
            "Fredag d. 19. apr. 2019: 2 tabletter morgen, 1 tablet middag og 2 tabletter aften\n" +
            "Lørdag d. 20. apr. 2019: 1 tablet morgen, 1 tablet middag og 2 tabletter aften\n" +
            "Søndag d. 21. apr. 2019: 1 tablet morgen og 1 tablet aften\n" +
            "Mandag d. 22. apr. 2019: 1 tablet morgen og 1 tablet aften\n" +
            "Tirsdag d. 23. apr. 2019: 1 tablet aften");
    });

    it('should return Dosering kun for day=2 and iter=0', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(2, [new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 19. apr. 2019:\n" +
            "1 tablet aften efter behov");
    });

    it('should return Dosering kun for day=0 and iter=1 evening', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(0, [new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet aften efter behov");
    });

    it('should return 0-dosages for empty days with option VKA', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined), new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 27. okt. 2020 til d. 1. nov. 2020:\n" +
            "Tirsdag d. 27. okt. 2020: 1 tablet\n" +
            "Onsdag d. 28. okt. 2020: 0 tabletter\n" +
            "Torsdag d. 29. okt. 2020: 2 tabletter\n" +
            "Fredag d. 30. okt. 2020: 0 tabletter\n" +
            "Lørdag d. 31. okt. 2020: 3 tabletter\n" +
            "Søndag d. 1. nov. 2020: 0 tabletter");
    });

    it('should return warning text when weekly VKA period is missing', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined),
            new DateOrDateTimeWrapper(new Date(2020, 10, 2), undefined),
            [new StructureWrapper(0, "",
                new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined),
                new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 27. okt. 2020 til d. 1. nov. 2020:\n" +
            "Tirsdag d. 27. okt. 2020: 1 tablet\n" +
            "Onsdag d. 28. okt. 2020: 0 tabletter\n" +
            "Torsdag d. 29. okt. 2020: 2 tabletter\n" +
            "Fredag d. 30. okt. 2020: 0 tabletter\n" +
            "Lørdag d. 31. okt. 2020: 3 tabletter\n" +
            "Søndag d. 1. nov. 2020: 0 tabletter\n" +
            "Bemærk: Dosering herefter er ikke angivet");
    });

    it('should not return warning text when adjustment period dosagend matches treatmentend for VKA', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined),
            new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined),
            [new StructureWrapper(0, "",
                new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined),
                new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 27. okt. 2020 til d. 1. nov. 2020:\n" +
            "Tirsdag d. 27. okt. 2020: 1 tablet\n" +
            "Onsdag d. 28. okt. 2020: 0 tabletter\n" +
            "Torsdag d. 29. okt. 2020: 2 tabletter\n" +
            "Fredag d. 30. okt. 2020: 0 tabletter\n" +
            "Lørdag d. 31. okt. 2020: 3 tabletter\n" +
            "Søndag d. 1. nov. 2020: 0 tabletter");
    });

    it('should return Dosering kun for day=0 and iter=0', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null, 
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(0, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet efter behov");
    });

    it('should return Dosering kun for day=0 and iter=1', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null, 
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(0, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet efter behov");
    });

    it('should return Dosering kun for day=1 and iter=0', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 18. apr. 2019:\n" +
            "1 tablet efter behov, højst 1 gang dagligt");
    });

    it('should return Dosering kun for day=1 and iter=1', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet efter behov");
    });

    it('should return Morning Dosering kun for day=1 and iter=1', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet hver morgen efter behov");
    });

});
