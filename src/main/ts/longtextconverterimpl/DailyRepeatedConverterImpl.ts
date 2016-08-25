import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";

export class DailyRepeatedConverterImpl extends LongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 1)
            return false;
        if (structure.getStartDateOrDateTime().isEqualTo(structure.endDateOrDateTime))
            return false;
        if (structure.days.length !== 1)
            return false;
        if (structure.days[0].dayNumber !== 1)
            return false;
        return true;
    }


    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.structures[0]);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";
        s += this.getDosageStartText(structure.getStartDateOrDateTime());

        if (structure.endDateOrDateTime) {
            s += ", gentages hver dag";
            s += this.getDosageEndText(structure.endDateOrDateTime);
            s += ":\n";
        }
        else {
            s += " og gentages hver dag:\n";
        }

        s += TextHelper.INDENT + "Doseringsforløb:\n";
        this.appendDays(s, unitOrUnits, structure);
        return s.toString();
    }

}
