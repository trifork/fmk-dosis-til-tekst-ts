/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { DosageTypeCalculator144, MorningDoseWrapper, StructuresWrapper, StructureWrapper, DayWrapper, UnitOrUnitsWrapper, DateOrDateTimeWrapper, PlainDoseWrapper } from "../../main/ts/index";

describe('dateAbuts function', () => {
    it('should check if dates are abuts', () => {
        expect(DosageTypeCalculator144.dateAbuts(new Date(2017, 2, 1), new Date(2017, 2, 2))).to.be.true;
        expect(DosageTypeCalculator144.dateAbuts(new Date(2017, 3, 26), new Date(2017, 3, 27))).to.be.true;   // DST
        expect(DosageTypeCalculator144.dateAbuts(new Date(2017, 2, 1), new Date(2017, 2, 3))).to.be.false;
    });
});

describe('dateTimeAbuts function', () => {
    it('should check if dateTimes are abuts', () => {
        expect(DosageTypeCalculator144.dateTimeAbuts(new Date(2017, 2, 1, 10, 0, 0), new Date(2017, 2, 1, 10, 0, 1))).to.be.true;
        expect(DosageTypeCalculator144.dateTimeAbuts(new Date(2017, 2, 1, 10, 0, 0), new Date(2017, 2, 1, 11, 0, 0))).to.be.false;
    });
});

describe('abuts function with dates', () => {
    it('should return that structures with enddates are abuts', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined), [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.true;
    });

    it('should return false when periods overlaps', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });

    it('should return false when periods has gaps', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 5), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 6), undefined), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });

    it('should return false when first period has no enddate', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), undefined, [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 5), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 6), undefined), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });
});

describe('abuts function with dateTimes', () => {
    it('should return that structures with enddates are abuts', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 1, 10, 0, 0)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 2, 11, 0, 0)), [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 2, 11, 0, 1)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 3, 8, 0, 0)), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.true;
    });

	// First structure with end date - equals seconds structures start (only possible due to old data in production, validation rejects new dosages of that kind)
    it('should return that structures with enddates are abuts', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 1, 10, 0, 0)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 2, 11, 0, 0)), [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 2, 11, 0, 0)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 3, 8, 0, 0)), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.true;
    });

    it('should return false when periods overlaps', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 1, 10, 0, 0)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 3, 9, 0, 0)), [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 3, 8, 0, 1)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 5, 11, 0, 0)), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });

    it('should return false when periods has gaps', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 1, 10, 0, 0)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 3, 11, 0, 0)), [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 3, 11, 0, 2)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 5, 11, 0, 0)), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });

    it('should return false when first period has no enddate', () => {
        let s1 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 1, 10, 0, 0)), undefined, [], undefined);
        let s2 = new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 3, 11, 0, 2)), new DateOrDateTimeWrapper(undefined, new Date(2017, 1, 5, 11, 0, 0)), [], undefined);
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });
});

describe('splitInFixedAndPN function', () => {
    it('should split pn-only in fixed: 0 and pn: 1', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null, 
            [
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, true)])], undefined)
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(0, fixedStructures.length);
        assert.equal(1, pnStructures.length);
    });

    it('should split pn-only in fixed: 1 and pn: 0', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null,
            [
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, false)])], undefined)
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(1, fixedStructures.length);
        assert.equal(0, pnStructures.length);
    });

     it('should split empty + notempty in fixed: 2 and pn: 0', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null,
            [
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 10), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, false)])], undefined)
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(2, fixedStructures.length);
        assert.equal(0, pnStructures.length);
    });

     it('should split notempty + empty in fixed: 2 and pn: 0', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null, [
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, false)])], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 10), undefined),
                    [], undefined)
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(2, fixedStructures.length);
        assert.equal(0, pnStructures.length);
    });

     it('should split  empty + pn notempty in fixed: 0 and pn: 2', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null, 
            [
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 10), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, true)])], undefined)
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(0, fixedStructures.length);
        assert.equal(2, pnStructures.length);
    });

     it('should split pn notempty + empty in fixed: 0 and pn: 2', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null,[
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, true)])], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 10), undefined),
                    [], undefined)
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(0, fixedStructures.length);
        assert.equal(2, pnStructures.length);
    });

     it('should split empty + pn notempty + empty in fixed: 0 and pn: 3', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null,[
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2016, 12, 29), undefined), new DateOrDateTimeWrapper(new Date(2016, 12, 31), undefined),
                    [], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, true)])], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 10), undefined),
                    [], undefined),
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(0, fixedStructures.length);
        assert.equal(3, pnStructures.length);
    });

     it('should split empty + fixed notempty + empty in fixed: 3 and pn: 0', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null,[
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2016, 12, 29), undefined), new DateOrDateTimeWrapper(new Date(2016, 12, 31), undefined),
                    [], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, false)])], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 10), undefined),
                    [], undefined),
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(3, fixedStructures.length);
        assert.equal(0, pnStructures.length);
    });

    it('should split notempty + fixed empty + notempty and overlapping empty  in fixed: 3 and pn: 1', () => {

        let fixedStructures: StructureWrapper[] = [];
        let pnStructures: StructureWrapper[] = [];

        let sw = new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null,[
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2016, 12, 29), undefined), new DateOrDateTimeWrapper(new Date(2016, 12, 31), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, false)])], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 1), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 2), undefined),
                    [], undefined),
                new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2017, 1, 3), undefined), new DateOrDateTimeWrapper(new Date(2017, 1, 10), undefined),
                    [new DayWrapper(1, [new PlainDoseWrapper(4, undefined, undefined, false)])], undefined),
            ], false);

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(3, fixedStructures.length);
        assert.equal(1, pnStructures.length);
    });
});