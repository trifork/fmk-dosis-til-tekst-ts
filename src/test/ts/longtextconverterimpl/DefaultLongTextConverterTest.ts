/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { TimedDoseWrapper, LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper, LocalTime } from "../../../main/ts/index";
import { TextOptions } from '../../../main/ts/TextOptions';

describe('DefaultLongTextConverterImpl', () => {

    it('should return 1-time dosage (with enddate)', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null, [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), [
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 4. dec. 2018:\n" +
            "2 tabletter morgen");
    });

    // FMK-7072
    it('should return 1-time dosage without hver dag', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null, [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), [
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, false),
                new EveningDoseWrapper(2, undefined, undefined, false),
                new NightDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 4. dec. 2018:\n" +
            "2 tabletter morgen, 2 tabletter aften og 2 tabletter nat");    // before fix: ..og 2 tabletter nat - hver dag
    });


    it('not-iterated should not write daglig', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(Date.parse("2020-08-27")), undefined), new DateOrDateTimeWrapper(new Date(Date.parse("2020-09-02")), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(3, undefined, undefined, false)]),
            ], undefined)


            ], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal("Dosering kun d. 27. aug. 2020:\n3 tabletter morgen");

    });


    it('should return 1-time dosage with suppl text', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "tages med rigeligt vand", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, false),
                new EveningDoseWrapper(2, undefined, undefined, false),
                new NightDoseWrapper(2, undefined, undefined, false)])
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
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(2, [new MorningDoseWrapper(0.5, undefined, undefined, false)]),
                new DayWrapper(3, [new MorningDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(4, [new MorningDoseWrapper(1.5, undefined, undefined, false)]),
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
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, false), new NoonDoseWrapper(2, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, false), new NoonDoseWrapper(1, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(3, [new MorningDoseWrapper(1, undefined, undefined, false), new NoonDoseWrapper(1, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(4, [new MorningDoseWrapper(1, undefined, undefined, false), new EveningDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(5, [new MorningDoseWrapper(1, undefined, undefined, false), new EveningDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new EveningDoseWrapper(1, undefined, undefined, false)]),
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
                new DayWrapper(2, [new EveningDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 19. apr. 2019:\n" +
            "1 tablet aften efter behov");
    });

    it('should return Dosering kun for day=0 and iter=1 evening', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(0, [new EveningDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet aften efter behov");
    });

    it('should return 0-dosages for empty days with option VKA', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined), new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, false)]),
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

    it('should return 0-dosages for empty dosages with option VKA', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined), new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(0, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(0, undefined, undefined, false)]),
                new DayWrapper(5, []),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 27. okt. 2020 til d. 1. nov. 2020:\n" +
            "Tirsdag d. 27. okt. 2020: 0 tabletter\n" +
            "Onsdag d. 28. okt. 2020: 0 tabletter\n" +
            "Torsdag d. 29. okt. 2020: 0 tabletter\n" +
            "Fredag d. 30. okt. 2020: 0 tabletter\n" +
            "Lørdag d. 31. okt. 2020: 0 tabletter\n" +
            "Søndag d. 1. nov. 2020: 0 tabletter");
    });

    it('should return warning text when weekly VKA period is missing and dosageend before treatmentend', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined),
            new DateOrDateTimeWrapper(new Date(2020, 10, 2), undefined),
            [new StructureWrapper(0, "",
                new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined),
                new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, false)]),
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

    it('should return warning text when weekly VKA period is missing and no treatmentend set', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined),
            new DateOrDateTimeWrapper(undefined, undefined),
            [new StructureWrapper(0, "",
                new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined),
                new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, false)]),
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
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, false)]),
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

    it('should return Morning Dosering kun for day=1 and iter=1', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet hver morgen efter behov");
    });

    it('should return Fra/Til for empty VKA dosages in adjustmentperiods', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, new DateOrDateTimeWrapper(new Date(2020, 10, 30), undefined),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined), new DateOrDateTimeWrapper(new Date(2020, 10, 30), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, false)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 27. okt. 2020 til d. 31. okt. 2020:\n" +
            "Tirsdag d. 27. okt. 2020: 1 tablet\n" +
            "Onsdag d. 28. okt. 2020: 0 tabletter\n" +
            "Torsdag d. 29. okt. 2020: 2 tabletter\n" +
            "Fredag d. 30. okt. 2020: 0 tabletter\n" +
            "Lørdag d. 31. okt. 2020: 3 tabletter\n\n" +
            "Dosering fra d. 1. nov. 2020 til d. 30. nov. 2020: 0 tabletter");
    });

    it('should return Fra/Til for empty VKA dosages in adjustmentperiods including markup', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined), new DateOrDateTimeWrapper(new Date(2020, 10, 30), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, false)]),
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA_WITH_MARKUP)).to.equal(
            "<div class=\"d2t-vkadosagetext\">\n" + 
            "<div class=\"d2t-period\"><div class=\"d2t-periodtext\">Fra 27. okt. 2020 til 31. okt. 2020:</div>\n" +
            "<dl class=\"d2t-adjustmentperiod\">\n" +
            "<dt>Tirsdag d. 27. okt. 2020:</dt><dd>1 tablet</dd>\n" +
            "<dt>Onsdag d. 28. okt. 2020:</dt><dd>0 tabletter</dd>\n" +
            "<dt>Torsdag d. 29. okt. 2020:</dt><dd>2 tabletter</dd>\n" +
            "<dt>Fredag d. 30. okt. 2020:</dt><dd>0 tabletter</dd>\n" +
            "<dt>Lørdag d. 31. okt. 2020:</dt><dd>3 tabletter</dd>\n" +
            "</dl>\n</div>\n" +
            "<div class=\"d2t-period\"><div class=\"d2t-periodtext\">Fra 1. nov. 2020 til 30. nov. 2020:</div>\n" +
            "<dl class=\"d2t-adjustmentperiod\">" +
            "<dt></dt><dd>0 tabletter</dd></dl></div>\n</div>");
    });

    it('should return 0-period less than 10 days', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, new DateOrDateTimeWrapper(new Date(2021, 10, 1), undefined),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), new DateOrDateTimeWrapper(new Date(2021, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 25. okt. 2021 til d. 1. nov. 2021:\n" +
            "Mandag d. 25. okt. 2021: 1 tablet\n" +
            "Tirsdag d. 26. okt. 2021: 0 tabletter\n" +
            "Onsdag d. 27. okt. 2021: 0 tabletter\n" +
            "Torsdag d. 28. okt. 2021: 0 tabletter\n" +
            "Fredag d. 29. okt. 2021: 0 tabletter\n" +
            "Lørdag d. 30. okt. 2021: 0 tabletter\n" +
            "Søndag d. 31. okt. 2021: 0 tabletter\n" +
            "Mandag d. 1. nov. 2021: 0 tabletter"
            );
    });


    it('should not return 0-period double', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
        new DateOrDateTimeWrapper(new Date(2021, 9, 18), undefined), null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), new DateOrDateTimeWrapper(new Date(2021, 10, 5), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering kun d. 25. okt. 2021:\n" +
            "Mandag d. 25. okt. 2021: 1 tablet\n\n" +
            "Dosering fra d. 26. okt. 2021 til d. 5. nov. 2021: 0 tabletter\n" + 
            "Bemærk: Dosering herefter er ikke angivet"
            );
    });

    it('should not return 0-period double with 2 days', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), new DateOrDateTimeWrapper(new Date(2021, 10, 6), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(2, [new PlainDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 25. okt. 2021 til d. 26. okt. 2021:\n" +
            "Mandag d. 25. okt. 2021: 1 tablet\n" +
            "Tirsdag d. 26. okt. 2021: 2 tabletter\n\n" + 
            "Dosering fra d. 27. okt. 2021 til d. 6. nov. 2021: 0 tabletter\n" + 
            "Bemærk: Dosering herefter er ikke angivet"
            );
    });

    it('should treat iterationInterval > treatmentDuration as non-iterated', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(14, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, false), new NoonDoseWrapper(2, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, false), new NoonDoseWrapper(1, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(3, [new MorningDoseWrapper(1, undefined, undefined, false), new NoonDoseWrapper(1, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(4, [new MorningDoseWrapper(1, undefined, undefined, false), new EveningDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(5, [new MorningDoseWrapper(1, undefined, undefined, false), new EveningDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(6, [new EveningDoseWrapper(1, undefined, undefined, false)]),
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
});
