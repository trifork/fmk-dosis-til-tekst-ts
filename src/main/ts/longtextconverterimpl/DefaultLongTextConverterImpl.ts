import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { PlainDoseWrapper } from "../vowrapper/PlainDoseWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";

export class DefaultLongTextConverterImpl extends LongTextConverterImpl {

    public canConvert(dosageStructure: DosageWrapper): boolean {
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
            this.fillInEmptyVKADosages(unitOrUnits, structure);
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

        if (options === TextOptions.VKA // On purpose NOT for VKA_WITH_MARKUP! Is presented otherwise in FMK-O
            && structure.getIterationInterval() === 0
            && structure.getEndDateOrDateTime()
            && treatmentEndDateTime
            && structure.getEndDateOrDateTime().getDateOrDateTime() < treatmentEndDateTime.getDateOrDateTime()
            && !isPartOfMultiPeriodDosage
        ) {
            s += "\nBemærk: Dosering herefter er ikke angivet";
        }

        if (options === TextOptions.VKA_WITH_MARKUP) {
            s += "\n</div>";    // closes <div class="d2t-period">
        }

        return s;
    }
}
