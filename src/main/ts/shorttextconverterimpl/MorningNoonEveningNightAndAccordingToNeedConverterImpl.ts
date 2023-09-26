import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { SimpleLimitedAccordingToNeedConverterImpl } from "./SimpleLimitedAccordingToNeedConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class MorningNoonEveningNightAndAccordingToNeedConverterImpl extends ShortTextConverterImpl {


    public getConverterClassName(): string {
        return "MorningNoonEveningNightAndAccordingToNeedConverterImpl";
    }

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
        if (day.containsTimedDose())
            return false;
        if (day.containsPlainNotAccordingToNeedDose())
            return false;
        if (!day.containsMorningNoonEveningNightDoses())
            return false;
        if (!day.containsAccordingToNeedDose())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";
        let day: DayWrapper = structure.getDays()[0];
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getMorningText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getNoonText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getEveningText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getNightText(day, dosage.structures.getUnitOrUnits());
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getSupplText(structure.getSupplText());

        text += ", samt " + new SimpleLimitedAccordingToNeedConverterImpl().doConvert(dosage);

        return text.toString();
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
            if (day.getMorningDose() && (day.getEveningDose() || day.getNightDose()))
                text += ", ";
            else if (day.getMorningDose())
                text += " og ";
            if (!day.allDosesHaveTheSameQuantity())
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
            if ((day.getMorningDose() || day.getNoonDose()) && day.getNightDose())
                text += ", ";
            else if (day.getMorningDose() || day.getNoonDose())
                text += " og ";
            if (!day.allDosesHaveTheSameQuantity())
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
            if (day.getMorningDose() || day.getNoonDose() || day.getEveningDose())
                text += " og ";
            if (!day.allDosesHaveTheSameQuantity())
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
        let text = "";
        if (supplText)
            text += TextHelper.addShortSupplText(supplText);

        return text;
    }
}
