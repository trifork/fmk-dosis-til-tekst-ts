import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import DayHelper from "../helpers/DayHelper";

/**
 * Conversion of simple but limited "according to need" dosage, with or without suppl. dosage free text
 * <p>
 * Example:<br>
 * 283: 1 pust ved anfald højst 3 gange daglig
 */
export class SimpleLimitedAccordingToNeedConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "SimpleLimitedAccordingToNeedConverterImpl";
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
        if (!DayHelper.containsAccordingToNeedDosesOnly(day))
            return false;
        if (!DayHelper.allDosesAreTheSame(day))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        let structure: Structure = dosage.structures.structures[0];
        let text = "";
        let day: Day = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(DayHelper.getAccordingToNeedDoses(day)[0], dosage.structures.unitOrUnits);
        text += " efter behov";

        if (DayHelper.getNumberOfAccordingToNeedDoses(day) === 1) {
            text += ", højst 1 gang dagligt";
        }
        else if (DayHelper.getNumberOfAccordingToNeedDoses(day) > 1) {
            text += ", højst " + DayHelper.getNumberOfAccordingToNeedDoses(day) + " gange daglig";
        }

        if (structure.supplText)
            text += TextHelper.addShortSupplText(structure.supplText);

        return text.toString();
    }
}
