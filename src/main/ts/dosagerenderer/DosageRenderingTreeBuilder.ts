import { formatDateOnly } from "../DateUtil";
import { LocalTimeHelper } from "../helpers/LocalTimeHelper";
import { DosageV2, DosageChoice, DosageParameter, DosagePeriodType, DosageRestriction, DosageStructure, DoseType, PartOfDayDosage, Precondition, WeekdayLabel } from "./Dosage";
import { RenderingContext } from "./RenderingContext";

export class DosageRenderingTreeBuilder {
    static WEEKDAY_NAMES: Record<WeekdayLabel, string> = {
        Monday: "mandag",
        Tuesday: "tirsdag",
        Wednesday: "onsdag",
        Thursday: "torsdag",
        Friday: "fredag",
        Saturday: "lørdag",
        Sunday: "søndag"
    };
    static TIME_OF_DAY_NAMES: Record<"Morning" | "Noon" | "Evening" | "Night", string> = {
        Morning: "morgen",
        Noon: "middag",
        Evening: "aften",
        Night: "nat"
    };

    public constructor(private dosage: DosageV2, private oneLine?: boolean) {
    }

    public render(ctx: RenderingContext) {
        return this.renderDosage(ctx, this.dosage);
    }

    private renderDosage(ctx: RenderingContext, dosage: DosageV2) {
        if (dosage.Precondition) {
            this.renderPrecondition(ctx, dosage.Precondition);
        }

        const headerCtx = ctx.beginHeader();
        if (dosage.AdministrationAccordingToSchemaInLocalSystem) {
            headerCtx.append(`fra ${dosage.AdministrationAccordingToSchemaInLocalSystem.StartDate}`);
            if (dosage.AdministrationAccordingToSchemaInLocalSystem.EndDate) {
                headerCtx.append(`til ${dosage.AdministrationAccordingToSchemaInLocalSystem.EndDate}`);
            }
            ctx.append("efter skema");
        } else if (dosage.FreeText) {
            headerCtx.append(`fra ${dosage.FreeText.StartDate}`);
            if (dosage.FreeText.EndDate) {
                headerCtx.append(`til ${dosage.FreeText.EndDate}`);
            }
            ctx.append(dosage.FreeText.Text);
        } else if (dosage.DosagePeriod) {
            dosage.DosagePeriod.forEach((period, index) => {
                const pCtx = ctx.beginParagraph();
                if (period.Empty) {
                    this.renderDosagePeriodHeader(ctx, period, index > 0);
                    this.renderEmptyPeriod(pCtx);
                } else if (period.Unspecified) {
                    this.renderDosagePeriodHeader(ctx, period, index > 0);
                    this.renderUnspecifiedPeriod(pCtx);
                } else {
                    // NOTE: If Fixed and PRN have different IterationInterval, we need to split period into 2 with separate headers!
                    const varyingIntervals = period.Fixed?.IterationInterval
                        && period.PRN?.IterationInterval
                        && period.Fixed?.IterationInterval !== period.PRN?.IterationInterval;

                    if (!varyingIntervals) {
                        this.renderDosagePeriodHeader(headerCtx, period, index === 0);
                        this.renderIteration(headerCtx, period.Fixed?.IterationInterval || period.PRN?.IterationInterval)
                    }
                    if (period.Fixed) {
                        if (varyingIntervals) {
                            this.renderDosagePeriodHeader(headerCtx, period, index === 0);
                            this.renderIteration(headerCtx, period.Fixed.IterationInterval)
                        }
                        this.renderDosageStructure(pCtx, period.Fixed, false);
                    }
                    if (period.PRN) {
                        if (varyingIntervals) {
                            this.renderDosagePeriodHeader(headerCtx, period, index === 0);
                            this.renderIteration(headerCtx, period.PRN.IterationInterval)
                        }
                        this.renderDosageStructure(pCtx, period.PRN, true);
                    }
                }
                if (this.oneLine) {
                    this.renderDuration(ctx, period);
                }
            });
        }

        if (dosage.IsSelfAdministration) {
            ctx.append("selvstyrende");
        }

        if (dosage.Parameter) {
            for (const parameter of dosage.Parameter) {
                this.renderParameter(ctx, parameter);
            }
        }
    }

    renderDosagePeriodHeader(ctx: RenderingContext, period: DosagePeriodType, firstPeriod: boolean) {
        ctx.append("dosering");
        if (period.PeriodLength || period.PeriodLengthFreeText) {
            this.renderDuration(ctx, period);
        } else if (!firstPeriod) {
            ctx.append("herefter");
        }
    }

    renderIteration(ctx: RenderingContext, iterationInterval: number) {
        if (iterationInterval) {
            if (iterationInterval === 1) {
                // ctx.append("- dagligt");
            } else {
                ctx.append(`- gentages hver ${iterationInterval} dag`);
            }
        }
    }

    renderPrecondition(ctx: RenderingContext, precondition: Precondition) {
        ctx = ctx.begin({ name: "precondition" });

        if (precondition.ValidFrom) {
            ctx.append(`Gyldig fra ${formatDateOnly(new Date(precondition.ValidFrom))}`);
            if (precondition.UpdateValidFromUponHandover) {
                ctx.append("(opdateres ved udlevering)")
            }
        } else {
            if (precondition.UpdateValidFromUponHandover) {
                ctx.append("Gyldig fra (opdateres ved udlevering)")
            }
        }
        if (precondition.PRNTrigger) {
            ctx.append(`Betingelse for påbegyndt behandling ${precondition.PRNTrigger}`);
        }

        if (precondition.EpisodicTreatment) {
            ctx.append(`PN-kur med startbetingelse ${precondition.EpisodicTreatment.Trigger}`);
        }
    }

    renderParameter(ctx: RenderingContext, parameter: DosageParameter) {
        ctx = ctx.begin({ name: "parameter", join: "capitalize-newline" });
        ctx.append(parameter.ParameterName);
        if (parameter.ParameterLabel) {
            ctx.append(parameter.ParameterLabel);
        }
        const tableCtx = ctx.beginTable();
        const tableHead = tableCtx.beginTableHead();
        tableHead.append("Fra værdi");
        tableHead.append("Dosis/instruks");

        for (const row of parameter.ParameterSchema?.ParametricQuantity) {
            const tableRow = tableCtx.beginTableRow();

            // Key column
            tableRow.append(row.Criterion || String(row.FromValue));

            // Value column
            let value;
            if (row.Quantity != null) {
                value = row.Quantity.toString();
            } else if (row.MinimumQuantity != null || row.MaximumQuantity != null) {
                value = `${row.MinimumQuantity} - ${row.MaximumQuantity}`;
            } else {
                value = row.Instruction;
            }
            tableRow.append(value);
        }
    }

    private renderEmptyPeriod(ctx: RenderingContext) {
        ctx.append("Ingen dosering i denne periode");
    }

    private renderUnspecifiedPeriod(ctx: RenderingContext) {
        ctx.append("Dosering ikke angivet");
    }

    private renderDosageStructure(ctx: RenderingContext, dosageStructure: DosageStructure, prn: boolean) {

        // if (!this.tryRenderSinglePartOfDayDosage(ctx, dosageStructure, prn)) {
        this.renderDays(ctx, dosageStructure, prn);
        // }

        if (dosageStructure.Instruction) {
            ctx.begin({ name: "instruction" })
                .append("Instruks:")
                .append(dosageStructure.Instruction);
        }

        if (dosageStructure.Restriction) {
            this.renderRestriction(ctx, dosageStructure.Restriction);
        }
    }

    tryRenderSinglePartOfDayDosage(ctx: RenderingContext, dosageStructure: DosageStructure, prn: boolean) {
        // Check rule mman-same-dose
        const singlePartOfDayDosage = this.getSingleDailyPartOfDayDosage(dosageStructure);
        if (singlePartOfDayDosage) {
            this.renderSinglePartOfDayDosage(ctx, singlePartOfDayDosage, prn);
            return true;
        }
        return false;
    }

    getSingleDailyPartOfDayDosage(dosageStructure: DosageStructure) {
        if (dosageStructure.IterationInterval === 1 && dosageStructure.Day?.length === 1) {
            const dosage = dosageStructure.Day[0].Dosage;
            if (!dosage.TimeOfDayDosage && !dosage.TimesPerDayDosage && !dosage.UnlimitedDayDosage) {
                const partOfDayDosage = dosageStructure.Day[0].Dosage.PartOfDayDosage;
                if (partOfDayDosage && Object.keys(partOfDayDosage).length === 1) {
                    return partOfDayDosage;
                }
            }
        }
    }

    renderSinglePartOfDayDosage(ctx: RenderingContext, partOfDayDosage: PartOfDayDosage, prn: boolean) {
        ctx = ctx.begin();

        let dose;
        let when;

        if (partOfDayDosage.Morning) {
            dose = partOfDayDosage.Morning;
            when = "morgen";
        }
        if (partOfDayDosage.Noon) {
            dose = partOfDayDosage.Noon;
            when = "middag";
        }
        if (partOfDayDosage.Evening) {
            dose = partOfDayDosage.Evening;
            when = "aften";
        }
        if (partOfDayDosage.Night) {
            dose = partOfDayDosage.Night;
            when = "nat";
        }

        this.renderDose(ctx, dose, prn);
        if (prn) {
            ctx.append("efter behov");
        }
        ctx.append(`hver ${when}`);
    }

    private renderDays(ctx: RenderingContext, dosageStructure: DosageStructure, prn: boolean) {

        if (dosageStructure.Day) {

            let singleTimeOfDay: string = undefined;

            if (dosageStructure.IterationInterval === 1) {
                singleTimeOfDay = this.getSingleTimeOfDay(dosageStructure.Day[0].Dosage);
                // Daily dosage - just render a single line
                this.renderDosageChoice(ctx, dosageStructure.Day[0].Dosage, prn, !singleTimeOfDay);
            } else {
                const defListCtx = ctx.beginDefinitionList();
                for (const day of dosageStructure.Day) {
                    const defDataCtx = defListCtx.beginDefinition({ term: `dag ${day.Index}` });

                    this.renderDosageChoice(defDataCtx, day.Dosage, prn);
                }
            }
            if (dosageStructure.IterationInterval) {
                if (dosageStructure.IterationInterval === 1) {
                    ctx.append(singleTimeOfDay ? `hver ${DosageRenderingTreeBuilder.TIME_OF_DAY_NAMES[singleTimeOfDay]}` : "dagligt");
                } else {
                    ctx.append(`gentages hver ${dosageStructure.IterationInterval}. dag`);
                }
            } else {
                // ctx.append("en gang");
            }

        } else if (dosageStructure.Week) {
            const defListCtx = ctx.beginDefinitionList();
            for (const week of dosageStructure.Week) {
                for (const weekDay of week.Weekday) {
                    const defDataCtx = defListCtx.beginDefinition({ term: `${DosageRenderingTreeBuilder.WEEKDAY_NAMES[weekDay.Label]}` });
                    this.renderDosageChoice(defDataCtx, weekDay.Dosage, prn);
                }
            }
        } else if (dosageStructure.UnspecifiedDay) {
            this.renderDosageChoice(ctx, dosageStructure.UnspecifiedDay.Dosage, prn);
            ctx.append("på valgfri dag");
        }
    }

    getSingleTimeOfDay(dosageChoice: DosageChoice): string {
        if (dosageChoice.PartOfDayDosage
            && !dosageChoice.TimeOfDayDosage
            && !dosageChoice.TimesPerDayDosage
            && !dosageChoice.UnlimitedDayDosage) {

            const partOfDayKeys = Object.keys(dosageChoice.PartOfDayDosage);
            if (partOfDayKeys.length === 1) {
                return partOfDayKeys[0];
            }
        }
    }

    private renderDosageChoice(ctx: RenderingContext, dosageChoice: DosageChoice, prn: boolean, includeTime = true) {
        const dosesAndTimes: { dose: DoseType, time: string }[] = [];

        if (dosageChoice.PartOfDayDosage) {
            const partOfDayDosage = dosageChoice.PartOfDayDosage;

            if (dosageChoice.PartOfDayDosage.Morning) {
                dosesAndTimes.push({ dose: partOfDayDosage.Morning, time: includeTime && "morgen" });
            }
            if (dosageChoice.PartOfDayDosage.Noon) {
                dosesAndTimes.push({ dose: partOfDayDosage.Noon, time: includeTime && "middag" });
            }
            if (dosageChoice.PartOfDayDosage.Evening) {
                dosesAndTimes.push({ dose: partOfDayDosage.Evening, time: includeTime && "aften" });
            }
            if (dosageChoice.PartOfDayDosage.Night) {
                dosesAndTimes.push({ dose: partOfDayDosage.Night, time: includeTime && "nat" });
            }
        }

        if (dosageChoice.TimeOfDayDosage) {
            for (const timeOfDayDose of dosageChoice.TimeOfDayDosage) {
                dosesAndTimes.push({ dose: timeOfDayDose, time: "kl. " + LocalTimeHelper.toString(timeOfDayDose.Time) });
            }
        }

        if (dosageChoice.TimesPerDayDosage) {
            const timesPerDay = dosageChoice.TimesPerDayDosage.TimesPerDay;
            let time;
            if (prn) {
                time = (`højst ${timesPerDay} gange`);
            } else if (timesPerDay === 1) {
                time = undefined;
            } else {
                time = `${timesPerDay} gange`;
            }
            dosesAndTimes.push({ dose: dosageChoice.TimesPerDayDosage, time: time });
        }

        const allDosesAreEqual = this.allDosesAreEqual(dosesAndTimes.map(dt => dt.dose));
        if (allDosesAreEqual) {
            this.renderDose(ctx, dosesAndTimes[0].dose, prn);
            const listCtx = ctx.begin({ join: "comma-and" });
            for (const doseAndTime of dosesAndTimes) {
                if (doseAndTime.time) {
                    listCtx.begin().append(doseAndTime.time);
                }
            }
        } else {
            const listCtx = ctx.begin({ join: "comma-and" });
            for (let i = 0; i < dosesAndTimes.length; i++) {
                const itemCtx = listCtx.begin();
                this.renderDose(itemCtx, dosesAndTimes[i].dose, prn);
                if (dosesAndTimes[i].time) {
                    itemCtx.append(dosesAndTimes[i].time);
                }
            }
        }
    }

    private allDosesAreEqual(doses: DoseType[]) {
        const presentDoses = doses.filter(d => !!d);
        const allEqual =
            presentDoses.length <= 1 ||
            presentDoses.slice(1).every(dose => dose.AccordingToParameterSchema === doses[0].AccordingToParameterSchema
                && dose.Infusion === doses[0].Infusion
                && dose.MinimumQuantity === doses[0].MinimumQuantity
                && dose.MaximumQuantity === doses[0].MaximumQuantity
                && dose.Quantity === doses[0].Quantity
            );
        return allEqual;
    }

    private renderDose(ctx: RenderingContext, dose: DoseType, prn: boolean) {
        if (dose.Quantity) {
            ctx.append(`${dose.Quantity} ${this.getUnit(ctx, dose.Quantity === 1)}`);
        } else if (dose.MinimumQuantity != null || dose.MaximumQuantity != null) {
            ctx.append(`${dose.MinimumQuantity} - ${dose.MaximumQuantity} this.getUnit(ctx, false)`);
        } else if (dose.AccordingToParameterSchema) {
            ctx.append(`Antal ${this.getUnit(ctx, true)}/${this.getUnit(ctx, false)} i henhold til ${dose.AccordingToParameterSchema}`);
        }

        if (prn) {
            ctx.append("efter behov");
        }
    }

    private getUnit(ctx: RenderingContext, singular: boolean) {
        if (this.dosage.UnitTexts) {
            return singular ? this.dosage.UnitTexts.Singular : this.dosage.UnitTexts.Plural;
        } else {
            return this.dosage.UnitText;
        }
    }

    private renderRestriction(ctx: RenderingContext, restriction: DosageRestriction) {
        ctx = ctx.begin({ name: "restriction", join: "comma" });
        if (restriction.MaximumDailyDose) {
            ctx.append(`Max daglig dosis: ${restriction.MaximumDailyDose} ${this.getUnit(ctx, restriction.MaximumDailyDose === 1)}`);
        }

        if (restriction.MinimumDurationBetweenDoses) {
            ctx.append(`mindst ${restriction.MinimumDurationBetweenDoses} dage imellem doser`);
        }
    }

    private renderDuration(ctx: RenderingContext, period: DosagePeriodType) {
        if (period.PeriodLengthFreeText) {
            ctx.append(period.PeriodLengthFreeText);
        } else if (period.PeriodLength) {
            ctx.append(`i ${period.PeriodLength} ${period.PeriodLength === 1 ? "dag" : "dage"}`)
        }
    }
}