import { DosageType } from "./DosageType";
import StructureHelper from "./helpers/StructureHelper";
import { Day, Dosage, Structure, Structures } from "./dto/Dosage";
import DayHelper from "./helpers/DayHelper";
import { DosageWrapper } from "./vowrapper/DosageWrapper";

export class DosageTypeCalculator {

    public static calculateStr(jsonStr: string) {
        return DosageTypeCalculator.calculate(JSON.parse(jsonStr));
    }

    public static calculate(dosage: Dosage): DosageType {
        if (dosage.administrationAccordingToSchema) {
            return DosageType.Unspecified;
        } else if (dosage.freeText) {
            return DosageType.Unspecified;
        } else {
            return DosageTypeCalculator.calculateFromStructures(dosage.structures);
        }
    }

    /**
    * @deprecated This method and the corresponding wrapper classes will be removed. Use calculate(dosage: Dosage, ...) instead. 
    */
    public static calculateWrapper(dosage: DosageWrapper): DosageType {
        return DosageTypeCalculator.calculate(dosage.value);
    }
    
    private static calculateFromStructures(structures: Structures): DosageType {
        if (structures.structures.length === 1 || DosageTypeCalculator.allStructuresHasSameDosageType(structures)) {
            return DosageTypeCalculator.calculateFromStructure(structures.structures[0]);
        } else {
            return DosageType.Combined;
        }
    }

    private static allStructuresHasSameDosageType(structures: Structures): boolean {
        if (structures?.structures) {
            for (let i = 0; i < structures.structures.length; i++) {
                let firstType: DosageType = DosageTypeCalculator.calculateFromStructure(structures.structures[i]);
                for (let j = i + 1; j < structures.structures.length; j++) {
                    if (firstType !== DosageTypeCalculator.calculateFromStructure(structures.structures[j])) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private static calculateFromStructure(structure: Structure): DosageType {
        if (DosageTypeCalculator.isAccordingToNeed(structure))
            return DosageType.AccordingToNeed;
        else if (DosageTypeCalculator.isOneTime(structure))
            return DosageType.OneTime;
        else if (DosageTypeCalculator.isTemporary(structure))
            return DosageType.Temporary;
        else if (DosageTypeCalculator.isFixed(structure))
            return DosageType.Fixed;
        else
            return DosageType.Combined;
    }

    public static isAccordingToNeed(structure: Structure): boolean {
        // If the dosage contains only according to need doses, it is quite simply just
        // an according to need dosage
        return StructureHelper.containsAccordingToNeedDosesOnly(structure);
    }

    private static isTemporary(structure: Structure): boolean {
        // If there is no end date defined the dosage must not be iterated
        if (!structure.endDateOrDateTime && structure.iterationInterval > 0)
            return false;
        // If there is an according to need dose in the dosage it is not a (clean)
        // temporary dosage.
        if (StructureHelper.containsAccordingToNeedDose(structure))
            return false;
        return true;
    }

    protected static isFixed(structure: Structure): boolean {
        // If there is an end date defined the dosage isn't fixed
        if (structure.endDateOrDateTime)
            return false;
        // If the dosage isn't iterated it isn't fixed
        if (!structure.iterationInterval || StructureHelper.isIterationToLong(structure))
            return false;
        // If there is an according to need dose in the dosage it is not a (clean)
        // temporary dosage.
        if (StructureHelper.containsAccordingToNeedDose(structure))
            return false;
        return true;
    }

    private static isOneTime(structure: Structure): boolean {
        let isSameDayDateInterval: boolean = StructureHelper.startsAndEndsSameDay(structure);
        // If we have and end date it must be the same day as the start date
        if ((structure.endDateOrDateTime?.date || structure.endDateOrDateTime?.dateTime) && !isSameDayDateInterval)
            return false;
        // We don't want to have a day 0 defined, as it contains only meaningful information
        // if the dosage is given according to need
        if (structure.days.find(day => day.dayNumber === 0))
            return false;
        // The dose must be defined for day 1
        let day: Day = structure.days.find(day => day.dayNumber === 1);
        if (!day)
            return false;
        // There must be exactly one dose
        if (day.allDoses.length !== 1)
            return false;
        // And the dose must not be according to need
        if (DayHelper.containsAccordingToNeedDose(day))
            return false;
        // If the dosage isn't iterated we are happy now
        if (!structure.iterationInterval || StructureHelper.isIterationToLong(structure))
            return true;
        // If the dosage is iterated the end date must be defined as the same day as the start day
        return isSameDayDateInterval;
    }

}