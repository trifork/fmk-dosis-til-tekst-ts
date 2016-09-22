import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

/**
 * Conversion of: Simple non repeated dosage (like "according to need") with suppl. 
 * dosage free text. All dosages the same.
 * <p>
 * Example:<br> 
 * 204: 1 plaster 5 timer før virkning ønskes, 
 */
export class SimpleNonRepeatedConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length != 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 0)
            return false;
        if (structure.days.length !== 1)
            return false;
        let day: DayWrapper = structure.days[0];
        if (day.dayNumber !== 0 && (!(structure.startsAndEndsSameDay() && day.dayNumber === 1)))
            return false;
        if (day.containsAccordingToNeedDose() || day.containsMorningNoonEveningNightDoses())
            return false;
        if (day.getNumberOfDoses() !== 1)
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";
        let day: DayWrapper = structure.days[0];
        let dose: DoseWrapper = day.allDoses[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(dose, dosage.structures.unitOrUnits);
        if (structure.supplText)
            text += " " + structure.supplText;
        return text;
    }
}