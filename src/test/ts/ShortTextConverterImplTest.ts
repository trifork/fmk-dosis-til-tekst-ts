/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { ShortTextConverter, LongTextConverter, StructureWrapper, DateOrDateTimeWrapper, DayWrapper, DosageWrapper, StructuresWrapper, UnitOrUnitsWrapper, MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper, PlainDoseWrapper } from "../../main/ts/index";

describe('ShortTextConverter', () => {

    it('should not return anything, since Morning and Evening have different labels', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false),
                new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose)).to.be.null;
    });

    it('should not just return dag 1, Dag 3', () => {
        // {"structures":{"unitOrUnits":{"unitSingular":"ml","unitPlural":"ml"},"structures":[{"iterationInterval":0,"startDateOrDateTime":{"date":1552431600000},"endDateOrDateTime":{"date":1552604400000},"days":[{"dayNumber":1,"allDoses":[{"doseQuantity":0.025000000000000001387778780781445675529539585113525390625,"doseQuantityString":"0,025000000000000001387778780781445675529539585113525390625","isAccordingToNeed":false,"type":"NoonDoseWrapper"}],"plainDoses":[],"noonDose":{"doseQuantity":0.025000000000000001387778780781445675529539585113525390625,"doseQuantityString":"0,025000000000000001387778780781445675529539585113525390625","isAccordingToNeed":false,"type":"NoonDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":3,"allDoses":[{"doseQuantity":0.025000000000000001387778780781445675529539585113525390625,"doseQuantityString":"0,025000000000000001387778780781445675529539585113525390625","isAccordingToNeed":false,"type":"NoonDoseWrapper"}],"plainDoses":[],"noonDose":{"doseQuantity":0.025000000000000001387778780781445675529539585113525390625,"doseQuantityString":"0,025000000000000001387778780781445675529539585113525390625","isAccordingToNeed":false,"type":"NoonDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1}]}]},"structured":true}
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, 'ml', 'ml'),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 13), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 15), undefined), [
                new DayWrapper(1, [new NoonDoseWrapper(2.5, undefined, undefined, undefined, undefined, undefined, false)]),
                new DayWrapper(3, [new NoonDoseWrapper(2.5, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, 100)).to.equal('2,5 ml middag dag 1 og 3');
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal('Doseringsforløbet starter lørdag den 13. april 2019, og ophører mandag den 15. april 2019.\n' +
            'Bemærk at doseringen har et komplekst forløb:\n' +
            '   Doseringsforløb:\n' +
            '   Lørdag den 13. april 2019: 2,5 ml middag\n' +
            '   Mandag den 15. april 2019: 2,5 ml middag');

    });

    it('should add (ikke gentaget) on "2 tabletter morgen" dosages', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose)).to.equal("2 tabletter morgen daglig");
    });

    it('should add (ikke gentaget) on "1 tablet nat daglig" dosages', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, "suppl tekst", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new NightDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)])
            ], undefined)]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose)).to.equal("1 tablet nat daglig.\nBemærk: suppl tekst");
    });


    it('should add (ikke gentaget) on "2 tabletter morgen', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, "test af suppl", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)

                ])
            ], undefined)]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, 200)).to.equal("2 tabletter morgen daglig.\nBemærk: test af suppl");

    });


});


describe('CombinedTwoPeriodesConverterImpl', () => {
    // FMK-4530 
    it('should not crash and should return null due to too long shorttext for period 1', () => {
        expect(ShortTextConverter.getInstance().convertStr(
            '{"structures":{"unitOrUnits":{"unit":"injektionssprøjte(30 MIE)"},"structures":[{"iterationInterval":0,"supplText":"1 sprøjte: 30 MIE","startDateOrDateTime":{"date":1525644000000},"endDateOrDateTime":{"date":1526767200000},"days":[{"dayNumber":1,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":4,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":8,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":11,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":15,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":18,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":22,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":25,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1}],"refToSource":{"iterationInterval":0,"supplementaryText":"1 sprøjte: 30 MIE","start":{"date":1525644000000},"end":{"date":1526767200000},"dosageDayElements":[{"dayNumber":1,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":true,"empty":false},{"dayNumber":4,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":8,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":11,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":15,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":18,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":22,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":25,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false}],"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"mixed":false,"dailyDosage":false,"empty":false}},{"iterationInterval":7,"supplText":"1 sprøjte: 30 MIE","startDateOrDateTime":{"date":1526853600000},"endDateOrDateTime":{"date":1529186400000},"days":[{"dayNumber":1,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"PlainDoseWrapper"}],"plainDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"PlainDoseWrapper"}],"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":1,"numberOfDoses":1}],"refToSource":{"iterationInterval":7,"supplementaryText":"1 sprøjte: 30 MIE","start":{"date":1526853600000},"end":{"date":1529186400000},"dosageDayElements":[{"dayNumber":1,"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false}],"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"mixed":false,"dailyDosage":false,"empty":false}}]},"structured":true}'
        )).to.be.null;
    });

    // FMK-4530 
    it('should not crash and should return something not-null', () => {
        expect(ShortTextConverter.getInstance().convertStr(
            '{"structures":{"unitOrUnits":{"unit":"injektionssprøjte(30 MIE)"},"structures":[{"iterationInterval":0,"supplText":"1 sprøjte: 30 MIE","startDateOrDateTime":{"date":1525644000000},"endDateOrDateTime":{"date":1526767200000},"days":[{"dayNumber":1,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":4,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":8,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":11,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":15,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":18,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":22,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":25,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1}],"refToSource":{"iterationInterval":0,"supplementaryText":"1 sprøjte: 30 MIE","start":{"date":1525644000000},"end":{"date":1526767200000},"dosageDayElements":[{"dayNumber":1,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":true,"empty":false},{"dayNumber":4,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":8,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":11,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":15,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":18,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":22,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":25,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false}],"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"mixed":false,"dailyDosage":false,"empty":false}},{"iterationInterval":7,"supplText":"1 sprøjte: 30 MIE","startDateOrDateTime":{"date":1526853600000},"endDateOrDateTime":{"date":1529186400000},"days":[{"dayNumber":1,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"PlainDoseWrapper"}],"plainDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"PlainDoseWrapper"}],"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":1,"numberOfDoses":1}],"refToSource":{"iterationInterval":7,"supplementaryText":"1 sprøjte: 30 MIE","start":{"date":1526853600000},"end":{"date":1529186400000},"dosageDayElements":[{"dayNumber":1,"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false}],"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"mixed":false,"dailyDosage":false,"empty":false}}]},"structured":true}'
            , 10000)).to.eq("1 injektionssprøjte(30 MIE) morgen dag 1, 4, 8, 11, 15, 18, 22 og 25 i 25 dage, herefter 1 injektionssprøjte(30 MIE) mandag hver uge.\nBemærk: 1 sprøjte: 30 MIE");
    });

    it('should not add  null', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)
                    ]),
            ], undefined)
            ]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, 200)).to.equal("1 tablet morgen daglig");
    });


    it('should not crash (FMK-5299)', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(2019, 8, 1), undefined), new DateOrDateTimeWrapper(new Date(2019, 8, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined),
            new StructureWrapper(1, undefined, new DateOrDateTimeWrapper(new Date(2019, 8, 2), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)

            ]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, 200)).to.equal("Første dag 1 tablet, herefter 2 tabletter 1 gang daglig");
    });

    it('should add ikke gentaget', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(2019, 8, 1), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)

            ]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, 200)).to.equal("1 tablet morgen daglig");
    });

    it('should not crash either (FMK-6245)', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(1452639600000), undefined), new DateOrDateTimeWrapper(new Date(1591480800000), undefined), [
                new DayWrapper(1, [new EveningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined),
            new StructureWrapper(1, undefined, new DateOrDateTimeWrapper(new Date(1591567200000), undefined), new DateOrDateTimeWrapper(new Date(1654639200000), undefined), [
                new DayWrapper(1, [new NightDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)

            ]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, 200)).to.be.null;
    });    

    it('combined should work with one day', () => {
        let dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(1452639600000), undefined), new DateOrDateTimeWrapper(new Date(1452639600000), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined),
            new StructureWrapper(1, undefined, new DateOrDateTimeWrapper(new Date(1591567200000), undefined), new DateOrDateTimeWrapper(new Date(1654639200000), undefined), [
                new DayWrapper(1, [new NightDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)]),
            ], undefined)

            ]));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, 200)).to.equal("Første dag 2 tabletter, herefter 2 tabletter nat");
    });   
});

