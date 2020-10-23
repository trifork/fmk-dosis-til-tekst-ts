/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { TimedDoseWrapper, LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper, LocalTime } from "../../../main/ts/index";

describe('DefaultMultiPeriodeConverterImpl', () => {

    it('should return periods sorted by startdate', () => {

        let periode1 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 26), undefined), [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
            new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])], undefined);

        let periode2 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 27), undefined), undefined, [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
            new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])], undefined);

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [periode1, periode2]));

        let longtext: string = LongTextConverter.getInstance().convertWrapper(dose);
        expect(longtext).to.equal("Dosering fra d. 22. jan. 2020 til d. 26. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 2 tabletter morgen\n" +
            "\n" +
            "Dosering fra d. 27. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 2 tabletter morgen");
    });

    it('should return periods sorted by fast/pn', () => {

        let periode1 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 23), undefined), new DateOrDateTimeWrapper(new Date(2020, 0, 26), undefined), [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
            new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])], undefined);

        let periode2 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2020, 0, 22), undefined), undefined, [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, true)]),
            new DayWrapper(2, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, true)])], undefined);

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [periode1, periode2]));

        let longtext: string = LongTextConverter.getInstance().convertWrapper(dose);
        expect(longtext).to.equal(
            "Dosering fra d. 23. jan. 2020 til d. 26. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen\n" +
            "Dag 2: 2 tabletter morgen\n" +
            "\n" +
            "Dosering fra d. 22. jan. 2020 - gentages hver 2. dag:\n" +
            "Dag 1: 1 tablet morgen efter behov højst 1 gang dagligt\n" +
            "Dag 2: 2 tabletter morgen efter behov højst 1 gang dagligt");
    });

    it('should use "hver 3. dag" and "hver 4. dag"', () => {

        let periode1 = new StructureWrapper(3, "", new DateOrDateTimeWrapper(new Date(2020, 5, 30), undefined), new DateOrDateTimeWrapper(new Date(2020, 6, 29), undefined), [
            new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined);

        let periode2 = new StructureWrapper(4, "", new DateOrDateTimeWrapper(new Date(2020, 6, 30), undefined), undefined, [
            new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])], 
            undefined);

        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "plaster", "plastre"),
            [periode1, periode2]));

        let longtext: string = LongTextConverter.getInstance().convertWrapper(dose);
        expect(longtext).to.equal(
            "Dosering fra d. 30. juni 2020 til d. 29. juli 2020:\n" +
            "1 plaster hver 3. dag\n\n" +
            "Dosering fra d. 30. juli 2020:\n" +
            "1 plaster hver 4. dag");
    });

});

