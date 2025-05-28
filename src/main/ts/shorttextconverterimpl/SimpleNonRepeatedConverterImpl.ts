import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Dose, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DayHelper } from "../helpers/DayHelper";

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

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval && !StructureHelper.isIterationToLong(structure))
            return false;
        if (structure.days.length !== 1)
            return false;
        let day: Day = structure.days[0];
        if (day.dayNumber !== 0 && (!(StructureHelper.startsAndEndsSameDay(structure) && day.dayNumber === 1)))
            return false;
        if (DayHelper.containsAccordingToNeedDose(day) || DayHelper.containsMorningNoonEveningNightDoses(day))
            return false;
        if (day.allDoses.length !== 1)
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        let structure: Structure = dosage.structures.structures[0];
        let text = "";
        let day: Day = structure.days[0];
        let dose: Dose = day.allDoses[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(dose, dosage.structures.unitOrUnits);
        if (structure.supplText)
            text += TextHelper.addShortSupplText(structure.supplText);
        return text;
    }
}
