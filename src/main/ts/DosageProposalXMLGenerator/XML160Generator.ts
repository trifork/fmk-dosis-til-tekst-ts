import { diffInDays } from "../DateUtil";
import { AbstractXMLGenerator } from "./AbstractXMLGenerator";
import { DosagePeriod } from "./DosagePeriod";
import { element, maybe, text } from "./xml/builders";
import { render } from "./xml/render";
import { Namespace, XmlElement } from "./xml/types";
import { XMLGenerator } from "./XMLGenerator";

export class XML160Generator extends AbstractXMLGenerator implements XMLGenerator {

    protected getNamespace(): string {
        return "fmk160";
    }

    public generateXml(periods: DosagePeriod[], unitTextSingular: string, unitTextPlural: string, supplementaryText?: string): string {
        const fmk160: Namespace = {
            prefix: "",
            uri: "http://fmk-teknik.dk/160"
        };

        const xml = element("Dosage", {
            ns: fmk160,
            children: [
                // Preconditions should be set by client
                // element("Precondition", {
                //     children: [
                //         element("ValidFrom", {
                //             children: [text(TextHelper.formatDate(new Date()))]
                //         })
                //     ]
                // })
                element("UnitTexts", {
                    children: [
                        element("Singular", {
                            children: [text(this.escape(unitTextSingular))]
                        }),
                        element("Plural", {
                            children: [text(this.escape(unitTextPlural))]
                        })
                    ]
                }),
                ...periods.map(p =>
                    this.mapDosagePeriod(p, supplementaryText)
                )
            ]
        });

        const rendered = render(xml);

        return rendered;
    }

    private mapDosagePeriod(period: DosagePeriod, supplementaryText: string): XmlElement {
        return element("DosagePeriod", {
            children: [
                ...maybe(!!(period.beginDate && period.endDate), () => this.mapPeriodLength(period)),
                element(period.getType() === "PN"
                    ? "PRN"
                    : "Fixed", {
                    children: [
                        ...maybe(!!supplementaryText, () => element("Instruction", {
                            children: [
                                element("FreeText", {
                                    children: [
                                        text(supplementaryText)
                                    ]
                                })
                            ]
                        })),
                        ...maybe(period.getIteration() > 0, () => element("IterationInterval", {
                            children: [
                                text(period.getIteration().toString())
                            ]
                        })),
                        ...this.mapDays(period)
                    ]
                })
            ]
        });
    }

    private mapPeriodLength(period: DosagePeriod) {
        return element("PeriodLength", {
            children: [
                text((diffInDays(period.beginDate, period.endDate) + 1).toString())
            ]
        })
    }

    protected getQuantityString(quantities: string[], isPN: boolean, dosageNS: string): string {
        let xml = "";

        for (const dose of quantities) {
            xml += "<" + dosageNS + ":Dose><" + dosageNS + ":Quantity>" + dose + "</" + dosageNS + ":Quantity>" + "</" + dosageNS + ":Dose>";
        }

        return xml;
    }

    private mapDays(period: DosagePeriod): XmlElement[] {

        const days = [...period.getMapping().matchAll(this.daysMappingRegExp)]
            .map(([_, key, value]) => ({
                dayNo: Number(key),
                mapping: value
            }));

        // Mapping didn't contain the "dag N:" syntax matched by regexp above
        if (days.length === 0) {
            days.push({
                dayNo: 1,
                mapping: period.getMapping()
            })
        }

        return days.map(day => element("Day", {
            children: [
                element("Index", {
                    children: [
                        text(day.dayNo.toString())
                    ]
                }),
                ...this.mapDoses(period, day)
            ]
        }));

    }

    private mapDoses(period: DosagePeriod, day: { dayNo: number; mapping: string; }): XmlElement[] {
        if (period.getType() === "M+M+A+N") {
            const [morning, noon, evening, night] = day.mapping.split("+");
            const doses: XmlElement[] = [];
            if (morning && morning !== "0") {
                doses.push(this.createDose("morning", morning));
            }
            if (noon && noon !== "0") {
                doses.push(this.createDose("noon", noon));
            }
            if (evening && evening !== "0") {
                doses.push(this.createDose("evening", evening));
            }
            if (night && night !== "0") {
                doses.push(this.createDose("night", night));
            }
            return doses;
        } else {
            const quantities = day.mapping.split(";").map(s => Number(s));
            const occurrenceMap = this.countOccurrences(quantities);
            const doses = [...occurrenceMap.entries()].flatMap(
                ([count, numbers]) =>
                    numbers.map((value) =>
                        element("Dose", {
                            children: [
                                element("TimesPerDay", {
                                    children: [
                                        text(String(count))
                                    ]
                                }),
                                element("Quantity", {
                                    children: [
                                        text(String(value))
                                    ]
                                })
                            ]
                        })
                    )
            );

            return doses;
        }
    }

    private createDose(timeOfDay: string, quantity: string) {
        return element("Dose", {
            children: [
                element("TimeOfDay", {
                    children: [
                        text(timeOfDay)
                    ]
                }),
                element("Quantity", {
                    children: [
                        text(quantity)
                    ]
                })
            ]
        });
    }

    private countOccurrences(numbers: number[]): Map<number, number[]> {
        const counts = numbers.reduce((map, n) => {
            map.set(n, (map.get(n) ?? 0) + 1);
            return map;
        }, new Map<number, number>());

        return [...counts.entries()].reduce(
            (map, [num, count]) => {
                map.set(count, [...(map.get(count) ?? []), num]);
                return map;
            },
            new Map<number, number[]>()
        );
    }

}
