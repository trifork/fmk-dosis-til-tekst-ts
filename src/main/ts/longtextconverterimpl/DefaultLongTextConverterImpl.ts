import {DosageWrapper} from "../vowrapper/DosageWrapper";
import {LongTextConverterImpl} from "./LongTextConverterImpl";
import {UnitOrUnitsWrapper} from "../vowrapper/UnitOrUnitsWrapper";
import {StructureWrapper} from "../vowrapper/StructureWrapper";
import {TextHelper} from "../TextHelper";
import { LoggerService} from "../LoggerService";

export class DefaultLongTextConverterImpl extends LongTextConverterImpl {

    public canConvert(dosageStructure: DosageWrapper): boolean {
        // The default converter must handle all cases with a single periode, to ensure that we always create a long 
        // dosage text. This converter is added last in the LongTextConverters list of possible 
        // converters.
        return dosageStructure.structures.structures.length === 1;
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.structures[0]);
    }

    private convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";

        LoggerService.debug("structure.startDateOrDateTime: " + structure.startDateOrDateTime + " structure.endDateOrDateTime: " + structure.endDateOrDateTime);

        if (structure.startDateOrDateTime.isEqualTo(structure.endDateOrDateTime)) {
            // Same day dosage
            LoggerService.debug("IsEqual true");
            s += "Doseringen foretages kun " + this.datesToLongText(structure.startDateOrDateTime) + ":\n";
        }
        else if (structure.iterationInterval === 0) {

            LoggerService.debug("IsEqual false");

            // Not repeated dosage
            s += this.getDosageStartText(structure.startDateOrDateTime);
            // If there is just one day with according to need dosages we don't want say when to stop
            if (structure.days.length === 1 && structure.containsAccordingToNeedDosesOnly()) {
                s += ":\n";
            }
            else {
                if (structure.endDateOrDateTime) {
                    s += this.getDosageEndText(structure.endDateOrDateTime);
                }
                else {
                    s += " og ophører efter det angivne forløb";
                }
                s += this.getNoteText(structure);
            }
        }
        else if (structure.iterationInterval === 1) {
            // Daily dosage
            s += this.getDosageStartText(structure.startDateOrDateTime);
            if (structure.endDateOrDateTime) {
                s += ", gentages hver dag";
                s += this.getDosageEndText(structure.endDateOrDateTime);
                s += ":\n";
            }
            else {
                s += " og gentages hver dag:\n";
            }
        }
        else if (structure.iterationInterval > 1) {
            // Dosage repeated after more than one day
            s += this.getDosageStartText(structure.startDateOrDateTime);
            s = this.appendRepetition(s, structure);
            if (structure.endDateOrDateTime) {
                s += this.getDosageEndText(structure.endDateOrDateTime);
            }
            s += this.getNoteText(structure);
        }
        s += TextHelper.INDENT + "Doseringsforløb:\n";
        s += this.getDaysText(unitOrUnits, structure);
        return s;
    }

    private appendRepetition(s: string, structure: StructureWrapper): string {
        return s + ", forløbet gentages efter " + structure.iterationInterval + " dage";
    }

}
