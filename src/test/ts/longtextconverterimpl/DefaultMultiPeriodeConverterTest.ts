
import { expect } from 'chai';
import { DateOrDateTimeWrapper, DayWrapper, DosageWrapper, LongTextConverter, MorningDoseWrapper, PlainDoseWrapper, StructuresWrapper, StructureWrapper, UnitOrUnitsWrapper } from "../../../main/ts/index";
import { TextOptions } from "../../../main/ts/TextOptions";

describe('DefaultMultiPeriodeConverterImpl', () => {

    it('should return periods sorted by startdate', () => {

        const periode1 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 26), undefined), [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false)]),
            new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, false)])], undefined);

        const periode2 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 27), undefined), undefined, [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false)]),
            new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, false)])], undefined);

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null, [periode1, periode2], false));

        const longtext: string = LongTextConverter.getInstance().convertWrapper(dose);
        expect(longtext).to.equal("Dosering fra d. 22. jan. 2020 til d. 26. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 2 tabletter morgen\n" +
            "\n" +
            "Dosering fra d. 27. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 2 tabletter morgen");
    });

    it('should return periods sorted by fast/pn', () => {

        const periode1 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 23), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 26), undefined), [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false)]),
            new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, false)])], undefined);

        const periode2 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 23), undefined), undefined, [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, true)]),
            new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, true)])], undefined);

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null, [periode2, periode1], false));

        const longtext: string = LongTextConverter.getInstance().convertWrapper(dose);
        expect(longtext).to.equal(
            "Dosering fra d. 23. jan. 2020 til d. 26. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 2 tabletter morgen\n" +
            "\n" +
            "Dosering fra d. 23. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen efter behov\n" +
            "Dag 2: 2 tabletter morgen efter behov");
    });

    it('should use "hver 3. dag" and "hver 4. dag"', () => {

        const periode1 = new StructureWrapper(3, "", new DateOrDateTimeWrapper(new Date(2020, 5, 30), undefined), new DateOrDateTimeWrapper(new Date(2020, 6, 29), undefined), [
            new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)])
        ], undefined);

        const periode2 = new StructureWrapper(4, "", new DateOrDateTimeWrapper(new Date(2020, 6, 30), undefined), undefined, [
            new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)])],
            undefined);

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "plaster", "plastre"),
            null, null, [periode1, periode2], false));

        const longtext: string = LongTextConverter.getInstance().convertWrapper(dose);
        expect(longtext).to.equal(
            "Dosering fra d. 30. juni 2020 til d. 29. juli 2020:\n" +
            "1 plaster hver 3. dag\n\n" +
            "Dosering fra d. 30. juli 2020:\n" +
            "1 plaster hver 4. dag");
    });


    it('should return 0-dosages for empty days with option VKA', () => {

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2020, 9, 27), undefined), new DateOrDateTimeWrapper(new Date(2020, 10, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
                new DayWrapper(3, [new PlainDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(3, undefined, undefined, false)]),
            ], undefined),

            new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2020, 10, 2), undefined), new DateOrDateTimeWrapper(new Date(2020, 11, 9), undefined), [
                new DayWrapper(2, [new PlainDoseWrapper(2, undefined, undefined, false)]),
                new DayWrapper(5, [new PlainDoseWrapper(4, undefined, undefined, false)]),
            ], undefined),
            ], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA)).to.equal(
            "Dosering fra d. 27. okt. 2020 til d. 1. nov. 2020:\n" +
            "Tirsdag d. 27. okt. 2020: 1 tablet\n" +
            "Onsdag d. 28. okt. 2020: 0 tabletter\n" +
            "Torsdag d. 29. okt. 2020: 2 tabletter\n" +
            "Fredag d. 30. okt. 2020: 0 tabletter\n" +
            "Lørdag d. 31. okt. 2020: 3 tabletter\n" +
            "Søndag d. 1. nov. 2020: 0 tabletter\n\n" +
            "Dosering fra d. 2. nov. 2020 til d. 9. dec. 2020 - gentages hver uge:\n" +
            "Mandag: 0 tabletter\n" +
            "Tirsdag: 2 tabletter\n" +
            "Onsdag: 0 tabletter\n" +
            "Torsdag: 0 tabletter\n" +
            "Fredag: 4 tabletter\n" +
            "Lørdag: 0 tabletter\n" +
            "Søndag: 0 tabletter");
    });

});

