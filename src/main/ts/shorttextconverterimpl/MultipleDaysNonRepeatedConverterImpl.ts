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
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 0)
            return false;
        if (structure.getDays().length <= 1)
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
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";

        let firstDay: DayWrapper = structure.getDays()[0];
        if (structure.containsMorningNoonEveningNightDoses()) {
            text += MorningNoonEveningNightConverterImpl.getMorningText(firstDay, dosage.structures.getUnitOrUnits());
            text += MorningNoonEveningNightConverterImpl.getNoonText(firstDay, dosage.structures.getUnitOrUnits());
            text += MorningNoonEveningNightConverterImpl.getEveningText(firstDay, dosage.structures.getUnitOrUnits());
            text += MorningNoonEveningNightConverterImpl.getNightText(firstDay, dosage.structures.getUnitOrUnits());
        }
        else {
            text += ShortTextConverterImpl.toDoseAndUnitValue(firstDay.getDose(0), dosage.structures.getUnitOrUnits());
            text += " " + firstDay.getAllDoses().length + " " + TextHelper.gange(firstDay.getAllDoses().length) + " daglig";
        }

        for (let i: number = 0; i < structure.getDays().length; i++) {

            let day: DayWrapper = structure.getDays()[i];
            if (i === 0)
                text += " dag " + day.getDayNumber();
            else if (i === structure.getDays().length - 1)
                text += " og " + day.getDayNumber();
            else text += ", " + day.getDayNumber();
        }

        text += TextHelper.NOT_REPEATED;

        if (structure.getSupplText())
            text += TextHelper.maybeAddSpace(structure.getSupplText()) + structure.getSupplText();

        return text;
    }
}
