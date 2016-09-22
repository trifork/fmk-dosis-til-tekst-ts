import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";
import { MorningNoonEveningNightConverterImpl } from "./MorningNoonEveningNightConverterImpl";

export class MultipleDaysNonRepeatedConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 0)
            return false;
        if (structure.days.length <= 1)
            return false;
        if (!structure.allDaysAreTheSame())
            return false;
        if (!structure.allDosesAreTheSame())
            return false;
        if (structure.containsAccordingToNeedDose())
            return false;
        if (structure.containsTimedDose())
            return false;
        if (structure.containsMorningNoonEveningNightDoses() && structure.containsPlainDose())
            return false;
        return true;
    }
    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";

        let day: DayWrapper = structure.days[0];
        let firstDay: DayWrapper = structure.days[0];
        if (structure.containsMorningNoonEveningNightDoses()) {

            text += MorningNoonEveningNightConverterImpl.getMorningText(firstDay, dosage.structures.unitOrUnits);
            MorningNoonEveningNightConverterImpl.getNoonText(firstDay, dosage.structures.unitOrUnits);
            MorningNoonEveningNightConverterImpl.getEveningText(firstDay, dosage.structures.unitOrUnits);
            MorningNoonEveningNightConverterImpl.getNightText(firstDay, dosage.structures.unitOrUnits);
        }
        else {
            text += ShortTextConverterImpl.toDoseAndUnitValue(firstDay.getDose(0), dosage.structures.unitOrUnits);
            text += " " + firstDay.allDoses.length + " " + TextHelper.gange(firstDay.allDoses.length) + " daglig";
        }

        for (let i: number = 0; i < structure.days.length; i++) {

            let day: DayWrapper = structure.days[i];
            if (i === 0)
                text += " dag " + day.dayNumber;
            else if (i == structure.days.length - 1)
                text += " og " + day.dayNumber;
            else text += ", " + day.dayNumber;
        }

        if (structure.supplText)
            text += TextHelper.maybeAddSpace(structure.supplText) + structure.supplText;

        return text.toString();
    }
}
