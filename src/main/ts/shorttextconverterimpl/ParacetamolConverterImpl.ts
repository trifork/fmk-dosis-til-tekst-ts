import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { DayHelper } from "../helpers/DayHelper";

export class ParacetamolConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "ParacetamolConverterImpl";
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
        if (!DayHelper.containsAccordingToNeedDose(day))
            return false;
        if (DayHelper.containsAccordingToNeedDosesOnly(day))
            return false;
        if (DayHelper.containsTimedDose(day)) {
            return false;
        }
        if (!DayHelper.containsPlainDose(day))
            return false;
        if (DayHelper.getMorningDose(day) || DayHelper.getNoonDose(day)
            || DayHelper.getEveningDose(day) || DayHelper.getNightDose(day))
            return false;
        if (!DayHelper.allDosesHaveTheSameQuantity(day))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        let structure: Structure = dosage.structures.structures[0];
        let text = "";

        let day: Day = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);
        text += " " + (DayHelper.getNumberOfPlainDoses(day) - DayHelper.getNumberOfAccordingToNeedDoses(day)) + "-" + (DayHelper.getNumberOfPlainDoses(day));
        text += " gange daglig";
        if (structure.supplText)
            text += TextHelper.addShortSupplText(structure.supplText);
        return text.toString();
    }

}
