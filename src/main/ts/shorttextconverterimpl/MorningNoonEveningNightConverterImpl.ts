import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class MorningNoonEveningNightConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.structures[0];
        if (structure.iterationInterval !== 1)
            return false;
        if (structure.days.length !== 1)
            return false;
        let day: DayWrapper = structure.days[0];
        if (day.dayNumber !== 1)
            return false;
        if (day.containsPlainDose() || day.containsTimedDose())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";
        let day: DayWrapper = structure.days[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNoonText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getEveningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNightText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.supplText);
        return text;
    }

    public static getMorningText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";
        if (day.morningDose) {
            text += this.toDoseAndUnitValue(day.morningDose, unitOrUnits);
            if (day.morningDose.isAccordingToNeed)
                text += " efter behov";
        }
        return text;
    }

    public static getNoonText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";

        if (day.noonDose) {
            if (day.morningDose && (day.eveningDose || day.nightDose))
                text += ", ";
            else if (day.morningDose)
                text += " og ";
            if (!day.allDosesHaveTheSameQuantity())
                text += this.toDoseAndUnitValue(day.noonDose, unitOrUnits);
            else if (day.morningDose)
                text += day.noonDose.getLabel();
            else
                text += this.toDoseAndUnitValue(day.noonDose, unitOrUnits);
            if (day.noonDose.isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getEveningText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {

        let text = "";

        if (day.eveningDose) {
            if ((day.morningDose || day.noonDose) && day.nightDose)
                text += ", ";
            else if (day.morningDose || day.noonDose)
                text += " og ";
            if (!day.allDosesHaveTheSameQuantity())
                text += this.toDoseAndUnitValue(day.eveningDose, unitOrUnits);
            else if (day.morningDose || day.noonDose)
                text += day.eveningDose.getLabel();
            else
                text += this.toDoseAndUnitValue(day.eveningDose, unitOrUnits);
            if (day.eveningDose.isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getNightText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {

        let text = "";

        if (day.nightDose) {
            if (day.morningDose || day.noonDose  || day.eveningDose )
                text += " og ";
            if (!day.allDosesHaveTheSameQuantity())
                text += this.toDoseAndUnitValue(day.nightDose, unitOrUnits);
            else if (day.morningDose || day.noonDose || day.eveningDose )
                text += day.nightDose.getLabel();
            else
                text += this.toDoseAndUnitValue(day.nightDose, unitOrUnits);
            if (day.nightDose.isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getSupplText(supplText: string): string {
        if (supplText) {
            return TextHelper.maybeAddSpace(supplText) + supplText;
        }

        return "";
    }
}