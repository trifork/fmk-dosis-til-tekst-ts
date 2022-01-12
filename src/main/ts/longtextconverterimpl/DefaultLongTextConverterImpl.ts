import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { PlainDoseWrapper } from "../vowrapper/PlainDoseWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { StructuresWrapper } from "../vowrapper/StructuresWrapper";
import { LongTextConverter } from "../LongTextConverter";
import { TextOptions } from "../TextOptions";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";

export class DefaultLongTextConverterImpl extends LongTextConverterImpl {


    longTextConverter: LongTextConverter;

    public constructor(longTextConverter: LongTextConverter) {
        super();
        this.longTextConverter = longTextConverter;
    }

    public canConvert(dosageStructure: DosageWrapper, options: TextOptions): boolean {
        // The default converter must handle all cases with a single periode, to ensure that we always create a long
        // dosage text. This converter is added last in the LongTextConverters list of possible
        // converters.
        return dosageStructure.structures.getStructures().length === 1;
    }

    public doConvert(dosage: DosageWrapper, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getEndDateOrDateTime(), dosage.structures.getStructures()[0], options, dosage.structures.getIsPartOfMultiPeriodDosage());
    }

    private fillInEmptyVKADosages(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper) {

        let dayno: number = 1;

        for (let dosagedate: Date = new Date(structure.getStartDateOrDateTime().getDateOrDateTime().getTime()); dosagedate <= structure.getEndDateOrDateTime().getDateOrDateTime(); dosagedate.setDate(dosagedate.getDate() + 1)) {
            if (!structure.getDay(dayno)) {
                let emptyDose = new PlainDoseWrapper(0, undefined, undefined, unitOrUnits.getUnitPlural(), undefined, undefined, false);
                let emptyDay = new DayWrapper(dayno, [emptyDose]);
                structure.getDays().push(emptyDay);
            }
            dayno++;
        }

        structure.getDays().sort((day1, day2) => day1.getDayNumber() - day2.getDayNumber());
    }

    private convert(unitOrUnits: UnitOrUnitsWrapper, treatmentEndDateTime: DateOrDateTimeWrapper, structure: StructureWrapper, options: TextOptions, isPartOfMultiPeriodDosage: boolean): string {


        if (DefaultLongTextConverterImpl.convertAsVKA(options) && structure.getIterationInterval() === 0) {

            // If more than 10 zero dosages are added, split in two periods: one with 0 dosages only, and one with none-zero only

            if (DefaultLongTextConverterImpl.shouldSplitInNonzeroAndZeroDosagePart(structure)) {
                let splittedDosage = DefaultLongTextConverterImpl.splitInNonzeroAndZeroDosagePart(structure, unitOrUnits);
                let s = this.longTextConverter.convertWrapper(splittedDosage, options);
                s += this.getNoDosageWarningIfNeeded(options, structure, treatmentEndDateTime, isPartOfMultiPeriodDosage);
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

        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime())) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(structure.getStartDateOrDateTime());
        }
        else if (structure.getIterationInterval() === 0) {

            let useSingleDayDosageStartText = structure.getDays().length === 1 && !structure.getDays()[0].isAnyDay() && !structure.isPNWithoutLimit();

            // Not repeated dosage - and not an unlimited PN dosage neither
            if (useSingleDayDosageStartText) {
                s += this.getSingleDayDosageStartText(structure.getStartDateOrDateTime(), structure.getDays()[0].getDayNumber());
            }
            else {
                s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval(), options);
            }

            // If there is just one day with according to need dosages (which is not AnyDay) we don't want say when to stop
            if (!useSingleDayDosageStartText) {
                if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                    s += this.getDosageEndText(structure, options);
                }
            }
        }
        else if (structure.getIterationInterval() === 1) {
            // Daily dosage
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval(), options);
            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += this.getDosageEndText(structure, options);
            }
        }
        else if (structure.getIterationInterval() > 1) {
            // Dosage repeated after more than one day
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval(), options);

            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += this.getDosageEndText(structure, options);
            }
            if (options === TextOptions.VKA_WITH_MARKUP) {
                s += "<span class=\"d2t-iterationtext\">gentages hver " + structure.getIterationInterval() + ". dag</span>";
            } else {
                s += " - gentages hver " + structure.getIterationInterval() + ". dag";
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

        s += this.getNoDosageWarningIfNeeded(options, structure, treatmentEndDateTime, isPartOfMultiPeriodDosage);

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "\n</div>";    // closes <div class="d2t-period">
        }

        return s;
    }

    private getNoDosageWarningIfNeeded(options: TextOptions, structure: StructureWrapper, treatmentEndDateTime: DateOrDateTimeWrapper, isPartOfMultiPeriodDosage: boolean): string {
        if (options === TextOptions.VKA // On purpose NOT for VKA_WITH_MARKUP! Is presented otherwise in FMK-O
            && structure.getIterationInterval() === 0
            && structure.getEndDateOrDateTime()
            && ((treatmentEndDateTime && treatmentEndDateTime.getDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime() < treatmentEndDateTime.getDateOrDateTime())
                || ((!treatmentEndDateTime || !treatmentEndDateTime.getDateOrDateTime()) && structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()))
            && !isPartOfMultiPeriodDosage) {
            return "\nBemærk: Dosering herefter er ikke angivet";
        }

        return "";
    }

    private static getFirstDaynoWithNoDaysAfter(structure: StructureWrapper): number {

        let dayno: number = 1;
        let firstDaynoWithNoDaysAfter = -1; // First dayno where no dosageday is defined, and neither no dosagedays comes after
        for (let dosagedate: Date = new Date(structure.getStartDateOrDateTime().getDateOrDateTime().getTime()); dosagedate <= structure.getEndDateOrDateTime().getDateOrDateTime(); dosagedate.setDate(dosagedate.getDate() + 1)) {
            if (!structure.getDay(dayno)) {
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

    private static splitInNonzeroAndZeroDosagePart(structure: StructureWrapper, unitOrUnits: UnitOrUnitsWrapper): DosageWrapper {

        let firstDaynoWithNoDaysAfter = DefaultLongTextConverterImpl.getFirstDaynoWithNoDaysAfter(structure);

        let nonezeroDosageDays: DayWrapper[] = structure.getDays();
        let zeroDosageDays: DayWrapper[] = [];
        let nonzeroPeriod: StructureWrapper = new StructureWrapper(structure.getIterationInterval(), structure.getSupplText(), structure.getStartDateOrDateTime(), structure.getStartDateOrDateTime().plusDays(firstDaynoWithNoDaysAfter - 2), nonezeroDosageDays, undefined);
        let zeroPeriod: StructureWrapper = new StructureWrapper(structure.getIterationInterval(), structure.getSupplText(), structure.getStartDateOrDateTime().plusDays(firstDaynoWithNoDaysAfter - 1), structure.getEndDateOrDateTime(), zeroDosageDays, undefined);

        let splittedStructures: StructuresWrapper = new StructuresWrapper(
            unitOrUnits,
            structure.getStartDateOrDateTime(),
            structure.getEndDateOrDateTime(), [nonzeroPeriod, zeroPeriod], false);

        return new DosageWrapper(undefined, undefined, splittedStructures);
    }

    // In case the dosage ends with more than 10 empty dosagedays, then yes: it should be splitted
    private static shouldSplitInNonzeroAndZeroDosagePart(structure: StructureWrapper): boolean {

        if (!structure.getStartDateOrDateTime().getDateOrDateTime() || !structure.getEndDateOrDateTime().getDateOrDateTime()) {
            return false;
        }

        let dayno: number = 1;
        let firstDaynoWithNoDaysAfter = -1; // First dayno where no dosageday is defined, and neither no dosagedays comes after
        for (let dosagedate: Date = new Date(structure.getStartDateOrDateTime().getDateOrDateTime().getTime()); dosagedate <= structure.getEndDateOrDateTime().getDateOrDateTime(); dosagedate.setDate(dosagedate.getDate() + 1)) {
            if (!structure.getDay(dayno)) {
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
