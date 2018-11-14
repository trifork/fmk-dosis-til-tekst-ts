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
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 1)
            return false;
        if (structure.getDays().length !== 1)
            return false;

        let day: DayWrapper = structure.getDays()[0];
        if (day.getDayNumber() !== 1)
            return false;
        if (day.containsPlainDose() || day.containsTimedDose())
            return false;
        if (day.containsAccordingToNeedDose())
            return false;
        if (!day.allDosesHaveTheSameQuantity())
            return false;
        if (day.getAllDoses()[0].getDoseQuantity() === undefined)
            return false;
        if (!ShortTextConverterImpl.hasIntegerValue(day.getAllDoses()[0].getDoseQuantity()))
            return false;

        let quantity: number = day.getAllDoses()[0].getDoseQuantity();
        if (!(quantity % 2 === 0))
            return false;
        if (structure.getSupplText() === undefined)
            return false;

        if (TextHelper.strEndsWith(structure.getSupplText(), "i hvert øje")) {
            if (TextHelper.strStartsWith(structure.getSupplText(), ",")) {
                if (structure.getSupplText() !== ", " + (quantity / 2) + " i hvert øje") {
                    return false;
                }
            }
            else {
                if (structure.getSupplText() !== (quantity / 2) + " i hvert øje") {
                    return false;
                }
            }
        }
        else if (TextHelper.strEndsWith(structure.getSupplText(), "i hvert øre")) {
            if (TextHelper.strStartsWith(structure.getSupplText(), ",")) {
                if (structure.getSupplText() !== ", " + (quantity / 2) + " i hvert øre") {
                    return false;
                }
            }
            else {
                if (structure.getSupplText() !== (quantity / 2) + " i hvert øre") {
                    return false;
                }
            }
        }
        else if (TextHelper.strEndsWith(structure.getSupplText(), "i hvert næsebor")) {
            if (TextHelper.strStartsWith(structure.getSupplText(), ",")) {
                if (structure.getSupplText() !== ", " + (quantity / 2) + " i hvert næsebor") {
                    return false;
                }
            }
            else {
                if (structure.getSupplText() !== (quantity / 2) + " i hvert næsebor") {
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
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";
        let day: DayWrapper = structure.getDays()[0];
        text += MorningNoonEveningNightEyeOrEarConverterImpl.getMorningText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightEyeOrEarConverterImpl.getNoonText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightEyeOrEarConverterImpl.getEveningText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightEyeOrEarConverterImpl.getNightText(day, dosage.structures.getUnitOrUnits());

        let supplText = "";
        if (TextHelper.strEndsWith(structure.getSupplText(), "i hvert øje")) {
            supplText = " i begge øjne";
        }
        else if (TextHelper.strEndsWith(structure.getSupplText(), "i hvert øre")) {
            supplText = " i begge ører";
        }
        else if (TextHelper.strEndsWith(structure.getSupplText(), "i hvert næsebor")) {
            supplText = " i begge næsebor";
        }

        text += supplText;
        return text;
    }

    public static getMorningText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";
        if (day.getMorningDose()) {
            text += this.toDoseLabelUnitValue(day.getMorningDose().getDoseQuantity() / 2, day.getMorningDose().getLabel(), unitOrUnits);
            if (day.getMorningDose().getIsAccordingToNeed()) {
                text += " efter behov";
            }
        }

        return text;
    }

    public static getNoonText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";
        if (day.getNoonDose()) {
            if (day.getMorningDose() && (day.getEveningDose() || day.getNightDose()))
                text += ", ";
            else if (day.getMorningDose())
                text += " og ";
            if (day.getMorningDose())
                text += day.getNoonDose().getLabel();
            else
                text += this.toDoseLabelUnitValue(day.getNoonDose().getDoseQuantity() / 2, day.getNoonDose().getLabel(), unitOrUnits);
            if (day.getNoonDose().getIsAccordingToNeed())
                text += " efter behov";
        }

        return text;
    }

    public static getEveningText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";
        if (day.getEveningDose()) {
            if ((day.getMorningDose() || day.getNoonDose()) && day.getNightDose())
                text += ", ";
            else if (day.getMorningDose() || day.getNoonDose())
                text += " og ";
            if (day.getMorningDose() || day.getNoonDose() )
                text += day.getEveningDose().getLabel();
            else
                text += this.toDoseLabelUnitValue(day.getEveningDose().getDoseQuantity() / 2, day.getEveningDose().getLabel(), unitOrUnits);
            if (day.getEveningDose().getIsAccordingToNeed())
                text += " efter behov";
        }

        return text;
    }

    public static getNightText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";
        if (day.getNightDose()) {
            if (day.getMorningDose() || day.getNoonDose() || day.getEveningDose() )
                text += " og ";
            if (day.getMorningDose() || day.getNoonDose() || day.getEveningDose())
                text += day.getNightDose().getLabel();
            else
                text += this.toDoseLabelUnitValue(day.getNightDose().getDoseQuantity() / 2, day.getNightDose().getLabel(), unitOrUnits);
            if (day.getNightDose().getIsAccordingToNeed())
                text += " efter behov";
        }

        return text;
    }
}
