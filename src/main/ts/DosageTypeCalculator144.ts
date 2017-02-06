import { DosageTypeCalculator } from "./DosageTypeCalculator";
import { DosageWrapper } from "./vowrapper/DosageWrapper";
import { DayWrapper } from "./vowrapper/DayWrapper";
import { StructuresWrapper } from "./vowrapper/StructuresWrapper";
import { StructureWrapper } from "./vowrapper/StructureWrapper";
import { DosageType } from "./DosageType";


/*** 
 * From FMK 1.4.4 and above, only 3 dosage types are available: Fixed, AccordingToNeed and Combined (besides Unspec.).
 * Use this DosageTypeCalculator144 for all services using FMK 1.4.4 and higher, and use DosageTypeCalculator for FMK 1.4.2 and below
 * 
 *
 */
export class DosageTypeCalculator144 {

    public static calculate(dosageJson: any) {
        return DosageTypeCalculator144.calculateWrapper(DosageWrapper.fromJsonObject(dosageJson));
    }

    public static calculateStr(jsonStr: string) {
        return DosageTypeCalculator144.calculate(JSON.parse(jsonStr));
    }

    public static calculateWrapper(dosage: DosageWrapper): DosageType {
        if (dosage.isAdministrationAccordingToSchema())
            return DosageType.Unspecified;
        else if (dosage.isFreeText())
            return DosageType.Unspecified;
        else
            return DosageTypeCalculator144.calculateFromStructures(dosage.structures);
    }

    private static calculateFromStructures(structures: StructuresWrapper): DosageType {
        if (structures.getStructures().length === 1 || DosageTypeCalculator144.allStructuresHasSameDosageType(structures)) {
            return DosageTypeCalculator144.calculateFromStructure(structures.getStructures()[0]);
        } else {
            return DosageType.Combined;
        }
    }

    private static allStructuresHasSameDosageType(structures: StructuresWrapper): boolean {
        if (structures && structures.getStructures()) {
            for (let i = 0; i < structures.getStructures().length; i++) {
                let firstType: DosageType = DosageTypeCalculator144.calculateFromStructure(structures.getStructures()[i]);
                for (let j = i + 1; j < structures.getStructures().length; j++) {
                    if (firstType !== DosageTypeCalculator144.calculateFromStructure(structures.getStructures()[j])) {
                        return false;
                    }
                }
            }

            return true;
        }
    }

    private static calculateFromStructure(structure: StructureWrapper): DosageType {
        if (DosageTypeCalculator.isAccordingToNeed(structure)) {
            return DosageType.AccordingToNeed;
        }
        else if (structure.containsAccordingToNeedDose()) {
            return DosageType.Combined;
        }
        else {
            return DosageType.Fixed;
        }
    }
}