import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { DayWrapper } from "./vowrapper/DayWrapper";
import { StructuresWrapper } from "./vowrapper/StructuresWrapper";
import { StructureWrapper } from "./vowrapper/StructureWrapper";
import { DosageType } from "./DosageType";

export class DosageTypeCalculator {

    public static calculate(dosageJson: any) {
        return DosageTypeCalculator.calculateWrapper(DosageWrapper.fromJsonObject(dosageJson));
    }

    public static calculateStr(jsonStr: string) {
        return DosageTypeCalculator.calculate(JSON.parse(jsonStr));
    }

    public static calculateWrapper(dosage: DosageWrapper): DosageType {
        if (dosage.isAdministrationAccordingToSchema())
            return DosageType.Unspecified;
        else if (dosage.isFreeText())
            return DosageType.Unspecified;
        else
            return DosageTypeCalculator.calculateFromStructures(dosage.structures);
    }

    private static calculateFromStructures(structures: StructuresWrapper): DosageType {
        if (structures.getStructures().length === 1 || DosageTypeCalculator.allStructuresHasSameDosageType(structures)) {
            return DosageTypeCalculator.calculateFromStructure(structures.getStructures()[0]);
        } else {
            return DosageType.Combined;
        }
    }

    private static allStructuresHasSameDosageType(structures: StructuresWrapper): boolean {
        if (structures && structures.getStructures()) {
            for (let i = 0; i < structures.getStructures().length; i++) {
                let firstType: DosageType = DosageTypeCalculator.calculateFromStructure(structures.getStructures()[i]);
                for (let j = i + 1; j < structures.getStructures().length; j++) {
                    if (firstType !== DosageTypeCalculator.calculateFromStructure(structures.getStructures()[j])) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private static calculateFromStructure(structure: StructureWrapper): DosageType {
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

    public static isAccordingToNeed(structure: StructureWrapper): boolean {
        // If the dosage contains only according to need doses, it is quite simply just
        // an according to need dosage
        return structure.containsAccordingToNeedDosesOnly();
    }

    private static isTemporary(structure: StructureWrapper): boolean {
        // If there is no end date defined the dosage must not be iterated
        if (structure.getEndDateOrDateTime() === undefined && structure.getIterationInterval() > 0)
            return false;
        // If there is an according to need dose in the dosage it is not a (clean)
        // temporary dosage.
        if (structure.containsAccordingToNeedDose())
            return false;
        return true;
    }

    protected static isFixed(structure: StructureWrapper): boolean {
        // If there is an end date defined the dosage isn't fixed
        if (structure.getEndDateOrDateTime() !== undefined)
            return false;
        // If the dosage isn't iterated it isn't fixed
        if (structure.getIterationInterval() === 0)
            return false;
        // If there is an according to need dose in the dosage it is not a (clean)
        // temporary dosage.
        if (structure.containsAccordingToNeedDose())
            return false;
        return true;
    }

    private static isOneTime(structure: StructureWrapper): boolean {
        let isSameDayDateInterval: boolean = structure.startsAndEndsSameDay();
        // If we have and end date it must be the same day as the start date
        if (structure.getEndDateOrDateTime() !== undefined && !isSameDayDateInterval)
            return false;
        // We don't want to have a day 0 defined, as it contains only meaningful information
        // if the dosage is given according to need
        if (structure.getDay(0))
            return false;
        // The dose must be defined for day 1
        let day: DayWrapper = structure.getDay(1);
        if (day == null)
            return false;
        // There must be exactly one dose
        if (day.getAllDoses().length !== 1)
            return false;
        // And the dose must not be according to need
        if (day.containsAccordingToNeedDose())
            return false;
        // If the dosage isn't iterated we are happy now
        if (structure.getIterationInterval() === 0)
            return true;
        // If the dosage is iterated the end date must be defined as the same day as the start day
        return isSameDayDateInterval;
    }

}