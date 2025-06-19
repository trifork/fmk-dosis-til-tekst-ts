
import { assert, expect } from 'chai';
import { DateOrDateTimeWrapper, DayWrapper, DosageType, DosageTypeCalculator, DosageTypeCalculator144, DosageWrapper, NoonDoseWrapper, Structure, Structures, StructuresWrapper, StructureWrapper, UnitOrUnitsWrapper } from "../../main/ts/index";

describe('calculate function', () => {
    it('should return combined with fixed and empty periods', () => {

        const dw = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null, [
            new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2023, 6, 6), undefined), new DateOrDateTimeWrapper(new Date(2023, 6, 6), undefined),
                [], undefined),
            new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2023, 6, 8), undefined), new DateOrDateTimeWrapper(new Date(2023, 6, 10), undefined),
                [], undefined),
            new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2023, 6, 11), undefined), new DateOrDateTimeWrapper(new Date(2023, 6, 11), undefined),
                [new DayWrapper(1, [new NoonDoseWrapper(0.4, undefined, undefined, true)])], undefined),

        ], false));

        expect(DosageTypeCalculator144.calculateWrapper(dw)).to.equal(DosageType.Combined);
        expect(DosageTypeCalculator.calculateWrapper(dw)).to.equal(DosageType.Combined);
    });
});

describe('dosageType for empty dosages', () => {
    it('should return fast for EmptyStructures', () => {

        const dw = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null, [
            new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2023, 6, 11), undefined), new DateOrDateTimeWrapper(new Date(2023, 6, 11), undefined),
                [], undefined)], false));


        expect(DosageTypeCalculator144.calculateWrapper(dw)).to.equal(DosageType.Fixed);
    });

    it('should return fast for empty dosages', () => {

        const dw = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper("stk", undefined, undefined),
            null, null, [
            new StructureWrapper(1, "mod smerter", new DateOrDateTimeWrapper(new Date(2023, 6, 11), undefined), new DateOrDateTimeWrapper(new Date(2023, 6, 11), undefined),
                [new DayWrapper(1, [new NoonDoseWrapper(0, undefined, undefined, true)])], undefined)], false));


        expect(DosageTypeCalculator144.calculateWrapper(dw)).to.equal(DosageType.Fixed);
    });
});


describe('dateAbuts function', () => {
    it('should check if dates are abuts', () => {
        expect(DosageTypeCalculator144.dateAbuts(new Date(2017, 2, 1), new Date(2017, 2, 2))).to.be.true;
        expect(DosageTypeCalculator144.dateAbuts(new Date(2017, 3, 26), new Date(2017, 3, 27))).to.be.true;   // DST
        expect(DosageTypeCalculator144.dateAbuts(new Date(2017, 2, 1), new Date(2017, 2, 3))).to.be.false;
    });
});

// describe('dateTimeAbuts function', () => {
//     it('should check if dateTimes are abuts', () => {
//         expect(DosageTypeCalculator144.dateTimeAbuts(new Date(2017, 2, 1, 10, 0, 0), new Date(2017, 2, 1, 10, 0, 1))).to.be.true;
//         expect(DosageTypeCalculator144.dateTimeAbuts(new Date(2017, 2, 1, 10, 0, 0), new Date(2017, 2, 1, 11, 0, 0))).to.be.false;
//     });
// });

describe('abuts function with dates', () => {
    it('should return that structures with enddates are abuts', () => {
        const s1: Structure = {
            iterationInterval: 1,
            startDate: "2017-01-01",
            endDate: "2017-01-02",
            days: [],
            supplText: "mod smerter"
        };
        const s2: Structure = {
            iterationInterval: 1,
            startDate: "2017-01-03",
            endDate: "2017-01-03",
            days: [],
            supplText: "mod smerter"
        };
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.true;
    });

    it('should return false when periods overlaps', () => {
        const s1: Structure = {
            iterationInterval: 1,
            startDate: "2017-01-01",
            endDate: "2017-01-03",
            days: [],
            supplText: "mod smerter"
        };
        const s2: Structure = {
            iterationInterval: 1,
            startDate: "2017-01-03",
            endDate: "2017-01-03",
            days: [],
            supplText: "mod smerter"
        };
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });

    it('should return false when periods has gaps', () => {
        const s1: Structure = {
            iterationInterval: 1,
            startDate: "2017-01-01",
            endDate: "2017-01-02",
            days: [],
            supplText: "mod smerter"
        };
        const s2: Structure = {
            iterationInterval: 1,
            startDate: "2017-01-05",
            endDate: "2017-01-06",
            days: [],
            supplText: "mod smerter"
        };
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });

    it('should return false when first period has no enddate', () => {
        const s1: Structure = {
            iterationInterval: 1,
            startDate: "2017-01-01",
            days: [],
            supplText: "mod smerter"
        };
        const s2: Structure = {
            iterationInterval: 1,
            startDate: "2017-01-05",
            endDate: "2017-01-06",
            days: [],
            supplText: "mod smerter"
        };
        expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
    });
});

// describe('abuts function with dateTimes', () => {
//     it('should return that structures with enddates are abuts', () => {
//         const s1: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 1, 10, 0, 0))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 2, 11, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         const s2: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 2, 11, 0, 1))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 3, 8, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.true;
//     });

//     // First structure with end date - equals seconds structures start (only possible due to old data in production, validation rejects new dosages of that kind)
//     it('should return that structures with enddates are abuts', () => {
//         const s1: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 1, 10, 0, 0))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 2, 11, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         const s2: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 2, 11, 0, 0))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 3, 8, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.true;
//     });

//     it('should return false when periods overlaps', () => {
//         const s1: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 1, 10, 0, 0))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 3, 9, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         const s2: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 3, 8, 0, 1))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 5, 11, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
//     });

//     it('should return false when periods has gaps', () => {
//         const s1: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 1, 10, 0, 0))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 3, 11, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         const s2: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 3, 11, 0, 2))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 5, 11, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
//     });

//     it('should return false when first period has no enddate', () => {
//         const s1: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 1, 10, 0, 0))
//             },
//             endDateOrDateTime: undefined,
//             days: [],
//             supplText: "mod smerter"
//         };
//         const s2: Structure = {
//             iterationInterval: 1,
//             startDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 3, 11, 0, 2))
//             },
//             endDateOrDateTime: {
//                 dateTime: formatDateTime(new Date(2017, 1, 5, 11, 0, 0))
//             },
//             days: [],
//             supplText: "mod smerter"
//         };
//         expect(DosageTypeCalculator144.abuts(s1, s2)).to.be.false;
//     });
// });

describe('splitInFixedAndPN function', () => {
    it('should split pn-only in fixed: 0 and pn: 1', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];

        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: true
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                }
            ],
            startDate:  "2017-01-01",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(0, fixedStructures.length);
        assert.equal(1, pnStructures.length);
    });

    it('should split pn-only in fixed: 1 and pn: 0', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];

        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: false
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                }
            ],
            startDate: "2017-01-01",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(1, fixedStructures.length);
        assert.equal(0, pnStructures.length);
    });

    it('should split empty + notempty in fixed: 2 and pn: 0', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];

        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-03",
                    endDate: "2017-01-10",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: false
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                }
            ],
            startDate: "2017-01-01",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(2, fixedStructures.length);
        assert.equal(0, pnStructures.length);
    });

    it('should split notempty + empty in fixed: 2 and pn: 0', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];

        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: false
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-03",
                    endDate: "2017-01-10",
                    days: [],
                    supplText: "mod smerter"
                }
            ],
            startDate: "2017-01-01",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(2, fixedStructures.length);
        assert.equal(0, pnStructures.length);
    });

    it('should split  empty + pn notempty in fixed: 0 and pn: 2', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];

        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-03",
                    endDate: "2017-01-10",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: true
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                }
            ],
            startDate: "2017-01-01",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(0, fixedStructures.length);
        assert.equal(2, pnStructures.length);
    });

    it('should split pn notempty + empty in fixed: 0 and pn: 2', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];

        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: true
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-03",
                    endDate: "2017-01-10",
                    days: [],
                    supplText: "mod smerter"
                }
            ],
            startDate: "2017-01-01",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(0, fixedStructures.length);
        assert.equal(2, pnStructures.length);
    });

    it('should split empty + pn notempty + empty in fixed: 0 and pn: 3', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];


        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2016-12-29",
                    endDate: "2016-12-31",
                    days: [],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: true
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-03",
                    endDate: "2017-01-10",
                    days: [],
                    supplText: "mod smerter"
                }
            ],
            startDate: "2016-12-29",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(0, fixedStructures.length);
        assert.equal(3, pnStructures.length);
    });

    it('should split empty + fixed notempty + empty in fixed: 3 and pn: 0', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];

        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2016-12-29",
                    endDate: "2016-12-31",
                    days: [],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: false
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-03",
                    endDate: "2017-01-10",
                    days: [],
                    supplText: "mod smerter"
                }
            ],
            startDate: "2016-12-29",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(3, fixedStructures.length);
        assert.equal(0, pnStructures.length);
    });

    it('should split notempty + fixed empty + notempty and overlapping empty  in fixed: 3 and pn: 1', () => {

        const fixedStructures: Structure[] = [];
        const pnStructures: Structure[] = [];

        const sw: Structures = {
            unitOrUnits: { unit: "stk" },
            structures: [
                {
                    iterationInterval: 1,
                    startDate: "2016-12-29",
                    endDate: "2016-12-31",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: false
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-01",
                    endDate: "2017-01-02",
                    days: [],
                    supplText: "mod smerter"
                },
                {
                    iterationInterval: 1,
                    startDate: "2017-01-03",
                    endDate: "2017-01-10",
                    days: [
                        {
                            dayNumber: 1,
                            allDoses: [
                                {
                                    doseQuantity: 4,
                                    type: "PlainDoseWrapper",
                                    isAccordingToNeed: false
                                }
                            ]
                        }
                    ],
                    supplText: "mod smerter"
                }
            ],
            startDate: "2016-12-29",
            endDate: undefined,
            isPartOfMultiPeriodDosage: false
        };

        DosageTypeCalculator144.splitInFixedAndPN(sw, fixedStructures, pnStructures);
        assert.equal(3, fixedStructures.length);
        assert.equal(1, pnStructures.length);
    });
});