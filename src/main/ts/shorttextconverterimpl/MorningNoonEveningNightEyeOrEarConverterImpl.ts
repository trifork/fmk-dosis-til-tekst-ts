import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure, UnitOrUnits } from "../dto/Dosage";
import { DayHelper } from "../helpers/DayHelper";
import { DoseHelper } from "../helpers/DoseHelper";

export class MorningNoonEveningNightEyeOrEarConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "MorningNoonEveningNightEyeOrEarConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        const structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval !== 1)
            return false;
        if (structure.days.length !== 1)
            return false;

        const day: Day = structure.days[0];
        if (day.dayNumber !== 1)
            return false;
        if (DayHelper.containsPlainDose(day) || DayHelper.containsTimedDose(day))
            return false;
        if (DayHelper.containsAccordingToNeedDose(day))
            return false;
        if (!DayHelper.allDosesHaveTheSameQuantity(day))
            return false;
        if (typeof day.allDoses[0].doseQuantity !== "number")
            return false;
        if (!ShortTextConverterImpl.hasIntegerValue(day.allDoses[0].doseQuantity))
            return false;

        const quantity: number = day.allDoses[0].doseQuantity;
        if (!(quantity % 2 === 0))
            return false;
        if (!structure.supplText)
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

    public doConvert(dosage: Dosage): string {
        const structure: Structure = dosage.structures.structures[0];
        let text = "";
        const day: Day = structure.days[0];
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

    public static getMorningText(day: Day, unitOrUnits: UnitOrUnits): string {
        let text = "";
        if (DayHelper.getMorningDose(day)) {
            text += this.toDoseLabelUnitValue(DayHelper.getMorningDose(day).doseQuantity / 2, DoseHelper.getLabel(DayHelper.getMorningDose(day)), unitOrUnits);
            if (DayHelper.getMorningDose(day).isAccordingToNeed) {
                text += " efter behov";
            }
        }

        return text;
    }

    public static getNoonText(day: Day, unitOrUnits: UnitOrUnits): string {
        let text = "";
        if (DayHelper.getNoonDose(day)) {
            if (DayHelper.getMorningDose(day) && (DayHelper.getEveningDose(day) || DayHelper.getNightDose(day)))
                text += ", ";
            else if (DayHelper.getMorningDose(day))
                text += " og ";
            if (DayHelper.getMorningDose(day))
                text += DoseHelper.getLabel(DayHelper.getNoonDose(day));
            else
                text += this.toDoseLabelUnitValue(DayHelper.getNoonDose(day).doseQuantity / 2, DoseHelper.getLabel(DayHelper.getNoonDose(day)), unitOrUnits);
            if (DayHelper.getNoonDose(day).isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getEveningText(day: Day, unitOrUnits: UnitOrUnits): string {
        let text = "";
        if (DayHelper.getEveningDose(day)) {
            if ((DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day)) && DayHelper.getNightDose(day))
                text += ", ";
            else if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day))
                text += " og ";
            if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day) )
                text += DoseHelper.getLabel(DayHelper.getEveningDose(day));
            else
                text += this.toDoseLabelUnitValue(DayHelper.getEveningDose(day).doseQuantity / 2, DoseHelper.getLabel(DayHelper.getEveningDose(day)), unitOrUnits);
            if (DayHelper.getEveningDose(day).isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getNightText(day: Day, unitOrUnits: UnitOrUnits): string {
        let text = "";
        if (DayHelper.getNightDose(day)) {
            if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day) || DayHelper.getEveningDose(day) )
                text += " og ";
            if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day) || DayHelper.getEveningDose(day))
                text += DoseHelper.getLabel(DayHelper.getNightDose(day));
            else
                text += this.toDoseLabelUnitValue(DayHelper.getNightDose(day).doseQuantity / 2, DoseHelper.getLabel(DayHelper.getNightDose(day)), unitOrUnits);
            if (DayHelper.getNightDose(day).isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }
}
