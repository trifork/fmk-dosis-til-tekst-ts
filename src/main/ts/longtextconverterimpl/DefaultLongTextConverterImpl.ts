import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { LongTextConverter } from "../LongTextConverter";
import { TextOptions } from "../TextOptions";
import { DateOnly, Day, Dosage, PlainDose, Structure, Structures, UnitOrUnits } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DayHelper } from "../helpers/DayHelper";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";

export class DefaultLongTextConverterImpl extends LongTextConverterImpl {


    public getConverterClassName(): string {
        return "DefaultLongTextConverterImpl";
    }

    longTextConverter: LongTextConverter;

    public constructor(longTextConverter: LongTextConverter) {
        super();
        this.longTextConverter = longTextConverter;
    }

    public canConvert(dosageStructure: Dosage, options: TextOptions): boolean {
        // The default converter must handle all cases with a single periode, to ensure that we always create a long
        // dosage text. This converter is added last in the LongTextConverters list of possible
        // converters.
        return dosageStructure.structures.structures.length === 1;
    }

    public doConvert(dosage: Dosage, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.endDate, dosage.structures.structures[0], options, dosage.structures.isPartOfMultiPeriodDosage);
    }

    private fillInEmptyVKADosages(unitOrUnits: UnitOrUnits, structure: Structure) {

        let dayno: number = 1;

        const startDate = DateOrDateTimeHelper.getDate(structure.startDate);
        const endDate = DateOrDateTimeHelper.getDate(structure.endDate);

        for (let dosagedate1 = startDate; dosagedate1 <= endDate; dosagedate1.setDate(dosagedate1.getDate() + 1)) {

            const emptyDose: PlainDose = {
                type: "PlainDoseWrapper",
                doseQuantity: 0,
                isAccordingToNeed: false
            };

            if (!StructureHelper.getDay(structure, dayno)) {
                const emptyDay: Day = {
                    dayNumber: dayno,
                    allDoses: [emptyDose]
                };
                structure.days.push(emptyDay);
            }
            else if (StructureHelper.getDay(structure, dayno).allDoses.length === 0) {
                StructureHelper.getDay(structure, dayno).allDoses.push(emptyDose);
            }
            dayno++;
        }

        structure.days.sort((day1, day2) => day1.dayNumber - day2.dayNumber);
    }

    private convert(unitOrUnits: UnitOrUnits, treatmentEndDate: DateOnly, structure: Structure, options: TextOptions, isPartOfMultiPeriodDosage: boolean): string {


        if (DefaultLongTextConverterImpl.convertAsVKA(options) && structure.iterationInterval === 0) {

            // If more than 10 zero dosages are added, split in two periods: one with 0 dosages only, and one with none-zero only

            if (DefaultLongTextConverterImpl.shouldSplitInNonzeroAndZeroDosagePart(structure)) {
                const splittedDosage = DefaultLongTextConverterImpl.splitInNonzeroAndZeroDosagePart(structure, unitOrUnits);
                let s = this.longTextConverter.convert(splittedDosage, options);
                s += this.getNoDosageWarningIfNeeded(options, structure, treatmentEndDate, isPartOfMultiPeriodDosage);
                return s;
            }
            else {
                this.fillInEmptyVKADosages(unitOrUnits, structure);
            }
        }

        let s = "";

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s = "<div class=\"d2t-period\"><div class=\"d2t-periodtext\">";
        }

        if (DateOrDateTimeHelper.isEqualTo(structure.startDate, structure.endDate)) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(structure.startDate);
        }
        else if (structure.iterationInterval === 0 || StructureHelper.isIterationToLong(structure)) {

            const useSingleDayDosageStartText = structure.days.length === 1 && !DayHelper.isAnyDay(structure.days[0]) && !StructureHelper.isPNWithoutLimit(structure);

            // Not repeated dosage - and not an unlimited PN dosage neither
            if (useSingleDayDosageStartText) {
                s += this.getSingleDayDosageStartText(structure.startDate, structure.days[0].dayNumber);
            }
            else {
                s += this.getDosageStartText(structure.startDate, structure.iterationInterval, options);
            }

            // If there is just one day with according to need dosages (which is not AnyDay) we don't want say when to stop
            if (!useSingleDayDosageStartText) {
                if (structure.endDate) {
                    s += this.getDosageEndText(structure, options);
                }
            }
        }
        else if (structure.iterationInterval === 1) {
            // Daily dosage
            s += this.getDosageStartText(structure.startDate, structure.iterationInterval, options);
            if (structure.endDate) {
                s += this.getDosageEndText(structure, options);
            }
        }
        else if (structure.iterationInterval > 1) {
            // Dosage repeated after more than one day
            s += this.getDosageStartText(structure.startDate, structure.iterationInterval, options);

            if (structure.endDate) {
                s += this.getDosageEndText(structure, options);
            }
            if (options === TextOptions.VKA_WITH_MARKUP) {
                s += "<span class=\"d2t-iterationtext\">gentages hver " + structure.iterationInterval + ". dag</span>";
            } else {
                s += " - gentages hver " + structure.iterationInterval + ". dag";
            }
        }

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += ":</div>\n<dl class=\"d2t-adjustmentperiod\">\n";
        } else {
            s += ":\n";
        }



        s += this.getDaysText(unitOrUnits, structure, options);

        s = this.appendSupplText(structure, s, options);

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "\n</dl>";
        }

        s += this.getNoDosageWarningIfNeeded(options, structure, treatmentEndDate, isPartOfMultiPeriodDosage);

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "\n</div>";    // closes <div class="d2t-period">
        }

        return s;
    }

    private getNoDosageWarningIfNeeded(options: TextOptions, structure: Structure, treatmentEndDateTime: DateOnly, isPartOfMultiPeriodDosage: boolean): string {
        const treatmentEndDate = treatmentEndDateTime && DateOrDateTimeHelper.getDate(treatmentEndDateTime);
        const dosageEndDate = structure.endDate && DateOrDateTimeHelper.getDate(structure.endDate);

        if (options === TextOptions.VKA // On purpose NOT for VKA_WITH_MARKUP! Is presented otherwise in FMK-O
            && (structure.iterationInterval === 0 || StructureHelper.isIterationToLong(structure))
            && dosageEndDate
            && (!treatmentEndDate || dosageEndDate < treatmentEndDate)
            && !isPartOfMultiPeriodDosage) {
            return "\nBemærk: Dosering herefter er ikke angivet";
        }

        return "";
    }

    private static getFirstDaynoWithNoDaysAfter(structure: Structure): number {

        let dayno: number = 1;
        let firstDaynoWithNoDaysAfter = -1; // First dayno where no dosageday is defined, and neither no dosagedays comes after
        const startDate = DateOrDateTimeHelper.getDate(structure.startDate);
        const endDate = DateOrDateTimeHelper.getDate(structure.endDate);
        for (let dosagedate = startDate; dosagedate <= endDate; dosagedate.setDate(dosagedate.getDate() + 1)) {
            if (!StructureHelper.getDay(structure, dayno)) {
                if (firstDaynoWithNoDaysAfter === -1) {
                    firstDaynoWithNoDaysAfter = dayno;
                }
            } else {
                firstDaynoWithNoDaysAfter = -1;
            }
            dayno++;
        }

        return firstDaynoWithNoDaysAfter;
    }

    private static splitInNonzeroAndZeroDosagePart(structure: Structure, unitOrUnits: UnitOrUnits): Dosage {

        const firstDaynoWithNoDaysAfter = DefaultLongTextConverterImpl.getFirstDaynoWithNoDaysAfter(structure);

        const nonezeroDosageDays: Day[] = structure.days;
        const zeroDosageDays: Day[] = [];
        const nonzeroPeriod: Structure = {
            iterationInterval: structure.iterationInterval,
            supplText: structure.supplText,
            startDate: structure.startDate,
            endDate: DateOrDateTimeHelper.plusDays(structure.startDate, firstDaynoWithNoDaysAfter - 2),
            days: nonezeroDosageDays,
        };
        const zeroPeriod: Structure = {
            iterationInterval: structure.iterationInterval,
            supplText: structure.supplText,
            startDate: DateOrDateTimeHelper.plusDays(structure.startDate, firstDaynoWithNoDaysAfter - 1),
            endDate: structure.endDate,
            days: zeroDosageDays,
        };

        const splittedStructures: Structures = {
            startDate: structure.startDate,
            endDate: structure.endDate,
            unitOrUnits: unitOrUnits,
            structures: [nonzeroPeriod, zeroPeriod],
            isPartOfMultiPeriodDosage: false
        };

        return {
            structures: splittedStructures
        };
    }

    // In case the dosage ends with more than 10 empty dosagedays, then yes: it should be split
    private static shouldSplitInNonzeroAndZeroDosagePart(structure: Structure): boolean {

        if (!structure.startDate || !structure.endDate) {
            return false;
        }

        let dayno: number = 1;
        let firstDaynoWithNoDaysAfter = -1; // First dayno where no dosageday is defined, and neither no dosagedays comes after
        const startDate = DateOrDateTimeHelper.getDate(structure.startDate);
        const endDate = DateOrDateTimeHelper.getDate(structure.endDate);
        for (let dosagedate = startDate; dosagedate <= endDate; dosagedate.setDate(dosagedate.getDate() + 1)) {
            if (!StructureHelper.getDay(structure, dayno)) {
                if (firstDaynoWithNoDaysAfter === -1) {
                    firstDaynoWithNoDaysAfter = dayno;
                }
            } else {
                firstDaynoWithNoDaysAfter = -1;
            }
            dayno++;
        }

        return firstDaynoWithNoDaysAfter !== -1 && dayno - firstDaynoWithNoDaysAfter > 10;
    }
}
