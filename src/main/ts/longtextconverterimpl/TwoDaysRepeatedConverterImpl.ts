import {LongTextConverterImpl} from "./LongTextConverterImpl";
import {DosageWrapper} from "../vowrapper/DosageWrapper";
import {StructureWrapper} from "../vowrapper/StructureWrapper";
import {UnitOrUnitsWrapper} from "../vowrapper/UnitOrUnitsWrapper";
import {TextHelper} from "../TextHelper";
import {DayWrapper} from "../vowrapper/DayWrapper";

export class TwoDaysRepeatedConverterImpl extends LongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures) {
            if (dosage.structures.structures.length !== 1)
                return false;
            let structure: StructureWrapper = dosage.structures.structures[0];
            if (structure.iterationInterval !== 2)
                return false;
            if (structure.startDateOrDateTime.isEqualTo(structure.endDateOrDateTime))
                return false;
            if (structure.days.length > 2)
                return false;

            if (structure.days.length === 1)
                if (structure.days[0].dayNumber !== 1 && structure.days[0].dayNumber !== 2)
                    return false;
            if (structure.days.length === 2)
                if (structure.days[0].dayNumber !== 1 || structure.days[1].dayNumber !== 2)
                    return false;

            return true;
        }

        return false;
    }

    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.structures[0]);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = this.getDosageStartText(structure.startDateOrDateTime);
        s += ", forløbet gentages hver 2. dag";
        if (structure.endDateOrDateTime) {
            s += this.getDosageEndText(structure.endDateOrDateTime);
        }
        s += this.getNoteText(structure);
        s += TextHelper.INDENT + "Doseringsforløb:\n";
        s += this.getDaysText(unitOrUnits, structure);

        return s.toString();
    }

    protected makeDaysLabel(dosageStructure: StructureWrapper, day: DayWrapper): string {
        return "Dag " + day.dayNumber + ": ";
    }

}
