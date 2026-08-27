import { DefaultDosageRendererFactory } from "../../main/ts/dosagerenderer/DefaultDosageRendererFactory";
import { DosageV2 } from "../../main/ts/dosagerenderer/Dosage";

const examples: DosageV2[] = [
    {
        AdministrationAccordingToSchemaInLocalSystem: {
            StartDate: "2026-06-04",
            EndDate: "2026-06-11"
        }
    },
    {
        UnitTexts: {
            Singular: "tablet",
            Plural: "tabletter"
        },
        DosagePeriod: [{
            Empty: true,
            PeriodLengthFreeText: "så länge skutan kan gå"
        },
        {
            Unspecified: true,
            PeriodLength: 7
        },
        {
            Fixed: {
                IterationInterval: 1,
                Day: [{
                    Index: 1,
                    Dosage: {
                        PartOfDayDosage: {
                            Morning: {
                                AccordingToParameterSchema: "Blodsukkerværdi"
                            }
                        }
                    }
                }],
                MinimumDurationBetweenDoses: 10
            }
        }],
        IsSelfAdministration: true,
        Parameter: [{
            ParameterName: "Blodsukkerværdi",
            ParameterLabel: "label",
            ParameterUnit: "mmol/L",
            ParameterSchema: {
                ParametricQuantity: [
                    {
                        FromValue: 0,
                        Quantity: 0
                    },
                    {
                        FromValue: 10,
                        Quantity: 1
                    },
                    {
                        FromValue: 12,
                        Quantity: 3
                    }
                ]
            }
        }]
    },
    {
        DosagePeriod: [
            {
                PeriodLength: 4,
                Fixed: {
                    IterationInterval: 1,
                    Day: [{
                        Index: 1,
                        Dosage: {
                            TimesPerDayDosage: {
                                Quantity: 1, TimesPerDay: 3
                            }
                        }
                    }]
                }
            }, {
                Fixed: {
                    IterationInterval: 1,
                    Day: [{
                        Index: 1,
                        Dosage: {
                            TimesPerDayDosage: {
                                Quantity: 2,
                                TimesPerDay: 4
                            }
                        }
                    }]
                }
            }
        ],
        Precondition: {
            UpdateValidFromUponHandover: false
        },
        UnitTexts: {
            Singular: "tablet",
            Plural: "tabletter"
        }
    },
    {
        UnitTexts: {
            Singular: "tablet",
            Plural: "tabletter"
        },
        DosagePeriod: [
            {
                PeriodLength: 4,
                Fixed: {
                    MinimumDurationBetweenDoses: 7200,
                    IterationInterval: 1,
                    Day: [{
                        Index: 1,
                        Dosage: {
                            UnlimitedDayDosage: {
                                Quantity: 1,
                                MaximumDailyDose: 7
                            }
                        }
                    }]
                }
            },
            {
                PeriodLength: 4,
                Fixed: {
                    Restriction: {
                        MaximumDailyDose: 8,
                        MinimumDurationBetweenDoses: 3600
                    },
                    IterationInterval: 1,
                    Day: [{
                        Index: 1,
                        Dosage: {
                            UnlimitedDayDosage: {
                                Quantity: 1
                            }
                        }
                    }]
                }
            }
        ]
    },
    {
        UnitText: "mg",
        DosagePeriod: [
            {
                PeriodLength: 4,
                Fixed: {
                    IterationInterval: 1,
                    Day: [{
                        Index: 1,
                        Dosage: {
                            TimesPerDayDosage: {
                                Quantity: 500,
                                TimesPerDay: 2,
                                Infusion: {
                                    Duration: 5
                                }
                            }
                        }
                    }]
                }
            }
        ]
    },
    {
        UnitText: "mg",
        DosagePeriod: [
            {
                PeriodLength: 4,
                Fixed: {
                    IterationInterval: 1,
                    Day: [{
                        Index: 1,
                        Dosage: {
                            TimesPerDayDosage: {
                                Quantity: 500,
                                TimesPerDay: 2,
                                Infusion: {
                                    MinimumInfusionRate: 100,
                                    MaximumInfusionRate: 200
                                }
                            }
                        }
                    }]
                }
            }
        ]
    },
    {
        DosagePeriod: [
            {
                Fixed: {
                    Restriction: {
                    },
                    IterationInterval: 7,
                    Week: [
                        {
                            Weekday: [
                                {
                                    Label: "Monday",
                                    Dosage: {
                                    }
                                },
                                {
                                    Label: "Tuesday",
                                    Dosage: {
                                    }
                                },
                                {
                                    Label: "Wednesday",
                                    Dosage: {
                                    }
                                },
                                {
                                    Label: "Thursday",
                                    Dosage: {
                                    }
                                },
                                {
                                    Label: "Friday",
                                    Dosage: {
                                    }
                                },
                                {
                                    Label: "Saturday",
                                    Dosage: {
                                    }
                                },
                                {
                                    Label: "Sunday",
                                    Dosage: {
                                    }
                                }
                            ]
                        }
                    ]
                }
            }
        ],
        Precondition: {
        },
        UnitTexts: {
            Singular: "tablet",
            Plural: "tabletter"
        }
    },
    { "DosagePeriod": [{ "Fixed": { "Restriction": {}, "IterationInterval": 1, "Day": [] } }], "Precondition": {}, "UnitTexts": { "Singular": "tablet", "Plural": "tabletter" } }
];

export function printExamples() {
    const converter = new DefaultDosageRendererFactory().getDosageRenderer({ html: false, oneLine: false });

    for (let i = 0; i < examples.length; i++) {
        const dosage = examples[i];
        const translation = converter.render(dosage);
        console.log("#" + i);
        console.log(JSON.stringify(dosage));
        console.log(translation);
    }
}


printExamples();