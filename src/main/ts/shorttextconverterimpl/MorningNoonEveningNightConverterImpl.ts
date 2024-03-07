import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure, UnitOrUnits } from "../dto/Dosage";
import { DayHelper } from "../helpers/DayHelper";
import { DoseHelper } from "../helpers/DoseHelper";

export class MorningNoonEveningNightConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "MorningNoonEveningNightConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        let structure: Structure = dosage.structures.structures[0];
        if (structure.iterationInterval !== 1)
            return false;
        if (structure.days.length !== 1)
            return false;
        let day: Day = structure.days[0];
        if (day.dayNumber !== 1)
            return false;
        if (DayHelper.containsPlainDose(day) || DayHelper.containsTimedDose(day))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        let structure: Structure = dosage.structures.structures[0];
        let text = "";
        let day: Day = structure.days[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNoonText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getEveningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getNightText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.supplText);
        return text;
    }

    public static getMorningText(day: Day, unitOrUnits: UnitOrUnits): string {
        let text = "";
        if (DayHelper.getMorningDose(day)) {
            text += ShortTextConverterImpl.toDoseAndUnitValue(DayHelper.getMorningDose(day), unitOrUnits);
            if (DayHelper.getMorningDose(day).isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getNoonText(day: Day, unitOrUnits: UnitOrUnits): string {
        let text = "";

        if (DayHelper.getNoonDose(day)) {
            // Er der en morgen-dosis og kommer der en efterflg. dosistekst ELLER der er tale om blandet PN/fast, brug ","
            if (DayHelper.getMorningDose(day) && ((DayHelper.getEveningDose(day) || DayHelper.getNightDose(day)) || !DayHelper.containsOnlyPNOrFixedDoses(day)))
                text += ", ";
            else if (DayHelper.getMorningDose(day) && DayHelper.containsOnlyPNOrFixedDoses(day))    // Kun "og" hvis ikke blandet af PN og fast, da teksten ellers bliver uklar
                text += " og ";

            if (!DayHelper.allDosesHaveTheSameQuantity(day) || !DayHelper.containsOnlyPNOrFixedDoses(day))
                text += ShortTextConverterImpl.toDoseAndUnitValue(DayHelper.getNoonDose(day), unitOrUnits);
            else if (DayHelper.getMorningDose(day))
                text += DoseHelper.getLabel(DayHelper.getNoonDose(day));
            else
                text += ShortTextConverterImpl.toDoseAndUnitValue(DayHelper.getNoonDose(day), unitOrUnits);
            if (DayHelper.getNoonDose(day).isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getEveningText(day: Day, unitOrUnits: UnitOrUnits): string {

        let text = "";

        if (DayHelper.getEveningDose(day)) {
            // Er der en morgen/midag-dosis og kommer der en efterflg. dosistekst ELLER der er tale om blandet PN/fast, brug ","
            if ((DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day)) && ((DayHelper.getNightDose(day) || !DayHelper.containsOnlyPNOrFixedDoses(day)))) // Brug "," hvis PN er involveret, da teksten ellers bliver uklar
                text += ", ";
            else if ((DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day)) && DayHelper.containsOnlyPNOrFixedDoses(day))   // Kun "og" hvis ikke blandet af PN og fast, da teksten ellers bliver uklar
                text += " og ";

            if (!DayHelper.allDosesHaveTheSameQuantity(day) || !DayHelper.containsOnlyPNOrFixedDoses(day))
                text += ShortTextConverterImpl.toDoseAndUnitValue(DayHelper.getEveningDose(day), unitOrUnits);
            else if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day))
                text += DoseHelper.getLabel(DayHelper.getEveningDose(day));
            else
                text += ShortTextConverterImpl.toDoseAndUnitValue(DayHelper.getEveningDose(day), unitOrUnits);
            if (DayHelper.getEveningDose(day).isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getNightText(day: Day, unitOrUnits: UnitOrUnits): string {

        let text = "";

        if (DayHelper.getNightDose(day)) {
            if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day) || DayHelper.getEveningDose(day)) {
                if (DayHelper.containsOnlyPNOrFixedDoses(day)) {    // Kun "og" hvis ikke blandet PN/fast, da teksten ellers bliver uklar
                    text += " og ";
                }
                else {
                    text += ", ";
                }
            }
            if (!DayHelper.allDosesHaveTheSameQuantity(day) || !DayHelper.containsOnlyPNOrFixedDoses(day))
                text += ShortTextConverterImpl.toDoseAndUnitValue(DayHelper.getNightDose(day), unitOrUnits);
            else if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day) || DayHelper.getEveningDose(day))
                text += DoseHelper.getLabel(DayHelper.getNightDose(day));
            else
                text += ShortTextConverterImpl.toDoseAndUnitValue(DayHelper.getNightDose(day), unitOrUnits);
            if (DayHelper.getNightDose(day).isAccordingToNeed)
                text += " efter behov";
        }

        return text;
    }

    public static getSupplText(supplText: string): string {
        if (supplText) {
            return TextHelper.addShortSupplText(supplText);
        }

        return "";
    }
}
