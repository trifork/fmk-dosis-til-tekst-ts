import { formatDateDDMMYYYY, formatDateOnly } from "../DateUtil";
import { DurationUtil } from "../DurationUtil";
import { LocalTimeHelper } from "../helpers/LocalTimeHelper";
import { TextHelper } from "../TextHelper";
import { defaultEnabledCompactionPatterns, EnabledCompactionPatterns } from "./CompactionPatterns";
import { DosageV2, DosageChoice, DosageParameter, DosagePeriodType, DosageStructure, DoseType, PartOfDayDosage, Precondition, WeekdayLabel, UnlimitedDosageType } from "./Dosage";
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
        const dosage = this.moveDeprecatedStuff(this.dosage);

        return this.renderDosage(ctx, dosage);
    }

    private moveDeprecatedStuff(dosage: DosageV2) {
        // Move Dosage.DosagePeriod.(Fixed,PRN).Resctriction.MinimumDurationBetweenDoses -> Dosage.DosagePeriod.(Fixed,PRN).MinimumDurationBetweenDoses
        // Move Dosage.DosagePeriod.(Fixed,PRN).Resctriction.MaximumDailyDose -> *.UnlimitedDayDosage
        for (const period of (dosage.DosagePeriod || [])) {
            for (const ds of [period.Fixed, period.PRN].filter(Boolean)) {

                if (ds.Restriction?.MaximumDailyDose) {
                    const unlimitedDayDosages = findProperties(ds, "UnlimitedDayDosage") as UnlimitedDosageType[];
                    for (const unlimitedDayDosage of unlimitedDayDosages) {
                        if (!unlimitedDayDosage.MaximumDailyDose) {
                            unlimitedDayDosage.MaximumDailyDose = ds.Restriction.MaximumDailyDose;
                        }
                    }
                }

                if (ds.Restriction?.MinimumDurationBetweenDoses && !ds.MinimumDurationBetweenDoses) {
                    ds.MinimumDurationBetweenDoses = ds.Restriction?.MinimumDurationBetweenDoses;
                }
            }
        }
        return dosage;
    }

    private renderDosage(ctx: RenderingContext, dosage: DosageV2) {
        if (dosage.Precondition) {
            this.renderPrecondition(ctx, dosage.Precondition);
        }

        const validFrom = dosage.Precondition?.ValidFrom ? new Date(dosage.Precondition.ValidFrom) : undefined;

        if (dosage.AdministrationAccordingToSchemaInLocalSystem) {
            if (!this.oneLine) {
                const headerCtx = ctx.beginHeader();
                headerCtx.append(`dosering fra ${formatDateDDMMYYYY(dosage.AdministrationAccordingToSchemaInLocalSystem.StartDate)}`);
                if (dosage.AdministrationAccordingToSchemaInLocalSystem.EndDate) {
                    headerCtx.append(`til ${dosage.AdministrationAccordingToSchemaInLocalSystem.EndDate}`);
                }
            }
            ctx.append("efter skema");
        } else if (dosage.FreeText) {
            if (!this.oneLine) {
                const headerCtx = ctx.beginHeader();
                headerCtx.append(`dosering fra ${formatDateDDMMYYYY(dosage.FreeText.StartDate)}`);
                if (dosage.FreeText.EndDate) {
                    headerCtx.append(`til ${dosage.FreeText.EndDate}`);
                }
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
                    this.renderDosagePeriodHeader(headerCtx, period, index > 0, validFrom);
                    this.renderEmptyPeriod(pCtx);
                } else if (period.Unspecified) {
                    this.renderDosagePeriodHeader(headerCtx, period, index > 0, validFrom);
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
                    // Also NOTE: If oneLine, we don't include iteration in the header (we append it to the end of the DosageStructure text)
                    const separateHeadersForFixedAndPRN = !this.oneLine && period.Fixed?.IterationInterval !== period.PRN?.IterationInterval;

                    if (!separateHeadersForFixedAndPRN) {
                        this.renderDosagePeriodHeader(headerCtx, period, index === 0, validFrom);
                        const onlyDay1 = this.compact.OnlyDay1
                            && this.isOnlyFirstDayDosage(period.Fixed, !!period.PeriodLengthFreeText, period.PeriodLength)
                            && this.isOnlyFirstDayDosage(period.PRN, !!period.PeriodLengthFreeText, period.PeriodLength);

                        if (!onlyDay1 && !this.oneLine) {
                            this.renderIteration(headerCtx, period.Fixed || period.PRN)
                        }
                    }

                    for (const [dosageStructure, isPRN] of [
                        [period.Fixed, false],
                        [period.PRN, true],
                    ] as const) {
                        if (!dosageStructure) {
                            continue;
                        }

                        const onlyDay1 = this.compact.OnlyDay1 && this.isOnlyFirstDayDosage(dosageStructure, !!period.PeriodLengthFreeText, period.PeriodLength);

                        if (separateHeadersForFixedAndPRN) {
                            this.renderDosagePeriodHeader(headerCtx, period, index === 0, validFrom);
                            if (!onlyDay1) {
                                // Not just day 1 -> put iteration in header
                                this.renderIteration(headerCtx, dosageStructure);
                            }
                        }

                        this.renderDosageStructure(pCtx, dosageStructure, onlyDay1, isPRN);
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

    renderDosagePeriodHeader(ctx: RenderingContext, period: DosagePeriodType, firstPeriod: boolean, validFrom: Date) {
        if (!this.oneLine) {
            ctx.append("dosering");
            if (firstPeriod && validFrom) {
                ctx.append(`fra ${formatDateDDMMYYYY(validFrom)}`);
            }
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
                const weekInterval = interval / 7;
                if (weekInterval === 1) {
                    ctx.append(`- gentages hver uge`);
                } else {
                    ctx.append(`- gentages hver ${weekInterval}. uge`);
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
        if (precondition.PRNTrigger || precondition.EpisodicTreatment) {
            ctx = ctx.begin({ name: "precondition" });

            if (precondition.PRNTrigger) {
                ctx.append(`Betingelse for påbegyndt behandling ${precondition.PRNTrigger}`);
            }

            if (precondition.EpisodicTreatment) {
                ctx.append(`PN-kur med startbetingelse ${precondition.EpisodicTreatment.Trigger}`);
            }
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
        ctx.append("ingen dosering");
    }

    private renderUnspecifiedPeriod(ctx: RenderingContext) {
        ctx.append("dosering ikke angivet");
    }

    private renderDosageStructure(ctx: RenderingContext, dosageStructure: DosageStructure, onlyDay1: boolean, prn: boolean) {

        if (dosageStructure.Day?.length > 0) {
            this.renderDays(onlyDay1, dosageStructure, ctx, prn);

        } else if (dosageStructure.Week) {
            this.renderWeeks(dosageStructure, ctx, prn);

        } else if (dosageStructure.UnspecifiedDay) {
            this.renderDosageChoice(ctx, dosageStructure.UnspecifiedDay.Dosage, prn);
            ctx.append("på valgfri dag");
        }


        if (dosageStructure.Instruction) {
            ctx.beginParagraph({ name: "instruction" })
                .append("Instruks:")
                .append(dosageStructure.Instruction);
        }

        if (dosageStructure.MinimumDurationBetweenDoses) {
            ctx.append(`mindst ${DurationUtil.formatMinutes(dosageStructure.MinimumDurationBetweenDoses)} imellem doser`);
        }
    }

    private renderDays(onlyDay1: boolean, dosageStructure: DosageStructure, ctx: RenderingContext, prn: boolean) {
        const singlePartOfDay: string = this.getUniquePartOfDay(dosageStructure.Day.map(day => day.Dosage));
        const partOfDayAtEnd = this.oneLine && singlePartOfDay && onlyDay1;

        // Maybe: Optimize if all all (non-empty) days have the same dosages -> 1 tablet morgen og 2 tabletter aften dag 1, 2 og 3 ???

        if (onlyDay1) {
            this.renderDosageChoice(ctx, dosageStructure.Day[0].Dosage, prn, !partOfDayAtEnd);
        } else {
            const defListCtx = ctx.beginDefinitionList();
            for (const day of dosageStructure.Day) {
                const defDataCtx = defListCtx.beginDefinition({ term: `dag ${day.Index}` });

                this.renderDosageChoice(defDataCtx, day.Dosage, prn, !partOfDayAtEnd);
            }
        }

        if (dosageStructure.IterationInterval) {
            if (dosageStructure.IterationInterval === 1) {
                if (partOfDayAtEnd) {
                    ctx.append(DosageRenderingTreeBuilder.TIME_OF_DAY_NAMES[singlePartOfDay]); // morgen
                } else if (prn) {
                    ctx.append("dagligt"); // dagligt
                }
            } else {
                if (partOfDayAtEnd) {
                    ctx.append(DosageRenderingTreeBuilder.TIME_OF_DAY_NAMES[singlePartOfDay]); // morgen
                }
                ctx.append(`hver ${dosageStructure.IterationInterval}. dag`); // hver 2. dag
            }
        } else {
            if (partOfDayAtEnd) {
                ctx.append(DosageRenderingTreeBuilder.TIME_OF_DAY_NAMES[singlePartOfDay]);
            }
        }
    }

    private renderWeeks(dosageStructure: DosageStructure, ctx: RenderingContext, prn: boolean) {
        const weekdayLabels = new Set(
            dosageStructure.Week.flatMap(week => week.Weekday.map(weekday => weekday.Label)
            )
        );
        const singleWeekday = weekdayLabels.size === 1
            ? DosageRenderingTreeBuilder.WEEKDAY_NAMES[weekdayLabels.values().next().value]
            : undefined;

        const weekdayAtEnd = this.oneLine && dosageStructure.IterationInterval && singleWeekday;

        if (weekdayAtEnd) {
            // Weekday will be mentioned at end, so we need a list, not a definition list
            const listCtx = ctx.begin({ join: "comma-and" });
            for (const week of dosageStructure.Week) {
                for (const weekDay of week.Weekday) {
                    const weekDayCtx = listCtx.begin();
                    this.renderDosageChoice(weekDayCtx, weekDay.Dosage, prn);
                }
            }
        } else {
            const defListCtx = ctx.beginDefinitionList();
            for (const week of dosageStructure.Week) {
                for (const weekDay of week.Weekday) {
                    const defDataCtx = defListCtx.beginDefinition({ term: `${DosageRenderingTreeBuilder.WEEKDAY_NAMES[weekDay.Label]}` });
                    this.renderDosageChoice(defDataCtx, weekDay.Dosage, prn);
                }
            }
        }

        if (this.oneLine) {
            // Render iteration here if oneLine
            const weekIteration = dosageStructure.IterationInterval / 7;
            if (weekdayAtEnd) {
                if (weekIteration === 1) {
                    ctx.append(`hver ${singleWeekday}`);
                } else {
                    ctx.append(`hver ${weekIteration}. ${singleWeekday}`);
                }
            } else {
                if (weekIteration === 1) {
                    ctx.append("hver uge");
                } else if (weekIteration > 1) {
                    ctx.append(`hver ${weekIteration}. uge`);
                }
            }
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

    getUniquePartOfDay(dosageChoices: DosageChoice[]): string {
        const result = dosageChoices.map(dosageChoice => this.isSinglePartOfDay(dosageChoice))
        return new Set(result).size === 1 ? result[0] : undefined;
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
            const unlimited = dosageChoice.UnlimitedDayDosage;
            dosesAndTimes.push({ dose: unlimited, time: unlimited.MaximumDailyDose ? `max ${unlimited.MaximumDailyDose} gange om dagen` : "ubegrænset antal gange" });
        }

        if (dosesAndTimes.length && this.compact.AllDosesEqualWithinDay && this.allDosesAreEqual(dosesAndTimes.map(dt => dt.dose))) {
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

    private renderDuration(ctx: RenderingContext, period: DosagePeriodType) {
        if (period.PeriodLengthFreeText) {
            ctx.append(period.PeriodLengthFreeText);
        } else if (period.PeriodLength) {
            ctx.append(`i ${period.PeriodLength} ${period.PeriodLength === 1 ? "dag" : "dage"}`)
        }
    }
}

function findProperties(
    obj: unknown,
    propertyName: string
): unknown[] {
    const results: unknown[] = [];

    function walk(value: unknown) {
        if (value === null || typeof value !== "object") return;

        for (const [key, child] of Object.entries(value)) {
            if (key === propertyName) {
                results.push(child);
            }

            walk(child);
        }
    }

    walk(obj);
    return results;
}