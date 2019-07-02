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

        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 0)
            return false;
        if (structure.getDays().length === 0)
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
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";
        let day: DayWrapper = structure.getDays()[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.getAllDoses()[0], dosage.structures.getUnitOrUnits());
        if (day.getAllDoses()[0].getIsAccordingToNeed()) { text += " efter behov"; }
        if (structure.getDays().length === 1 && structure.getDays()[0].getDayNumber() === 1)
            text += " " + day.getAllDoses().length + " " + TextHelper.gange(day.getAllDoses().length);
        else {
            text += " " + day.getAllDoses().length + " " + TextHelper.gange(day.getAllDoses().length) + " daglig";
            let days: number = structure.getDays()[structure.getDays().length - 1].getDayNumber();

            if (days === 7)
                text += " i 1 uge";
            else if (days % 7 === 0)
                text += " i " + (days / 7) + " uger";
            else
                text += " i " + days + " dage";
        }

        text += TextHelper.NOT_REPEATED;

        if (structure.getSupplText()) {
            text += TextHelper.maybeAddSpace(structure.getSupplText()) + structure.getSupplText();
        }

        return text;
    }
}
