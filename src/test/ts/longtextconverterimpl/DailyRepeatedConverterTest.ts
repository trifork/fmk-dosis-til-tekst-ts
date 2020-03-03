/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { TimedDoseWrapper, LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper, LocalTime } from "../../../main/ts/index";

describe('DailyRepeatedConverterImpl', () => {

    it('should return 2 gange and hver dag without enddate', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false), new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet 2 gange hver dag");
    });

    it('should return nat and hver dag with enddate', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), new DateOrDateTimeWrapper(new Date(2019, 0, 19), undefined), [
                new DayWrapper(1, [new NightDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018 til d. 19. jan. 2019:\n" +
            "1 tablet nat - hver dag");
    });

    it('should return MMAN and hver dag with enddate', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), new DateOrDateTimeWrapper(new Date(2019, 0, 19), undefined), [
                new DayWrapper(1, [
                    new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                    new NoonDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false),
                    new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                    new NightDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018 til d. 19. jan. 2019:\n" +
            "2 tabletter morgen, 1 tablet middag, 2 tabletter aften og 1 tablet nat - hver dag");
    });

    it('should return times and hver dag without enddate', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new TimedDoseWrapper(new LocalTime(8, 0, 0), 1, undefined, undefined, undefined, undefined, undefined, false), new TimedDoseWrapper(new LocalTime(12, 30, 0), 2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet kl. 8:00 og 2 tabletter kl. 12:30 - hver dag");
    });

    it('should return efter behov without enddate', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, 
                    [new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, true), 
                    new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, true),
                    new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, true),
                    new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, true)
                ])
            ], undefined)]));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "2 tabletter efter behov højst 4 gange dagligt");
    });
});

