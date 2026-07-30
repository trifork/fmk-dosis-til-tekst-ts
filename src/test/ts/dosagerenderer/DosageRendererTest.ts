
import { expect } from 'chai';
import { DosageV2 } from '../../../main/ts/dosagerenderer/Dosage';
import { DefaultDosageRendererFactory } from '../../../main/ts/dosagerenderer/DefaultDosageRendererFactory';

describe('DosageRendererTest', () => {

    [
        { minutes: 1, duration: "1 minut" },
        { minutes: 2, duration: "2 minutter" },
        { minutes: 60, duration: "1 time" },
        { minutes: 120, duration: "2 timer" },
        { minutes: 24 * 60, duration: "1 dag" },
        { minutes: 2 * 24 * 60, duration: "2 dage" },
        { minutes: 2 * 60 + 3, duration: "2 timer og 3 minutter" },
        { minutes: 135, duration: "2 timer og 15 minutter" },
        { minutes: 24 * 60 + 2 * 60 + 3, duration: "1 dag, 2 timer og 3 minutter" }
    ].forEach(({ minutes, duration }) => {
        it(`renders a minimum duration of ${minutes} minutes as ${duration}`, () => {
            const dosage: DosageV2 = {
                UnitTexts: {
                    Plural: "tabletter",
                    Singular: "tablet"
                },
                DosagePeriod: [{
                    Fixed: {
                        Restriction: {
                            MinimumDurationBetweenDoses: minutes
                        },
                        UnspecifiedDay: {
                            Dosage: {
                                UnlimitedDayDosage: {
                                    Quantity: 1
                                }
                            }
                        }
                    }
                }]
            };
            const dosageRenderer = new DefaultDosageRendererFactory().getDosageRenderer({ oneLine: true });

            expect(dosageRenderer.render(dosage))
                .to.equal(`1 tablet ubegrænset antal gange på valgfri dag mindst ${duration} imellem doser`);
        });
    });

    it.skip('test 1', () => {
        const dosage: DosageV2 = {
            UnitTexts: {
                Plural: "tabletter",
                Singular: "tablet"
            },
            DosagePeriod: [{
                PeriodLength: 6,
                Fixed: {
                    IterationInterval: 2,
                    Day: [
                        {
                            Index: 1,
                            Dosage: {
                                PartOfDayDosage: {
                                    Morning: {
                                        Quantity: 3
                                    },
                                    Evening: {
                                        Quantity: 3
                                    },
                                    Night: {
                                        Quantity: 3
                                    }
                                }
                            }
                        }
                    ], 
                    Instruction: "Bemærk: tages med rigeligt vand"
                }
            }]
        };

        const dosageRenderer = new DefaultDosageRendererFactory().getDosageRenderer({ oneLine: true });

        expect(dosageRenderer.render(dosage)).to.equal("1 tablet morgen");

    });

    it.skip('test 2', () => {
        const dosage: DosageV2 = {
            UnitTexts: {
                Plural: "tabletter",
                Singular: "tablet"
            },
            DosagePeriod: [{
                PeriodLength: 1,
                Fixed: {
                    IterationInterval: 1,
                    Day: [
                        {
                            Index: 1,
                            Dosage: {
                                PartOfDayDosage: {
                                    Morning: {
                                        Quantity: 1
                                    },
                                    Evening: {
                                        Quantity: 3
                                    },
                                    Night: {
                                        Quantity: 3
                                    }
                                }
                            }
                        }
                    ]
                }
            }]
        };

        const dosageRenderer = new DefaultDosageRendererFactory().getDosageRenderer({ oneLine: true });

        expect(dosageRenderer.render(dosage)).to.equal("1 tablet morgen");

    });

    it.skip('test 2', () => {
        const dosage: DosageV2 = {
            UnitTexts: {
                Plural: "tabletter",
                Singular: "tablet"
            },
            DosagePeriod: [{
                PeriodLength: 1,
                Fixed: {
                    IterationInterval: 1,
                    Day: [
                        {
                            Index: 1,
                            Dosage: {
                                TimeOfDayDosage: [{
                                    Time: { 
                                        hour: 12,
                                        minute: 0
                                    }, 
                                    Quantity: 7
                                }],
                            }
                        }
                    ]
                }
            }]
        };

        const dosageRenderer = new DefaultDosageRendererFactory().getDosageRenderer({ oneLine: true });

        expect(dosageRenderer.render(dosage)).to.equal("1 tablet morgen");

    });
});

