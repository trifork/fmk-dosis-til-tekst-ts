import { formatDateOnly } from "../DateUtil";
import { LocalTimeHelper } from "../helpers/LocalTimeHelper";
import { defaultEnabledCompactionPatterns, EnabledCompactionPatterns } from "./CompactionPatterns";
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

    private compact: EnabledCompactionPatterns;

    public constructor(private dosage: DosageV2, private oneLine?: boolean) {
        this.compact = defaultEnabledCompactionPatterns; // TODO: Allow caller to pass disabled patterns
    }

    public render(ctx: RenderingContext) {
        return this.renderDosage(ctx, this.dosage);
    }

    private renderDosage(ctx: RenderingContext, dosage: DosageV2) {
        if (dosage.Precondition) {
            this.renderPrecondition(ctx, dosage.Precondition);
        }

        if (dosage.AdministrationAccordingToSchemaInLocalSystem) {
            const headerCtx = ctx.beginHeader();
            headerCtx.append(`fra ${dosage.AdministrationAccordingToSchemaInLocalSystem.StartDate}`);
            if (dosage.AdministrationAccordingToSchemaInLocalSystem.EndDate) {
                headerCtx.append(`til ${dosage.AdministrationAccordingToSchemaInLocalSystem.EndDate}`);
            }
            ctx.append("efter skema");
        } else if (dosage.FreeText) {
            const headerCtx = ctx.beginHeader();
            headerCtx.append(`fra ${dosage.FreeText.StartDate}`);
            if (dosage.FreeText.EndDate) {
                headerCtx.append(`til ${dosage.FreeText.EndDate}`);
            }
            ctx.append(dosage.FreeText.Text);
        } else if (dosage.DosagePeriod) {
            dosage.DosagePeriod.forEach((period, index) => {
                const headerCtx = ctx.beginHeader();
                const pCtx = ctx.beginParagraph();

                if (this.oneLine && index > 0) {
                    pCtx.append("herefter");
                }

                if (period.Empty) {
                    this.renderDosagePeriodHeader(headerCtx, period, index > 0);
                    this.renderEmptyPeriod(pCtx);
                } else if (period.Unspecified) {
                    this.renderDosagePeriodHeader(headerCtx, period, index > 0);
                    this.renderUnspecifiedPeriod(pCtx);
                } else {
                    if (this.compact.IterationLongerThanPeriod && period.PeriodLength) {
                        if (period.Fixed?.IterationInterval > period.PeriodLength) {
                            period.Fixed.IterationInterval = 0;
                        }
                        if (period.PRN?.IterationInterval > period.PeriodLength) {
                            period.PRN.IterationInterval = 0;
                        }
                    }

                    // NOTE: If Fixed and PRN have different IterationInterval, we need to split period into 2 with separate headers!
                    const varyingIntervals = period.Fixed?.IterationInterval !== period.PRN?.IterationInterval;

                    if (!varyingIntervals) {
                        this.renderDosagePeriodHeader(headerCtx, period, index === 0);
                        const onlyDay1 = this.compact.OnlyDay1
                            && this.isOnlyFirstDayDosage(period.Fixed, !!period.PeriodLengthFreeText, period.PeriodLength)
                            && this.isOnlyFirstDayDosage(period.PRN, !!period.PeriodLengthFreeText, period.PeriodLength);

                        if (!onlyDay1) {
                            this.renderIteration(headerCtx, period.Fixed || period.PRN)
                        }
                    }
                    if (period.Fixed) {
                        const onlyDay1 = this.compact.OnlyDay1 && this.isOnlyFirstDayDosage(period.Fixed, !!period.PeriodLengthFreeText, period.PeriodLength);
                        if (varyingIntervals) {
                            this.renderDosagePeriodHeader(headerCtx, period, index === 0);
                            if (!onlyDay1) {
                                // Not just day 1 -> put iteration in header
                                this.renderIteration(headerCtx, period.Fixed)
                            }
                        }
                        this.renderDosageStructure(pCtx, period.Fixed, onlyDay1, false);
                    }
                    if (period.PRN) {
                        const onlyDay1 = this.compact.OnlyDay1 && this.isOnlyFirstDayDosage(period.PRN, !!period.PeriodLengthFreeText, period.PeriodLength);
                        if (varyingIntervals) {
                            this.renderDosagePeriodHeader(headerCtx, period, index === 0);
                            if (!onlyDay1) {
                                // Not just day 1 -> put iteration in header
                                this.renderIteration(headerCtx, period.PRN)
                            }
                        }
                        this.renderDosageStructure(pCtx, period.PRN, onlyDay1, true);
                    }
                }
                if (this.oneLine && index < dosage.DosagePeriod.length - 1) {
                    this.renderDuration(pCtx, period);
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
        if (!this.oneLine) {
            ctx.append("dosering");
            if (period.PeriodLength || period.PeriodLengthFreeText) {
                this.renderDuration(ctx, period);
            } else if (!firstPeriod) {
                ctx.append("herefter");
            }
        }
    }

    renderIteration(ctx: RenderingContext, dosageStructure: DosageStructure) {
        const interval = dosageStructure.IterationInterval;
        if (interval) {
            if (dosageStructure.Week) {
                if (interval === 1) {
                    ctx.append(`- gentages hver uge`);
                } else {
                    ctx.append(`- gentages hver ${interval}. uge`);
                }
            } else {
                if (dosageStructure.IterationInterval === 1) {
                    // ctx.append("- dagligt");
                } else {
                    ctx.append(`- gentages hver ${interval}. dag`);
                }
            }
        } else {
            // ctx.append("1 gang");
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
                value = `${row.Quantity} ${this.getUnit(ctx, row.Quantity === 1)}`;
            } else if (row.MinimumQuantity != null || row.MaximumQuantity != null) {
                value = `${row.MinimumQuantity} - ${row.MaximumQuantity} ${this.getUnit(ctx, row.Quantity === 1)}`;
            } else {
                value = row.Instruction;
            }
            tableRow.append(value);
        }
    }

    private renderEmptyPeriod(ctx: RenderingContext) {
        ctx.append("Ingen dosering");
    }

    private renderUnspecifiedPeriod(ctx: RenderingContext) {
        ctx.append("Dosering ikke angivet");
    }

    private renderDosageStructure(ctx: RenderingContext, dosageStructure: DosageStructure, onlyDay1: boolean, prn: boolean) {

        // if (!this.tryRenderSinglePartOfDayDosage(ctx, dosageStructure, prn)) {
        this.renderDays(ctx, dosageStructure, onlyDay1, prn);
        // }

        if (dosageStructure.Instruction) {
            ctx.beginParagraph({ name: "instruction" })
                .append("Instruks:")
                .append(dosageStructure.Instruction);
        }

        if (dosageStructure.Restriction) {
            this.renderRestriction(ctx, dosageStructure.Restriction);
        }
    }

    private renderDays(ctx: RenderingContext, dosageStructure: DosageStructure, onlyDay1: boolean, prn: boolean) {

        if (dosageStructure.Day) {

            let singlePartOfDay: string = undefined;

            if (onlyDay1) {
                singlePartOfDay = this.isSinglePartOfDay(dosageStructure.Day[0].Dosage);
                this.renderDosageChoice(ctx, dosageStructure.Day[0].Dosage, prn, !singlePartOfDay);
            } else {
                const defListCtx = ctx.beginDefinitionList();
                for (const day of dosageStructure.Day) {
                    const defDataCtx = defListCtx.beginDefinition({ term: `dag ${day.Index}` });

                    this.renderDosageChoice(defDataCtx, day.Dosage, prn);
                }
            }

            if (dosageStructure.IterationInterval && onlyDay1) {
                if (dosageStructure.IterationInterval === 1) {
                    if (singlePartOfDay) {
                        ctx.append("hver");
                        ctx.append(DosageRenderingTreeBuilder.TIME_OF_DAY_NAMES[singlePartOfDay]);
                    } else {
                        ctx.append(prn ? "dagligt" : "- hver dag");
                    }
                } else {
                    if (singlePartOfDay) {
                        ctx.append(DosageRenderingTreeBuilder.TIME_OF_DAY_NAMES[singlePartOfDay]);
                    }
                    ctx.append(`hver ${dosageStructure.IterationInterval}. dag`);
                }
            } else {
                if (singlePartOfDay) {
                    ctx.append(DosageRenderingTreeBuilder.TIME_OF_DAY_NAMES[singlePartOfDay]);
                }
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

    isOnlyFirstDayDosage(dosageStructure: DosageStructure, hasFreeTextPeriodLength: boolean, periodLength?: number) {
        if (!dosageStructure) {
            return true;
        }

        if (dosageStructure.Day) {
            if (dosageStructure.IterationInterval === 1) {
                return true;
            }

            if (dosageStructure.IterationInterval) {
                if (!dosageStructure.Day.find(day => day.Index !== 1)) {
                    // Any non-zero iteration interval, but only dosage on day 1
                    return true;
                }
            } else {
                // Non-iterated
                return periodLength === 1;
            }
        }
    }

    isSinglePartOfDay(dosageChoice: DosageChoice): string {
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
            if (timesPerDay === 1) {
                time = undefined;
            } else if (prn) {
                time = (`højst ${timesPerDay} gange`);
            } else {
                time = `${timesPerDay} gange`;
            }
            dosesAndTimes.push({ dose: dosageChoice.TimesPerDayDosage, time: time });
        }

        if (dosageChoice.UnlimitedDayDosage) {
            dosesAndTimes.push({ dose: dosageChoice.UnlimitedDayDosage, time: "ubegrænset antal gange" });
        }

        if (this.compact.AllDosesEqualWithinDay && this.allDosesAreEqual(dosesAndTimes.map(dt => dt.dose))) {
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

        if (dose.Quantity != null) {
            ctx.append(`${dose.Quantity} ${this.getUnit(ctx, dose.Quantity === 1)}`);

        } else if (dose.MinimumQuantity != null || dose.MaximumQuantity != null) {
            ctx.append(`${dose.MinimumQuantity} - ${dose.MaximumQuantity} ${this.getUnit(ctx, false)}`);

        } else if (dose.AccordingToParameterSchema) {
            ctx.append(`antal ${this.getUnit(ctx, true)}/${this.getUnit(ctx, false)} i henhold til ${dose.AccordingToParameterSchema}`);

        } else if (dose.Infusion) {
            const infCtx = ctx.begin({ join: "comma" });
            const infusion = dose.Infusion;
            if (infusion.Duration != null) {
                infCtx.append(`varighed ${infusion.Duration} min`);
            } else if (infusion.MinimumDuration != null || infusion.MaximumDuration != null) {
                infCtx.append(`varighed ${infusion.MinimumDuration} - ${infusion.MaximumDuration} min`);
            }
            if (infusion.InfusionRate != null) {
                infCtx.append(`indløbsrate ${infusion.InfusionRate} ${this.getUnit(ctx, false)}/t`);
            } else if (infusion.MinimumInfusionRate != null || infusion.MaximumInfusionRate != null) {
                infCtx.append(`indløbsrate ${infusion.MinimumInfusionRate} - ${infusion.MaximumInfusionRate} ${this.getUnit(ctx, false)}/t`);
            }
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
            ctx.append(`max daglig dosis: ${restriction.MaximumDailyDose} ${this.getUnit(ctx, restriction.MaximumDailyDose === 1)}`);
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