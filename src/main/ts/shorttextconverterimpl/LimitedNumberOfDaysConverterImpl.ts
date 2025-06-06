import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { ShortTextConverterImpl } from "./ShortTextConverterImpl";

/**
 * Conversion of: Dosage limited to N days, the same every day
 * <p>
 * Example:<br>
 * 67: 3 tabletter 4 gange daglig i 3 dage<br>
 * 279: 2 tabletter 2 gange daglig i 6 dage
 */
export class LimitedNumberOfDaysConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "LimitedNumberOfDaysConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        const structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval && !StructureHelper.isIterationToLong(structure))
            return false;
        if (structure.days.length === 0)
            return false;
        if (!StructureHelper.daysAreInUninteruptedSequenceFromOne(structure))
            return false;
        if (StructureHelper.containsMorningNoonEveningNightDoses(structure))
            return false;
        if (!StructureHelper.allDaysAreTheSame(structure))
            return false;
        if (!StructureHelper.allDosesAreTheSame(structure))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        const structure: Structure = dosage.structures.structures[0];
        let text = "";
        const day: Day = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);
        if (day.allDoses[0].isAccordingToNeed) { text += " efter behov"; }
        if (structure.days.length === 1 && structure.days[0].dayNumber === 1)
            text += " " + day.allDoses.length + " " + TextHelper.gange(day.allDoses.length);
        else {
            text += " " + day.allDoses.length + " " + TextHelper.gange(day.allDoses.length) + " daglig";
            const days: number = structure.days[structure.days.length - 1].dayNumber;
            if (days === 7)
                text += " i 1 uge";
            else if (days % 7 === 0)
                text += " i " + (days / 7) + " uger";
            else
                text += " i " + days + " dage";
        }
        if (structure.supplText)
            text += TextHelper.addShortSupplText(structure.supplText);
        return text.toString();
    }
}
