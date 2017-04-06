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
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";
        let day: DayWrapper = structure.getDays()[0];
        text += MorningNoonEveningNightConverterImpl.getMorningText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getNoonText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getEveningText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getNightText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightConverterImpl.getSupplText(structure.getSupplText());
        return text;
    }

    public static getMorningText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";
        if (day.getMorningDose()) {
            text += ShortTextConverterImpl.toDoseAndUnitValue(day.getMorningDose(), unitOrUnits);
            if (day.getMorningDose().getIsAccordingToNeed())
                text += " efter behov";
        }

        return text;
    }

    public static getNoonText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        let text = "";

        if (day.getNoonDose()) {
            // Er der en morgen-dosis og kommer der en efterflg. dosistekst ELLER der er tale om blandet PN/fast, brug ","
            if (day.getMorningDose() && ((day.getEveningDose() || day.getNightDose()) || !day.containsOnlyPNOrFixedDoses()))
                text += ", ";
            else if (day.getMorningDose() && day.containsOnlyPNOrFixedDoses())    // Kun "og" hvis ikke blandet af PN og fast, da teksten ellers bliver uklar
                text += " og ";

            if (!day.allDosesHaveTheSameQuantity() || !day.containsOnlyPNOrFixedDoses())
                text += ShortTextConverterImpl.toDoseAndUnitValue(day.getNoonDose(), unitOrUnits);
            else if (day.getMorningDose())
                text += day.getNoonDose().getLabel();
            else
                text += ShortTextConverterImpl.toDoseAndUnitValue(day.getNoonDose(), unitOrUnits);
            if (day.getNoonDose().getIsAccordingToNeed())
                text += " efter behov";
        }

        return text;
    }

    public static getEveningText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {

        let text = "";

        if (day.getEveningDose()) {
            // Er der en morgen/midag-dosis og kommer der en efterflg. dosistekst ELLER der er tale om blandet PN/fast, brug ","
            if ((day.getMorningDose() || day.getNoonDose()) && ((day.getNightDose() || !day.containsOnlyPNOrFixedDoses()))) // Brug "," hvis PN er involveret, da teksten ellers bliver uklar
                text += ", ";
            else if ((day.getMorningDose() || day.getNoonDose()) && day.containsOnlyPNOrFixedDoses())   // Kun "og" hvis ikke blandet af PN og fast, da teksten ellers bliver uklar
                text += " og ";

            if (!day.allDosesHaveTheSameQuantity() || !day.containsOnlyPNOrFixedDoses())
                text += ShortTextConverterImpl.toDoseAndUnitValue(day.getEveningDose(), unitOrUnits);
            else if (day.getMorningDose() || day.getNoonDose())
                text += day.getEveningDose().getLabel();
            else
                text += ShortTextConverterImpl.toDoseAndUnitValue(day.getEveningDose(), unitOrUnits);
            if (day.getEveningDose().getIsAccordingToNeed())
                text += " efter behov";
        }

        return text;
    }

    public static getNightText(day: DayWrapper, unitOrUnits: UnitOrUnitsWrapper): string {

        let text = "";

        if (day.getNightDose()) {
            if (day.getMorningDose() || day.getNoonDose() || day.getEveningDose()) {
                if (day.containsOnlyPNOrFixedDoses()) {    // Kun "og" hvis ikke blandet PN/fast, da teksten ellers bliver uklar
                    text += " og ";
                }
                else {
                    text += ", ";
                }
            }
            if (!day.allDosesHaveTheSameQuantity() || !day.containsOnlyPNOrFixedDoses())
                text += ShortTextConverterImpl.toDoseAndUnitValue(day.getNightDose(), unitOrUnits);
            else if (day.getMorningDose() || day.getNoonDose() || day.getEveningDose())
                text += day.getNightDose().getLabel();
            else
                text += ShortTextConverterImpl.toDoseAndUnitValue(day.getNightDose(), unitOrUnits);
            if (day.getNightDose().getIsAccordingToNeed())
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
