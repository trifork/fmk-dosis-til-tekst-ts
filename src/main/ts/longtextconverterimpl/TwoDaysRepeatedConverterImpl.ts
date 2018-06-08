import {LongTextConverterImpl} from "./LongTextConverterImpl";
import {DosageWrapper} from "../vowrapper/DosageWrapper";
import {StructureWrapper} from "../vowrapper/StructureWrapper";
import {UnitOrUnitsWrapper} from "../vowrapper/UnitOrUnitsWrapper";
import {TextHelper} from "../TextHelper";
import {DayWrapper} from "../vowrapper/DayWrapper";

export class TwoDaysRepeatedConverterImpl extends LongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures) {
            if (dosage.structures.getStructures().length !== 1)
                return false;
            let structure: StructureWrapper = dosage.structures.getStructures()[0];
            if (structure.getIterationInterval() !== 2)
                return false;
            if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
                return false;
            if (structure.getDays().length > 2)
                return false;

            if (structure.getDays().length === 1)
                if (structure.getDays()[0].getDayNumber() !== 1 && structure.getDays()[0].getDayNumber() !== 2)
                    return false;
            if (structure.getDays().length === 2)
                if (structure.getDays()[0].getDayNumber() !== 1 || structure.getDays()[1].getDayNumber() !== 2)
                    return false;

            return true;
        }

        return false;
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0]);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = this.getDosageStartText(structure.getStartDateOrDateTime());
        s += ", forløbet gentages hver 2. dag";
        if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
            s += this.getDosageEndText(structure.getEndDateOrDateTime());
        }
        s += this.getNoteText(structure);
        s += TextHelper.INDENT + "Doseringsforløb:\n";
        s += this.getDaysText(unitOrUnits, structure);

        return s.toString();
    }

    protected makeDaysLabel(dosageStructure: StructureWrapper, day: DayWrapper): string {
        return "Dag " + day.getDayNumber() + ": ";
    }

}
