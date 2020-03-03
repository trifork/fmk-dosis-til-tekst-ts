/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { TimedDoseWrapper, LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper, LocalTime } from "../../../main/ts/index";

describe('DefaultLongTextConverterImpl', () => {

    it('should return 1-time dosage', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new NightDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 4. dec. 2018:\n" +
            "2 tabletter morgen, 2 tabletter aften og 2 tabletter nat");
    });

    it('should return 1-time dosage with suppl text', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, "tages med rigeligt vand", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new NightDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 4. dec. 2018:\n" +
            "2 tabletter morgen, 2 tabletter aften og 2 tabletter nat\n" +
            "Bemærk: tages med rigeligt vand");
    });

    it('should return list of days when iteration != 7', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(4, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(2, [new MorningDoseWrapper(0.5, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(3, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(4, [new MorningDoseWrapper(1.5, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering som gentages hver 4. dag fra d. 4. dec. 2018:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 0,5 tablet morgen\n" +
            "Dag 3: 2 tabletter morgen\n" +
            "Dag 4: 1,5 tabletter morgen\n" +
            "Dag 1: 1 tablet morgen\n" +
            "...");
    });

    it('should return list of dates when not iterated', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false), new NoonDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false), new NoonDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(3, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new NoonDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(4, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(5, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(6, [new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "18. apr. 2019: 2 tabletter morgen, 2 tabletter middag og 2 tabletter aften\n" +
            "19. apr. 2019: 2 tabletter morgen, 1 tablet middag og 2 tabletter aften\n" +
            "20. apr. 2019: 1 tablet morgen, 1 tablet middag og 2 tabletter aften\n" +
            "21. apr. 2019: 1 tablet morgen og 1 tablet aften\n" +
            "22. apr. 2019: 1 tablet morgen og 1 tablet aften\n" +
            "23. apr. 2019: 1 tablet aften" );
    });

    it('should return Dosering kun for day=0 and iter=0', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
        [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
            new DayWrapper(2, [new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
        ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering kun d. 19. apr. 2019:\n" +
            "1 tablet aften efter behov højst 1 gang dagligt" );
    });

    it('should return Dosering kun for day=0 and iter=1', () => {

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
        [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
            new DayWrapper(0, [new EveningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
        ], undefined)]));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 18. apr. 2019 til d. 23. apr. 2019:\n" +
            "1 tablet aften efter behov højst 1 gang dagligt" );
    });
});
