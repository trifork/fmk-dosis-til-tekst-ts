import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class DefaultLongTextConverterImpl extends LongTextConverterImpl {

    public canConvert(dosageStructure: DosageWrapper): boolean {
        // The default converter must handle all cases with a single periode, to ensure that we always create a long
        // dosage text. This converter is added last in the LongTextConverters list of possible
        // converters.
        return dosageStructure.structures.getStructures().length === 1;
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0]);
    }

    private convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
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
                    s += this.getDosageEndText(structure.getEndDateOrDateTime());
                }
            }
        }
        else if (structure.getIterationInterval() === 1) {
            // Daily dosage
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());
            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += this.getDosageEndText(structure.getEndDateOrDateTime());
            }
        }
        else if (structure.getIterationInterval() > 1) {
            // Dosage repeated after more than one day
            s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());

            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += this.getDosageEndText(structure.getEndDateOrDateTime());
            }
        }
        s += ":\n";
        s += this.getDaysText(unitOrUnits, structure);

        s = this.appendSupplText(structure, s);

        return s;
    }

    protected getDosageStartText(startDateOrDateTime: DateOrDateTimeWrapper, iterationInterval: number) {

        if (iterationInterval > 1) {
            return "Dosering som gentages hver " + iterationInterval + ". dag fra d. " + this.datesToLongText(startDateOrDateTime);
        }
        else {
            return "Dosering fra d. " + this.datesToLongText(startDateOrDateTime);
        }

    }

}
