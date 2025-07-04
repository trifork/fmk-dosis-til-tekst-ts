
import { expect } from 'chai';
import { DateOrDateTimeWrapper, DayWrapper, DosageWrapper, EveningDoseWrapper, LongTextConverter, MorningDoseWrapper, NightDoseWrapper, NoonDoseWrapper, PlainDoseWrapper, ShortTextConverter, StructuresWrapper, StructureWrapper, UnitOrUnitsWrapper } from "../../main/ts/index";
import { TextOptions } from '../../main/ts/TextOptions';

describe('ShortTextConverter', () => {

    it('should return højst 1 daglig for PN day=1 and iter=1', () => {

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2019, 3, 18), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 23), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, true)]),
            ], undefined)], false));

        expect(ShortTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "1 tablet efter behov, højst 1 gang dagligt");
    });

    it('not-iterated should not write daglig', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(Date.parse("2020-08-27")), undefined), new DateOrDateTimeWrapper(new Date(Date.parse("2020-09-02")), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(3, undefined, undefined, false)]),
            ], undefined)


            ], false));

        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("3 tabletter morgen 1 gang");

    });

    it('should not return anything, since Morning and Evening have different labels', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, false),
                new EveningDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose)).to.be.null;
    });

    it('should not just return dag 1, Dag 3', () => {
        // {"structures":{"unitOrUnits":{"unitSingular":"ml","unitPlural":"ml"},"structures":[{"iterationInterval":0,"startDateOrDateTime":{"date":1552431600000},"endDateOrDateTime":{"date":1552604400000},"days":[{"dayNumber":1,"allDoses":[{"doseQuantity":0.025000000000000001387778780781445675529539585113525390625,"doseQuantityString":"0,025000000000000001387778780781445675529539585113525390625","isAccordingToNeed":false,"type":"NoonDoseWrapper"}],"plainDoses":[],"noonDose":{"doseQuantity":0.025000000000000001387778780781445675529539585113525390625,"doseQuantityString":"0,025000000000000001387778780781445675529539585113525390625","isAccordingToNeed":false,"type":"NoonDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":3,"allDoses":[{"doseQuantity":0.025000000000000001387778780781445675529539585113525390625,"doseQuantityString":"0,025000000000000001387778780781445675529539585113525390625","isAccordingToNeed":false,"type":"NoonDoseWrapper"}],"plainDoses":[],"noonDose":{"doseQuantity":0.025000000000000001387778780781445675529539585113525390625,"doseQuantityString":"0,025000000000000001387778780781445675529539585113525390625","isAccordingToNeed":false,"type":"NoonDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1}]}]},"structured":true}
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, 'ml', 'ml'),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2019, 3, 13), undefined), new DateOrDateTimeWrapper(new Date(2019, 3, 15), undefined), [
                new DayWrapper(1, [new NoonDoseWrapper(2.5, undefined, undefined, false)]),
                new DayWrapper(3, [new NoonDoseWrapper(2.5, undefined, undefined, false)])
            ], undefined)], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 100)).to.equal('2,5 ml middag dag 1 og 3');
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal('Dosering fra d. 13. apr. 2019 til d. 15. apr. 2019:\n' +
            'Lørdag d. 13. apr. 2019: 2,5 ml middag\n' +
            'Mandag d. 15. apr. 2019: 2,5 ml middag');

    });

    it('should add "1 gang" on "2 tabletter morgen" dosages', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, false)])
            ], undefined)], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose)).to.equal("2 tabletter morgen 1 gang");
    });

    it('should add "1 gang" on "1 tablet nat daglig" dosages', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "suppl tekst", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new NightDoseWrapper(1, undefined, undefined, false)])
            ], undefined)], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose)).to.equal("1 tablet nat 1 gang.\nBemærk: suppl tekst");
    });


    it('should add "1 gang" on "2 tabletter morgen', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "test af suppl", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(2, undefined, undefined, false)

                ])
            ], undefined)], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("2 tabletter morgen 1 gang.\nBemærk: test af suppl");

    });


});

describe('LimitedNumberOfDaysConverterImpl', () => {



    it('should return 1 gang when not iterated', () => {

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "test af suppl", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(2, undefined, undefined, false)])

            ], undefined)], false));

        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("2 tabletter 1 gang.\nBemærk: test af suppl");
    });

});

describe('WeeklyRepeatedConverterImpl', () => {
    it('should æøå', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)
                ]),
                new DayWrapper(2, [new PlainDoseWrapper(1, undefined, undefined, false)
                ]),
                new DayWrapper(4, [new PlainDoseWrapper(1, undefined, undefined, false)
                ]),
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet onsdag, torsdag og lørdag hver uge");
    });

    it('one dosage day only should not write hver uge ', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet onsdag");
    });

    it('one dosage day two doses only should not write hver uge ', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false), new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet 2 gange onsdag");
    });
    
});


describe('RepeatedConverterImpl', () => {

    it('1 gang om måneden', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(30, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2022, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet 1 gang om måneden");
    });

    it('one dosage day only should not write hver måned', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(30, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet 1 gang");
    });

    
    it('two dosage days monthly', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(30, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2022, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false), new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet 2 gange samme dag 1 gang om måneden");
    });

    it('two dosage days monthly only one day  should not write hver måned', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(30, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false), new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet 2 gange samme dag");
    });

    
    it('biweekly should write hver 2. uge ', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(14, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2022, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet onsdag hver 2. uge");
    });
    
    it('one dosage day only biweekly should not write hver uge ', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(14, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet onsdag");
    });

    it('should  write hver 10. dag', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(10, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2022, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet hver 10. dag");
    });


    it('one dosage day only should not write hver 10. dag', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(10, "", new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), new DateOrDateTimeWrapper(new Date(2021, 11, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)
                ])
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 500)).to.equal("1 tablet 1 gang");
    });

});



describe('CombinedTwoPeriodesConverterImpl', () => {
    // FMK-4530 
    it('should not crash and should return null due to too long shorttext for period 1', () => {
        expect(ShortTextConverter.getInstance().convertStr(
            '{"structures":{"unitOrUnits":{"unit":"injektionssprøjte(30 MIE)"},"structures":[{"iterationInterval":0,"supplText":"1 sprøjte: 30 MIE","startDate":"2018-05-07","endDate":"2018-05-20","days":[{"dayNumber":1,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":4,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":8,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":11,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":15,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":18,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":22,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":25,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1}],"refToSource":{"iterationInterval":0,"supplementaryText":"1 sprøjte: 30 MIE","start":{"date":1525644000000},"end":{"date":1526767200000},"dosageDayElements":[{"dayNumber":1,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":true,"empty":false},{"dayNumber":4,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":8,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":11,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":15,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":18,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":22,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":25,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false}],"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"mixed":false,"dailyDosage":false,"empty":false}},{"iterationInterval":7,"supplText":"1 sprøjte: 30 MIE","startDate":"2018-05-21","endDate":"2018-06-17","days":[{"dayNumber":1,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"PlainDoseWrapper"}],"plainDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"PlainDoseWrapper"}],"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":1,"numberOfDoses":1}],"refToSource":{"iterationInterval":7,"supplementaryText":"1 sprøjte: 30 MIE","start":{"date":1526853600000},"end":{"date":1529186400000},"dosageDayElements":[{"dayNumber":1,"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false}],"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"mixed":false,"dailyDosage":false,"empty":false}}]},"structured":true}'
        )).to.be.null;
    });

    // FMK-4530 
    it('should not crash and should return something not-null', () => {
        expect(ShortTextConverter.getInstance().convertStr(
            '{"structures":{"unitOrUnits":{"unit":"injektionssprøjte(30 MIE)"},"structures":[{"iterationInterval":0,"supplText":"1 sprøjte: 30 MIE","startDate":"2018-05-07","endDate":"2018-05-20","days":[{"dayNumber":1,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":4,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":8,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":11,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":15,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":18,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":22,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1},{"dayNumber":25,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"}],"plainDoses":[],"morningDose":{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"MorningDoseWrapper"},"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":0,"numberOfDoses":1}],"refToSource":{"iterationInterval":0,"supplementaryText":"1 sprøjte: 30 MIE","start":{"date":1525644000000},"end":{"date":1526767200000},"dosageDayElements":[{"dayNumber":1,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":true,"empty":false},{"dayNumber":4,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":8,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":11,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":15,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":18,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":22,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false},{"dayNumber":25,"dosageTimes":[],"morning":{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false}],"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false},{"quantity":1.000000000,"dosageTimeType":"isMorning","accordingToNeed":false,"plural":false}],"mixed":false,"dailyDosage":false,"empty":false}},{"iterationInterval":7,"supplText":"1 sprøjte: 30 MIE","startDate":"2018-05-21","endDate":"2018-06-17","days":[{"dayNumber":1,"allDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"PlainDoseWrapper"}],"plainDoses":[{"doseQuantity":1.000000000,"doseQuantityString":"1","isAccordingToNeed":false,"type":"PlainDoseWrapper"}],"accordingToNeedDoses":[],"numberOfAccordingToNeedDoses":0,"numberOfPlainDoses":1,"numberOfDoses":1}],"refToSource":{"iterationInterval":7,"supplementaryText":"1 sprøjte: 30 MIE","start":{"date":1526853600000},"end":{"date":1529186400000},"dosageDayElements":[{"dayNumber":1,"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"allDosages":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"dailyDosage":false,"empty":false}],"dosageTimes":[{"quantity":1.000000000,"dosageTimeType":"isDosageTime","accordingToNeed":false,"plural":false}],"mixed":false,"dailyDosage":false,"empty":false}}]},"structured":true}'
            , TextOptions.STANDARD.toString(), 10000)).to.eq("1 injektionssprøjte(30 MIE) morgen dag 1, 4, 8, 11, 15, 18, 22 og 25 i 25 dage, herefter 1 injektionssprøjte(30 MIE) mandag hver uge.\nBemærk: 1 sprøjte: 30 MIE");
    });

    it('should not add  null', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false)
                ]),
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("1 tablet morgen 1 gang");
    });


    it('should not crash (FMK-5299)', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(2019, 8, 1), undefined), new DateOrDateTimeWrapper(new Date(2019, 8, 1), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
            ], undefined),
            new StructureWrapper(1, undefined, new DateOrDateTimeWrapper(new Date(2019, 8, 2), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(2, undefined, undefined, false)]),
            ], undefined)

            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("Første dag 1 tablet, herefter 2 tabletter 1 gang daglig");
    });

    it('should add 1 gang', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(2019, 8, 1), undefined), undefined, [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false)]),
            ], undefined)

            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("1 tablet morgen 1 gang");
    });

    it('should not crash either (FMK-6245)', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(1452639600000), undefined), new DateOrDateTimeWrapper(new Date(1591480800000), undefined), [
                new DayWrapper(1, [new EveningDoseWrapper(2, undefined, undefined, false)]),
            ], undefined),
            new StructureWrapper(1, undefined, new DateOrDateTimeWrapper(new Date(1591567200000), undefined), new DateOrDateTimeWrapper(new Date(1654639200000), undefined), [
                new DayWrapper(1, [new NightDoseWrapper(2, undefined, undefined, false)]),
            ], undefined)

            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.be.null;
    });

    it('should be able to survive empty first period (FMK-6273)', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(1590962400000), undefined), new DateOrDateTimeWrapper(new Date(1591480800000), undefined), [

            ], undefined),
            new StructureWrapper(5, undefined, new DateOrDateTimeWrapper(new Date(1591567200000), undefined), new DateOrDateTimeWrapper(new Date(1654639200000), undefined), [
                new DayWrapper(1, [new NightDoseWrapper(2, undefined, undefined, false)]),
            ], undefined)

            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.be.null;
    });


    it('combined should work with one day', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(1452639600000), undefined), new DateOrDateTimeWrapper(new Date(1452639600000), undefined), [
                new DayWrapper(1, [new PlainDoseWrapper(2, undefined, undefined, false)]),
            ], undefined),
            new StructureWrapper(1, undefined, new DateOrDateTimeWrapper(new Date(1591567200000), undefined), new DateOrDateTimeWrapper(new Date(1654639200000), undefined), [
                new DayWrapper(1, [new NightDoseWrapper(2, undefined, undefined, false)]),
            ], undefined)

            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("Første dag 2 tabletter, herefter 2 tabletter nat");
    });

    it('not-iterated should survive without enddate', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(1452639600000), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(1, undefined, undefined, false)]),
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("1 tablet 1 gang");
    });

    // FMK-6477
    it('should keep 0,5', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(1452639600000), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(0.5, undefined, undefined, false)]),
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD, 200)).to.equal("0,5 tablet 1 gang");
    });

    // FMK-6477
    it('should return empty short dosage text for VKA', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, undefined, new DateOrDateTimeWrapper(new Date(1452639600000), undefined), undefined, [
                new DayWrapper(1, [new PlainDoseWrapper(0.5, undefined, undefined, false)]),
            ], undefined)
            ], false));
        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.VKA, 200)).to.be.null;
    });

    // FMK-7010
    it('should return 1 day dosage for iteration 7 with same start and end date', () => {

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(7, "", new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false),
                    new EveningDoseWrapper(3, undefined, undefined, false)
                    ])
            ], undefined)], false));

        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD)).to.equal(
            "1 tablet morgen og 3 tabletter aften i 1 dag");
    });

    it('should return null for empty dosage period', () => {

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), [
                
            ], undefined)], false));

        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD)).to.be.null;
    });

    it('should return something for one day dosage period', () => {

        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false),
                    new EveningDoseWrapper(3, undefined, undefined, false)
                    ])
            ], undefined)], false));

        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD)).to.equal("1 tablet morgen og 3 tabletter aften i 1 dag");
    });

    it('should not look iterated', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [new StructureWrapper(14, "", new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), new DateOrDateTimeWrapper(new Date(2021, 9, 25), undefined), [
                new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false),
                    new EveningDoseWrapper(3, undefined, undefined, false)
                ])
            ], undefined)], false));

        expect(ShortTextConverter.getInstance().convertWrapper(dose, TextOptions.STANDARD)).to.equal("1 tablet morgen og 3 tabletter aften i 1 dag");

    });
});

