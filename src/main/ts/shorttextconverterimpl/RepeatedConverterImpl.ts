import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class RepeatedConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "RepeatedConverterImpl";
    }

    public canConvert(dosage: DosageWrapper): boolean {
        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval())
            return false;
        if (structure.getDays().length !== 1)
            return false;
        let day: DayWrapper = structure.getDays()[0];
        if (day.containsAccordingToNeedDose())
            return false;
        if (!day.allDosesAreTheSame())
            return false;
        if (structure.isIterationToLong() && !structure.startsAndEndsSameDay())
            return false;
        return true;
    }

    public doConvert(dosage: DosageWrapper): string {
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        let text = "";

        // Append dosage
        let day: DayWrapper = structure.getDays()[0];
        text += ShortTextConverterImpl.toDoseAndUnitValue(day.getAllDoses()[0], dosage.structures.getUnitOrUnits());

        // Append iteration:
        text += this.makeIteration(structure, day);

        // Append suppl. text
        if (structure.getSupplText())
            text += TextHelper.addShortSupplText(structure.getSupplText());

        return text;
    }

    private makeIteration(structure: StructureWrapper, day: DayWrapper): string {

        let iterationInterval = structure.getIterationInterval();
        let numberOfDoses = day.getNumberOfDoses();

        // Repeated daily
        if (iterationInterval === 1 && numberOfDoses === 1) {
            if (day.getDose(0).getLabel() === "" && day.getDose(0).getDoseQuantity() && day.getDose(0).getDoseQuantity() > 1.000000001)
                return " 1 gang daglig";
            else
                return " daglig";
        }
        if (iterationInterval === 1 && numberOfDoses > 1)
            return " " + numberOfDoses + " " + TextHelper.gange(numberOfDoses) + " daglig";

        let useIterationText = !structure.startsAndEndsSameDay();
        let timesString = numberOfDoses === 1 ? "gang" : "gange";


        // Repeated monthly
        let numberOfWholeMonths = this.calculateNumberOfWholeMonths(iterationInterval);
        if (useIterationText && numberOfWholeMonths === 1 && numberOfDoses === 1)
            return " 1 gang om måneden";
        if (numberOfWholeMonths === 1 && numberOfDoses >= 1)
            return " " + numberOfDoses + " " + (useIterationText ? timesString + " samme dag 1 gang om måneden" : timesString + (numberOfDoses > 1 ? " samme dag" : ""));
        if (useIterationText && numberOfWholeMonths > 1 && numberOfDoses === 1)
            return " hver " + numberOfWholeMonths + ". måned";

        // Repeated weekly
        let numberOfWholeWeeks = this.calculateNumberOfWholeWeeks(structure.getIterationInterval());
        let name: string = TextHelper.makeDayOfWeekAndName(structure.getStartDateOrDateTime(), day, false).getName();
        if (numberOfWholeWeeks === 1 && day.getNumberOfDoses() === 1)
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
