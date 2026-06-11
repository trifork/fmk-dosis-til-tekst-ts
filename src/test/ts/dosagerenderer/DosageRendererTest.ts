
import { expect } from 'chai';
import { DosageV2 } from '../../../main/ts/dosagerenderer/Dosage';
import { DefaultDosageRendererFactory } from '../../../main/ts/dosagerenderer/DefaultDosageRendererFactory';

describe('DosageRendererTest', () => {

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

