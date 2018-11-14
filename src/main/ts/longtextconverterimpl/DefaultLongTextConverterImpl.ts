import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
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
            s += "Doseringen foretages kun " + this.datesToLongText(structure.getStartDateOrDateTime()) + ":\n";
        }
        else if (structure.getIterationInterval() === 0) {
            // Not repeated dosage
            s += this.getDosageStartText(structure.getStartDateOrDateTime());
            // If there is just one day with according to need dosages we don't want say when to stop
            if (structure.getDays().length === 1 && structure.containsAccordingToNeedDosesOnly()) {
                s += ":\n";
            }
            else {
                if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                    s += this.getDosageEndText(structure.getEndDateOrDateTime());
                }
                else {
                    s += " og ophører efter det angivne forløb";
                }
                s += this.getNoteText(structure);
            }
        }
        else if (structure.getIterationInterval() === 1) {
            // Daily dosage
            s += this.getDosageStartText(structure.getStartDateOrDateTime());
            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += ", gentages hver dag";
                s += this.getDosageEndText(structure.getEndDateOrDateTime());
                s += ":\n";
            }
            else {
                s += " og gentages hver dag:\n";
            }
        }
        else if (structure.getIterationInterval() > 1) {
            // Dosage repeated after more than one day
            s += this.getDosageStartText(structure.getStartDateOrDateTime());
            s = this.appendRepetition(s, structure);
            if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
                s += this.getDosageEndText(structure.getEndDateOrDateTime());
            }
            s += this.getNoteText(structure);
        }
        s += TextHelper.INDENT + "Doseringsforløb:\n";
        s += this.getDaysText(unitOrUnits, structure);

        s = this.appendSupplText(structure, s);

        return s;
    }

    private appendRepetition(s: string, structure: StructureWrapper): string {
        return s + ", forløbet gentages efter " + structure.getIterationInterval() + " dage";
    }

}
