
import { expect } from 'chai';
import { DateOrDateTimeWrapper, DayWrapper, DosageWrapper, EveningDoseWrapper, LocalTimeWrapper, LongTextConverter, MorningDoseWrapper, NightDoseWrapper, NoonDoseWrapper, PlainDoseWrapper, StructuresWrapper, StructureWrapper, TimedDoseWrapper, UnitOrUnitsWrapper } from "../../../main/ts/index";

describe('DailyRepeatedConverterImpl', () => {

    it('should return 2 gange and hver dag without enddate', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false), new PlainDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet 2 gange hver dag");
    });

    it('should return nat and hver dag with enddate', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), new DateOrDateTimeWrapper(new Date(2019, 0, 19), undefined), [
                new DayWrapper(1, [new NightDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018 til d. 19. jan. 2019:\n" +
            "1 tablet hver nat");
    });

    it('should return MMAN and hver dag with enddate', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            undefined, undefined,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), new DateOrDateTimeWrapper(new Date(2019, 0, 19), undefined), [
                new DayWrapper(1, [
                    new MorningDoseWrapper(2, undefined, undefined, false),
                    new NoonDoseWrapper(1, undefined, undefined, false),
                    new EveningDoseWrapper(2, undefined, undefined, false),
                    new NightDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018 til d. 19. jan. 2019:\n" +
            "2 tabletter morgen, 1 tablet middag, 2 tabletter aften og 1 tablet nat - hver dag");
    });

    it('should return times and hver dag without enddate', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new TimedDoseWrapper(new LocalTimeWrapper(8, 0, 0), 1, undefined, undefined, false), new TimedDoseWrapper(new LocalTimeWrapper(12, 30, 0), 2, undefined, undefined, false)])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet kl. 8:00 og 2 tabletter kl. 12:30 - hver dag");
    });

    it('should return morgen before kl. 12:30', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new TimedDoseWrapper(new LocalTimeWrapper(12, 30, 0), 2, undefined, undefined, false), new MorningDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet morgen og 2 tabletter kl. 12:30 - hver dag");
    });

    it('should return morgen before kl. 03:01', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [new TimedDoseWrapper(new LocalTimeWrapper(3, 1, 0), 2, undefined, undefined, false), new MorningDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "1 tablet morgen og 2 tabletter kl. 3:01 - hver dag");
    });

    it('should return doses correctly sorted', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1, [
                    new TimedDoseWrapper(new LocalTimeWrapper(21, 1, 0), 4, undefined, undefined, false),
                    new TimedDoseWrapper(new LocalTimeWrapper(3, 1, 0), 1, undefined, undefined, false),
                    new TimedDoseWrapper(new LocalTimeWrapper(15, 1, 0), 3, undefined, undefined, false),
                    new TimedDoseWrapper(new LocalTimeWrapper(9, 1, 0), 2, undefined, undefined, false),
                    new NightDoseWrapper(5, undefined, undefined, false),
                    new NoonDoseWrapper(6, undefined, undefined, false),
                    new EveningDoseWrapper(7, undefined, undefined, false),
                    new MorningDoseWrapper(8, undefined, undefined, false)
                ])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "8 tabletter morgen, 1 tablet kl. 3:01, 6 tabletter middag, 2 tabletter kl. 9:01, 7 tabletter aften, 3 tabletter kl. 15:01, 5 tabletter nat og 4 tabletter kl. 21:01 - hver dag");
    });




    it('should return efter behov without enddate', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1,
                    [new PlainDoseWrapper(2, undefined, undefined, true),
                    new PlainDoseWrapper(2, undefined, undefined, true),
                    new PlainDoseWrapper(2, undefined, undefined, true),
                    new PlainDoseWrapper(2, undefined, undefined, true)
                    ])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "2 tabletter efter behov, højst 4 gange dagligt");
    });

    it('should return "hver morgen"', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), undefined, [
                new DayWrapper(1,
                    [new MorningDoseWrapper(2, undefined, undefined, false)
                    ])
            ], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018:\n" +
            "2 tabletter hver morgen");
    });
});

