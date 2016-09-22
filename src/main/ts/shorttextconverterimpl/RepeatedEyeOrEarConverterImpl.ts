import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class RepeatedEyeOrEarConverterImpl extends ShortTextConverterImpl {

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
        if (day.containsTimedDose())
            return false;
        if (day.containsAccordingToNeedDose())
            return false;

        if (!day.allDosesAreTheSame())
            return false;

        if (day.allDoses[0].doseQuantity === undefined)
            return false;
        if (!RepeatedEyeOrEarConverterImpl.hasIntegerValue(day.allDoses[0].doseQuantity))
            return false;
        let quantity: number = day.allDoses[0].doseQuantity;
        if (!(quantity % 2 === 0))
            return false;
        if (structure.supplText === undefined)
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

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.structures[0];

        let text = "";

        // Append dosage
        let day: DayWrapper = structure.days[0];
        text += (ShortTextConverterImpl.toDoseLabelUnitValue(day.allDoses[0].doseQuantity / 2, day.allDoses[0].getLabel(), dosage.structures.unitOrUnits));

        // Append iteration:
        text += this.makeIteration(structure, day);

        // Append suppl. text
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

    private makeIteration(structure: StructureWrapper, day: DayWrapper): string {

        let iterationInterval = structure.iterationInterval;
        let numberOfDoses = day.getNumberOfDoses();

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
        if (numberOfWholeMonths > 1 && numberOfDoses == 1)
            return " hver " + numberOfWholeMonths + ". måned";

        // Repeated weekly
        let numberOfWholeWeeks = this.calculateNumberOfWholeWeeks(structure.iterationInterval);
        let name = TextHelper.makeDayOfWeekAndName(structure.startDateOrDateTime, day, false).name;
        if (numberOfWholeWeeks === 1 && day.getNumberOfDoses() === 1)
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
