import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import DayHelper from "../helpers/DayHelper";
import DoseHelper from "../helpers/DoseHelper";

export class RepeatedEyeOrEarConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "RepeatedEyeOrEarConverterImpl";
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
        if (DayHelper.containsTimedDose(day))
            return false;
        if (DayHelper.containsAccordingToNeedDose(day))
            return false;

        if (!DayHelper.allDosesAreTheSame(day))
            return false;

        if (typeof day.allDoses[0].doseQuantity !== "number")
            return false;
        if (!ShortTextConverterImpl.hasIntegerValue(day.allDoses[0].doseQuantity))
            return false;
        let quantity: number = day.allDoses[0].doseQuantity;
        if (!(quantity % 2 === 0))
            return false;
        if (!structure.supplText)
            return false;
        if (TextHelper.strEndsWith(structure.supplText, "i hvert øje")) {
            if (TextHelper.strStartsWith(structure.supplText, ",")) {
                if (structure.supplText !== (", " + (quantity / 2) + " i hvert øje"))
                    return false;
            }
            else {
                if (structure.supplText !== ((quantity / 2) + " i hvert øje"))
                    return false;
            }
        }
        else if (TextHelper.strEndsWith(structure.supplText, "i hvert øre")) {
            if (TextHelper.strStartsWith(structure.supplText, ",")) {
                if (structure.supplText !== (", " + (quantity / 2) + " i hvert øre"))
                    return false;
            }
            else {
                if (structure.supplText !== ((quantity / 2) + " i hvert øre"))
                    return false;
            }
        }
        else if (TextHelper.strEndsWith(structure.supplText, "i hvert næsebor")) {
            if (TextHelper.strStartsWith(structure.supplText, ",")) {
                if (structure.supplText !== (", " + (quantity / 2) + " i hvert næsebor"))
                    return false;
            }
            else {
                if (structure.supplText !== ((quantity / 2) + " i hvert næsebor"))
                    return false;
            }
        }
        else {
            return false;
        }

        return true;
    }

    public doConvert(dosage: Dosage): string {
        let structure: Structure = dosage.structures.structures[0];

        let text = "";

        // Append dosage
        let day: Day = structure.days[0];
        text += (ShortTextConverterImpl.toDoseLabelUnitValue(day.allDoses[0].doseQuantity / 2, DoseHelper.getLabel(day.allDoses[0]), dosage.structures.unitOrUnits));

        // Append iteration:
        text += this.makeIteration(structure, day);

        // Append suppl. text
        let supplText = "";
        if (TextHelper.strEndsWith(structure.supplText, "i hvert øje")) {
            supplText = TextHelper.addShortSupplText("i begge øjne");
        }
        else if (TextHelper.strEndsWith(structure.supplText, "i hvert øre")) {
            supplText = TextHelper.addShortSupplText("i begge ører");
        }
        else if (TextHelper.strEndsWith(structure.supplText, "i hvert næsebor")) {
            supplText = TextHelper.addShortSupplText("i begge næsebor");
        }

        text += supplText;

        return text;
    }

    private makeIteration(structure: Structure, day: Day): string {

        let iterationInterval = structure.iterationInterval;
        let numberOfDoses = day.allDoses.length;

        // Repeated daily
        if (iterationInterval === 1 && numberOfDoses === 1)
            return " daglig";
        if (iterationInterval === 1 && numberOfDoses > 1)
            return " " + numberOfDoses + " " + TextHelper.gange(numberOfDoses) + " daglig";

        // Repeated monthly
        let numberOfWholeMonths = this.calculateNumberOfWholeMonths(iterationInterval);
        if (numberOfWholeMonths === 1 && numberOfDoses === 1)
            return " 1 gang om måneden";
        if (numberOfWholeMonths === 1 && numberOfDoses >= 1)
            return " " + numberOfDoses + " " + "gange samme dag 1 gang om måneden";
        if (numberOfWholeMonths > 1 && numberOfDoses === 1)
            return " hver " + numberOfWholeMonths + ". måned";

        // Repeated weekly
        let numberOfWholeWeeks = this.calculateNumberOfWholeWeeks(structure.iterationInterval);
        let name = TextHelper.makeDayOfWeekAndName(structure.startDateOrDateTime, day, false).name;
        if (numberOfWholeWeeks === 1 && day.allDoses.length === 1)
            return " " + name + " hver uge";
        else if (numberOfWholeWeeks === 1 && numberOfDoses > 1)
            return " " + numberOfDoses + " " + "gange " + name + " hver uge";
        if (numberOfWholeWeeks > 1 && numberOfDoses === 1)
            return " " + name + " hver " + numberOfWholeWeeks + ". uge";

        // Every Nth day
        if (iterationInterval > 1 && numberOfDoses === 1)
            return " hver " + iterationInterval + ". dag";
        if (iterationInterval > 1 && numberOfDoses >= 1)
            return " " + numberOfDoses + " " + "gange samme dag hver " + iterationInterval + ". dag";

        // Above is exhaustive if both iterationInterval>1 and numberOfDoses>1, return null to make compiler happy
        return null;
    }
}
