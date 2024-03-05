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

    public getConverterClassName(): string {
        return "SimpleNonRepeatedConverterImpl";
    }

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (!structure.getIterationInterval() && !structure.isIterationToLong())
            return false;
        if (structure.getDays().length !== 1)
            return false;
        let day: DayWrapper = structure.getDays()[0];
        if (day.getDayNumber() !== 0 && (!(structure.startsAndEndsSameDay() && day.getDayNumber() === 1)))
            return false;
        if (day.containsAccordingToNeedDose() || day.containsMorningNoonEveningNightDoses())
            return false;
        if (day.getNumberOfDoses() !== 1)
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";
        let day: DayWrapper = structure.getDays()[0];
        let dose: DoseWrapper = day.getAllDoses()[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(dose, dosage.structures.getUnitOrUnits());
        if (structure.getSupplText())
            text += TextHelper.addShortSupplText(structure.getSupplText());
        return text;
    }
}
