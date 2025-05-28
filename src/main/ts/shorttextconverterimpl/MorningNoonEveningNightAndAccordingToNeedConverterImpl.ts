import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { SimpleLimitedAccordingToNeedConverterImpl } from "./SimpleLimitedAccordingToNeedConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure, UnitOrUnits } from "../dto/Dosage";
import { DayHelper } from "../helpers/DayHelper";
import { DoseHelper } from "../helpers/DoseHelper";

export class MorningNoonEveningNightAndAccordingToNeedConverterImpl extends ShortTextConverterImpl {


    public getConverterClassName(): string {
        return "MorningNoonEveningNightAndAccordingToNeedConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
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
        if (DayHelper.containsTimedDose(day))
            return false;
        if (DayHelper.containsPlainNotAccordingToNeedDose(day))
            return false;
        if (!DayHelper.containsMorningNoonEveningNightDoses(day))
            return false;
        if (!DayHelper.containsAccordingToNeedDose(day))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        let structure: Structure = dosage.structures.structures[0];
        let text = "";
        let day: Day = structure.days[0];
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getMorningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getNoonText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getEveningText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getNightText(day, dosage.structures.unitOrUnits);
        text += MorningNoonEveningNightAndAccordingToNeedConverterImpl.getSupplText(structure.supplText);

        text += ", samt " + new SimpleLimitedAccordingToNeedConverterImpl().doConvert(dosage);

        return text.toString();
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
            if (DayHelper.getMorningDose(day) && (DayHelper.getEveningDose(day) || DayHelper.getNightDose(day)))
                text += ", ";
            else if (DayHelper.getMorningDose(day))
                text += " og ";
            if (!DayHelper.allDosesHaveTheSameQuantity(day))
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
            if ((DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day)) && DayHelper.getNightDose(day))
                text += ", ";
            else if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day))
                text += " og ";
            if (!DayHelper.allDosesHaveTheSameQuantity(day))
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
            if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day) || DayHelper.getEveningDose(day))
                text += " og ";
            if (!DayHelper.allDosesHaveTheSameQuantity(day))
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
        let text = "";
        if (supplText)
            text += TextHelper.addShortSupplText(supplText);

        return text;
    }
}
