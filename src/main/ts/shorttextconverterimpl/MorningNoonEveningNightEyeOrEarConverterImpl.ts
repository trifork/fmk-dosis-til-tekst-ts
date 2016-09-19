import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class MorningNoonEveningNightEyeOrEarConverterImpl extends ShortTextConverterImpl {

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
        if (day.containsAccordingToNeedDose())
            return false;
        if (!day.allDosesHaveTheSameQuantity())
            return false;
        if (day.allDoses[0].doseQuantity === undefined)
            return false;
        if (!ShortTextConverterImpl.hasIntegerValue(day.allDoses[0].doseQuantity))
            return false;

        let quantity: number = day.allDoses[0].doseQuantity;
        if (!(quantity % 2 === 0))
            return false;
        if (structure.supplText === undefined)
            return false;

        if (TextHelper.strEndsWith(structure.supplText, "i hvert øje")) {
            if (TextHelper.strStartsWith(structure.supplText, ",")) {
                if (structure.supplText !== ", " + (quantity / 2) + " i hvert øje") {
                    return false;
                }
            }
            else {
                if (structure.supplText !== (quantity / 2) + " i hvert øje") {
                    return false;
                }
            }
        }
        else if (TextHelper.strEndsWith(structure.supplText, "i hvert øre")) {
            if (TextHelper.strStartsWith(structure.supplText, ",")) {
                if (structure.supplText !== ", " + (quantity / 2) + " i hvert øre") {
                    return false;
                }
            }
            else {
                if (structure.supplText !== (quantity / 2) + " i hvert øre") {
                    return false;
                }
            }
        }
        else if (TextHelper.strEndsWith(structure.supplText, "i hvert næsebor")) {
            if (TextHelper.strStartsWith(structure.supplText, ",")) {
                if (structure.supplText !== ", " + (quantity / 2) + " i hvert næsebor") {
                    return false;
                }
            }
            else {
                if (structure.supplText !== (quantity / 2) + " i hvert næsebor") {
                    return false;
                }
            }
        }
        else {
            return false;
        }

        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];
        let text = "";
        let day: DayWrapper = structure.days[0];
        text += MorningNoonEveningNightEyeOrEarConverterImpl.getMorningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightEyeOrEarConverterImpl.getNoonText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightEyeOrEarConverterImpl.getEveningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightEyeOrEarConverterImpl.getNightText(day, dosage.structures.unitOrUnits);

        let supplText = "";
        if (TextHelper.strEndsWith(structure.supplText, "i hvert øje")) {
            supplText = " i begge øjne";
        }
        else if (TextHelper.strEndsWith(structure.supplText, "i hvert øre")) {
            supplText = " i begge ører";
        }
        else if (TextHelper.strEndsWith(structure.supplText, "i hvert næsebor")) {
            supplText = " i begge næsebor";
        }

        text += supplText;
        return text;
    }

    public static getMorningText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";
        if (day.morningDose) {
            text += this.toDoseLabelUnitValue(day.morningDose.doseQuantity / 2, day.morningDose.getLabel(), unitOrUnits);
            if (day.morningDose.isAccordingToNeed) {
                text += " efter behov";
            }
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
            if (day.morningDose)
                text += day.noonDose.getLabel();
            else
                text += this.toDoseLabelUnitValue(day.noonDose.doseQuantity / 2, day.noonDose.getLabel(), unitOrUnits);
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
            if (day.morningDose != null || day.noonDose != null)
                text += day.eveningDose.getLabel();
            else
                text += this.toDoseLabelUnitValue(day.eveningDose.doseQuantity / 2, day.eveningDose.getLabel(), unitOrUnits);
            if (day.eveningDose.isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getNightText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";
        if (day.nightDose != null) {
            if (day.morningDose != null || day.noonDose != null || day.eveningDose != null)
                text += " og ";
            if (day.morningDose != null || day.noonDose != null || day.eveningDose != null)
                text += day.nightDose.getLabel();
            else
                text += this.toDoseLabelUnitValue(day.nightDose.doseQuantity / 2, day.nightDose.getLabel(), unitOrUnits);
            if (day.nightDose.isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }
}
