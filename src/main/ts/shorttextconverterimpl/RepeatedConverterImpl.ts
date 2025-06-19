import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { Day, Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DayHelper } from "../helpers/DayHelper";
import { DoseHelper } from "../helpers/DoseHelper";

export class RepeatedConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "RepeatedConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        const structure: Structure = dosage.structures.structures[0];
        if (!structure.iterationInterval)
            return false;
        if (structure.days.length !== 1)
            return false;
        const day: Day = structure.days[0];
        if (DayHelper.containsAccordingToNeedDose(day))
            return false;
        if (!DayHelper.allDosesAreTheSame(day))
            return false;
        if (StructureHelper.isIterationToLong(structure) && !StructureHelper.startsAndEndsSameDay(structure))
            return false;
        return true;
    }

    public doConvert(dosage: Dosage): string {
        const structure: Structure = dosage.structures.structures[0];
        let text = "";

        // Append dosage
        const day: Day = structure.days[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.allDoses[0], dosage.structures.unitOrUnits);

        // Append iteration:
        text += this.makeIteration(structure, day);

        // Append suppl. text
        if (structure.supplText)
            text += TextHelper.addShortSupplText(structure.supplText);

        return text;
    }

    private makeIteration(structure: Structure, day: Day): string {

        const iterationInterval = structure.iterationInterval;
        const numberOfDoses = day.allDoses.length;

        // Repeated daily
        if (iterationInterval === 1 && numberOfDoses === 1) {
            if (DoseHelper.getLabel(day.allDoses[0]) === "" && day.allDoses[0].doseQuantity && day.allDoses[0].doseQuantity > 1.000000001)
                return " 1 gang daglig";
            else
                return " daglig";
        }
        if (iterationInterval === 1 && numberOfDoses > 1)
            return " " + numberOfDoses + " " + TextHelper.gange(numberOfDoses) + " daglig";

        const useIterationText = !StructureHelper.startsAndEndsSameDay(structure);
        const timesString = numberOfDoses === 1 ? "gang" : "gange";


        // Repeated monthly
        const numberOfWholeMonths = this.calculateNumberOfWholeMonths(iterationInterval);
        if (useIterationText && numberOfWholeMonths === 1 && numberOfDoses === 1)
            return " 1 gang om måneden";
        if (numberOfWholeMonths === 1 && numberOfDoses >= 1)
            return " " + numberOfDoses + " " + (useIterationText ? timesString + " samme dag 1 gang om måneden" : timesString + (numberOfDoses > 1 ? " samme dag" : ""));
        if (useIterationText && numberOfWholeMonths > 1 && numberOfDoses === 1)
            return " hver " + numberOfWholeMonths + ". måned";

        // Repeated weekly
        const numberOfWholeWeeks = this.calculateNumberOfWholeWeeks(structure.iterationInterval);
        const name: string = TextHelper.makeDayOfWeekAndName(structure.startDate, day, false).name;
        if (numberOfWholeWeeks === 1 && day.allDoses.length === 1)
            return " " + name + (useIterationText ? " hver uge" : "");
        else if (numberOfWholeWeeks === 1 && numberOfDoses > 1)
            return " " + numberOfDoses + " " + timesString + " " + name + (useIterationText ? " hver uge" : "");
        if (numberOfWholeWeeks > 1 && numberOfDoses === 1)
            return " " + name +  (useIterationText ? " hver " + numberOfWholeWeeks + ". uge" : "");

        // Every Nth day
        if (useIterationText && iterationInterval > 1 && numberOfDoses === 1)
            return " hver " + iterationInterval + ". dag";
        if (iterationInterval > 1 && numberOfDoses >= 1)
            return " " + numberOfDoses + " " + timesString +  (useIterationText ? " samme dag hver " + iterationInterval + ". dag" : "");

        // Above is exhaustive if both iterationInterval>1 and numberOfDoses>1, return null to make compiler happy
        return null;
    }


}
