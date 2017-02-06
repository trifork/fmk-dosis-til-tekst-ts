
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "./vowrapper/UnitOrUnitsWrapper";
import { StructuresWrapper } from "./vowrapper/StructuresWrapper";
import { StructureWrapper } from "./vowrapper/StructureWrapper";
import { DailyDosis } from "./DailyDosis";
import { Interval } from "./Interval";

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

    public static calculate(dosageJson: any) {
        return DailyDosisCalculator.calculateWrapper(DosageWrapper.fromJsonObject(dosageJson));
    }

    public static calculateStr(jsonStr: string) {
        return DailyDosisCalculator.calculate(JSON.parse(jsonStr));
    }

    public static calculateWrapper(dosage: DosageWrapper): DailyDosis {
        if (dosage.isAdministrationAccordingToSchema())
            return new DailyDosis(undefined, undefined, undefined);
        else if (dosage.isFreeText())
            return new DailyDosis(undefined, undefined, undefined);
        else
            return DailyDosisCalculator.calculateFromStructures(dosage.structures);
    }

    private static calculateFromStructures(structures: StructuresWrapper): DailyDosis {
        if (structures.getStructures().length === 1 && structures.getStructures()[0].getDays() !== undefined && structures.getStructures()[0].getDays().length > 0)
            return DailyDosisCalculator.calculateFromStructure(structures.getStructures()[0], structures.getUnitOrUnits());
        else
            return new DailyDosis(undefined, undefined, undefined); // Calculating a daily dosis for more than one dosage periode is not supported
    }

    private static calculateFromStructure(structure: StructureWrapper, unitOrUnits: UnitOrUnitsWrapper): DailyDosis {
        // If the dosage isn't repeated it doesn't make sense to calculate an average
        // unless all daily doses are equal
        if (structure.getIterationInterval() === 0)
            if (!structure.allDaysAreTheSame())
                return new DailyDosis(undefined, undefined, undefined);
        // If the structured dosage contains any doses according to need
        // we cannot calculate an average dosis
        if (structure.containsAccordingToNeedDose())
            return new DailyDosis(undefined, undefined, undefined);
        // If there is a dosage for day zero (meaning not related to a specific day) 
        // we cannot calculate an average dosis
        if (structure.getDay(0) !== undefined)
            return new DailyDosis(undefined, undefined, undefined);
        // Otherwise we will calculate an average dosage. 
        // If the iteration interval is zero, the dosage is not repeated. This means
        // that the dosage for each day is given. 
        if (structure.getIterationInterval() === 0)
            return DailyDosisCalculator.calculateAvg(
                structure.getSumOfDoses(),
                structure.getDays()[structure.getDays().length - 1].getDayNumber(),
                unitOrUnits);
        // Else the dosage is repeated, and the iteration interval states after how many days 
        else
            return DailyDosisCalculator.calculateAvg(
                structure.getSumOfDoses(),
                structure.getIterationInterval(),
                unitOrUnits);
    }

    private static calculateAvg(sum: Interval<number>, divisor: number, unitOrUnits: UnitOrUnitsWrapper): DailyDosis {

        let avg: Interval<number> = {
            minimum: sum.minimum / divisor,
            maximum: sum.maximum / divisor
        };

        if (avg.maximum - avg.minimum < 0.000000001)
            return new DailyDosis(avg.minimum, undefined, unitOrUnits);
        else
            return new DailyDosis(undefined, { minimum: avg.minimum, maximum: avg.maximum }, unitOrUnits);
    }
}
