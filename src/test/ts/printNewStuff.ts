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
                Restriction: {
                    MaximumDailyDose: 7,
                    MinimumDurationBetweenDoses: 10
                }
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
                        Quantity: 2
                    },
                    {
                        FromValue: 12,
                        Quantity: 3
                    }
                ]
            }
        }]
    },
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