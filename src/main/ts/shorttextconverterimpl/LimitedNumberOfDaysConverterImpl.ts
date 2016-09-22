import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { SimpleLimitedAccordingToNeedConverterImpl } from "./SimpleLimitedAccordingToNeedConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

/**
 * Conversion of: Dosage limited to N days, the same every day
 * <p>
 * Example:<br>
 * 67: 3 tabletter 4 gange daglig i 3 dage<br>
 * 279: 2 tabletter 2 gange daglig i 6 dage
 */
export class LimitedNumberOfDaysConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 0)
            return false;
        if (structure.days.length === 0)
            return false;
        if (!structure.daysAreInUninteruptedSequenceFromOne())
            return false;
        if (structure.containsMorningNoonEveningNightDoses())
            return false;
        if (!structure.allDaysAreTheSame())
            return false;
        if (!structure.allDosesAreTheSame())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";
        let day: DayWrapper = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);
        if (day.allDoses[0].isAccordingToNeed) { text += " efter behov"; }
        if (structure.days.length === 1 && structure.days[0].dayNumber === 1)
            text += " " + day.allDoses.length + " " + TextHelper.gange(day.allDoses.length);
        else {
            text += " " + day.allDoses.length + " " + TextHelper.gange(day.allDoses.length) + " daglig";
            let days: number = structure.days[structure.days.length - 1].dayNumber;
            if (days === 7)
                text += " i 1 uge";
            else if (days % 7 === 0)
                text += " i " + (days / 7) + " uger";
            else
                text += " i " + days + " dage";
        }
        if (structure.supplText)
            text += TextHelper.maybeAddSpace(structure.supplText) + structure.supplText;
        return text.toString();
    }
}
