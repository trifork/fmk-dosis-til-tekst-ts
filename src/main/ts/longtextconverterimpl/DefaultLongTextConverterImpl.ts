import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { PlainDoseWrapper } from "../vowrapper/PlainDoseWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";

export class DefaultLongTextConverterImpl extends LongTextConverterImpl {

    public canConvert(dosageStructure: DosageWrapper): boolean {
        // The default converter must handle all cases with a single periode, to ensure that we always create a long
        // dosage text. This converter is added last in the LongTextConverters list of possible
        // converters.
        return dosageStructure.structures.getStructures().length === 1;
    }

    public doConvert(dosage: DosageWrapper, options: TextOptions): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0], options);
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

    private convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper, options: TextOptions): string {

        if (options === TextOptions.VKA && structure.getIterationInterval() === 0) {
            this.fillInEmptyVKADosages(unitOrUnits, structure);
        }

        let s = "";

        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime())) {
            // Same day dosage
            s += "Dosering kun d. " + this.datesToLongText(structure.getStartDateOrDateTime());
        }
        else if (structure.getIterationInterval() === 0) {
            // Not repeated dosage
            if (structure.getDays().length === 1) {
                s += this.getSingleDayDosageStartText(structure.getStartDateOrDateTime(), structure.getDays()[0].getDayNumber());
            }
            else {
                s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());
            }

            // If there is just one day with according to need dosages we don't want say when to stop
            if (structure.getDays().length !== 1) {
                if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                    s += this.getDosageEndText(structure);
                }
            }
        }
        else if (structure.getIterationInterval() === 1) {
            // Daily dosage
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());
            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += this.getDosageEndText(structure);
            }
        }
        else if (structure.getIterationInterval() > 1) {
            // Dosage repeated after more than one day
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());

            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += this.getDosageEndText(structure);
            }
            s += " - gentages hver " + structure.getIterationInterval() + ". dag";
        }
        s += ":\n";
        s += this.getDaysText(unitOrUnits, structure, options);

        s = this.appendSupplText(structure, s);

        return s;
    }
}
