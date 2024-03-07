
import { DailyDosis } from "./DailyDosis";
import { Interval } from "./Interval";
import StructureHelper from "./helpers/StructureHelper";
import { Dosage, Structure, Structures, UnitOrUnits } from "./dto/Dosage";

/**
 * Class for calculating the avg. daily dosis from the dosage structure.
 * This is possible when:
 * - The dosage is given in structured form (not "in local system" or free text)
 * - The dosage is for one periode
 * - The free text in the dosage doesn't alter the dosage expressed in dosage value and unit
 *   (doing so is not allowed according to the business rules, but this cannot be validated).
 * - And the dosage doesn't contain according to need dosages
 */
export class DailyDosisCalculator {

    public static calculateStr(jsonStr: string) {
        return DailyDosisCalculator.calculate(JSON.parse(jsonStr));
    }

    public static calculate(dosage: Dosage): DailyDosis {
        if (dosage.administrationAccordingToSchema)
            return new DailyDosis(undefined, undefined, undefined);
        else if (dosage.freeText)
            return new DailyDosis(undefined, undefined, undefined);
        else
            return DailyDosisCalculator.calculateFromStructures(dosage.structures);
    }

    private static calculateFromStructures(structures: Structures): DailyDosis {
        if (structures.structures.length === 1 && structures.structures[0].days !== undefined && structures.structures[0].days.length > 0)
            return DailyDosisCalculator.calculateFromStructure(structures.structures[0], structures.unitOrUnits);
        else
            return new DailyDosis(undefined, undefined, undefined); // Calculating a daily dosis for more than one dosage periode is not supported
    }

    private static calculateFromStructure(structure: Structure, unitOrUnits: UnitOrUnits): DailyDosis {
        // If the dosage isn't repeated it doesn't make sense to calculate an average
        // unless all daily doses are equal
        if (!structure.iterationInterval || StructureHelper.isIterationToLong(structure))
            if (!StructureHelper.allDaysAreTheSame(structure))
                return new DailyDosis(undefined, undefined, undefined);
        // If the structured dosage contains any doses according to need
        // we cannot calculate an average dosis
        if (StructureHelper.containsAccordingToNeedDose(structure))
            return new DailyDosis(undefined, undefined, undefined);
        // If there is a dosage for day zero (meaning not related to a specific day)
        // we cannot calculate an average dosis
        if (StructureHelper.getDay(structure, 0) !== undefined)
            return new DailyDosis(undefined, undefined, undefined);
        // Otherwise we will calculate an average dosage.
        // If the iteration interval is zero, the dosage is not repeated. This means
        // that the dosage for each day is given.
        if (!structure.iterationInterval || StructureHelper.isIterationToLong(structure))
            return DailyDosisCalculator.calculateAvg(
                StructureHelper.getSumOfDoses(structure),
                structure.days[structure.days.length - 1].dayNumber,
                unitOrUnits);
        // Else the dosage is repeated, and the iteration interval states after how many days
        else
            return DailyDosisCalculator.calculateAvg(
                StructureHelper.getSumOfDoses(structure),
                structure.iterationInterval,
                unitOrUnits);
    }

    private static calculateAvg(sum: Interval<number>, divisor: number, unitOrUnits: UnitOrUnits): DailyDosis {

        let avg: Interval<number> = {
            minimum: parseFloat((sum.minimum / divisor).toFixed(9)),
            maximum: parseFloat((sum.maximum / divisor).toFixed(9))
        };

        if (avg.maximum - avg.minimum < 0.000000001)
            return new DailyDosis(avg.minimum, undefined, unitOrUnits);
        else
            return new DailyDosis(undefined, { minimum: avg.minimum, maximum: avg.maximum }, unitOrUnits);
    }
}
