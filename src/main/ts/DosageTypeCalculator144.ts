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
        if (DosageTypeCalculator144.hasAtLeastOneCombinedStructure(structures) || DosageTypeCalculator144.hasMixedNotEmptyStructures(structures)) {
            return DosageType.Combined;
        }
        else {
            /* Invariant at this point: all structures are a) fixed or empty .... or b) PN or empty
			 * The dosagetype is then found by finding the dosagetype of the first not-empty Structure
			 * If only empty structures are present, return fixed...just because */

            let fixedStructures: StructureWrapper[] = [];
            let pnStructures: StructureWrapper[] = [];

            DosageTypeCalculator144.splitInFixedAndPN(structures, fixedStructures, pnStructures);

            if (fixedStructures.length === 0) {
                return DosageType.AccordingToNeed;
            }
            else {
                return pnStructures.length === 0 ? DosageType.Fixed : DosageType.Combined;
            }
        }
    }

    public static structureSorter(s1: StructureWrapper, s2: StructureWrapper): number {
        return s1.getStartDateOrDateTime().getDateOrDateTime().getTime() - s2.getStartDateOrDateTime().getDateOrDateTime().getTime();
    }

    /*
	 * Precondition: all structures contains only fixed or pn doses
	 * In case some contained mixed, this method would never have been called, since we then know that the DosageType would be combined
	 */
    public static splitInFixedAndPN(structures: StructuresWrapper, fixedStructures: StructureWrapper[], pnStructures: StructureWrapper[]) {

        let emptyStructures: StructureWrapper[] = [];

        structures.getStructures().forEach(s => {
            if (s.isEmpty() || s.containsEmptyDosagesOnly()) {
                emptyStructures.push(s);
            }
            else {
                if (s.containsAccordingToNeedDosesOnly()) {
                    pnStructures.push(s);
                }
                else {
                    fixedStructures.push(s);
                }
            }
        });

        fixedStructures.sort(DosageTypeCalculator144.structureSorter);
        pnStructures.sort(DosageTypeCalculator144.structureSorter);
        emptyStructures.sort(DosageTypeCalculator144.structureSorter);

        /* Find all gaps in the fixed and pn structures, and insert fitting emptystructures in the gaps
		 * We know that some should fit, since it is validated in the DosageStructureValidator, that no gaps are present.
		 */
        DosageTypeCalculator144.fillGapsWithEmptyPeriods(fixedStructures, emptyStructures);
        DosageTypeCalculator144.fillGapsWithEmptyPeriods(pnStructures, emptyStructures);

        /* in case any emptystructures are left, they should be placed either at the beginning or end of either the fixed or the pn structures */

        let unhandledEmptyStructures: StructureWrapper[] = [];

        for (let i = 0; i < emptyStructures.length; i++) {
            let es: StructureWrapper = emptyStructures[i];
            let handled: boolean = false;

            if (fixedStructures.length > 0) {
                if (DosageTypeCalculator144.abuts(es, fixedStructures[0])) {
                    fixedStructures.splice(0, 0, es);
                    handled = true;
                }
                else if (DosageTypeCalculator144.abuts(fixedStructures[fixedStructures.length - 1], es)) {
                    fixedStructures.push(es);
                    handled = true;
                }
            }

            if (!handled && pnStructures.length > 0) {
                if (DosageTypeCalculator144.abuts(es, pnStructures[0])) {
                    pnStructures.splice(0, 0, es);
                    handled = true;
                }
                else if (DosageTypeCalculator144.abuts(pnStructures[pnStructures.length - 1], es)) {
                    pnStructures.push(es);
                    handled = true;
                }
            }

            if (!handled) {
                unhandledEmptyStructures.push(es);
            }
        }

        /* In case there are still unhandled empy structures, and either fixed or pn-structures are completely empty, they should go there */
        let noFixedStructures: boolean = fixedStructures.length === 0;
        let noPNStructures: boolean = pnStructures.length === 0;

        unhandledEmptyStructures.forEach(es => {
            if (noFixedStructures) {
                fixedStructures.push(es);
            }
            else if (noPNStructures) {
                pnStructures.push(es);
            }
        });
    }

    /* Check if second wrapper comes just after the first, without gaps or overlaps */
    public static abuts(first: StructureWrapper, second: StructureWrapper): boolean {
        if (first.getEndDateOrDateTime() != null) {
            if (first.getEndDateOrDateTime().getDate() != null
                && second.getStartDateOrDateTime().getDate() != null
                && DosageTypeCalculator144.dateAbuts(first.getEndDateOrDateTime().getDate(), second.getStartDateOrDateTime().getDate())) {
                return true;
            }
            else if (first.getEndDateOrDateTime().getDateTime() != null
                && second.getStartDateOrDateTime().getDateTime() != null
                && DosageTypeCalculator144.dateTimeAbuts(first.getEndDateOrDateTime().getDateTime(), second.getStartDateOrDateTime().getDateTime())) {
                return true;
            }
            // If an interval ends with a date and the next ends with a datetime we cannot determine if they abut
        }

        // No end date, definitely not abut
        return false;
    }

    static treatAsUTC(date: Date): Date {
        let result: Date = new Date(date.valueOf());
        result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
        return result;
    }

    static daysBetween(startDate: Date, endDate: Date): number {
        let millisecondsPerDay = 24 * 60 * 60 * 1000;
        let d1 = DosageTypeCalculator144.treatAsUTC(endDate);
        let d2 = DosageTypeCalculator144.treatAsUTC(startDate);
        d1.setUTCHours(0);
        d2.setUTCHours(0);
        return (d1.valueOf() - d2.valueOf()) / millisecondsPerDay;
    }

    static secondsBetween(startDate: Date, endDate: Date): number {
        let millisecondsSecond = 1000;
        return (DosageTypeCalculator144.treatAsUTC(endDate).valueOf() - DosageTypeCalculator144.treatAsUTC(startDate).valueOf()) / millisecondsSecond;
    }

    public static dateTimeAbuts(dateTime1: Date, dateTime2: Date): boolean {
        let secondsBetween: number = DosageTypeCalculator144.secondsBetween(dateTime1, dateTime2);
        return secondsBetween >= 0 && secondsBetween <= 1;
    }

    public static dateAbuts(d1: Date, d2: Date): boolean {
        return DosageTypeCalculator144.daysBetween(d1, d2) === 1;
    }

    private static fillGapsWithEmptyPeriods(structures: StructureWrapper[], emptyStructures: StructureWrapper[]): void {
        let structuresSize: number = structures.length;
        for (let i = 0; i < structuresSize - 1; i++) {
            if (DosageTypeCalculator144.hasGap(structures[i], structures[i + 1])) {
                let indexOfemptyStructureFittingGap = DosageTypeCalculator144.findIndexOfEmptyStructuresThatFitsGap(emptyStructures, structures[i], structures[i + 1]);
                if (indexOfemptyStructureFittingGap > -1) {
                    let emptyStructureFittingGap: StructureWrapper = emptyStructures.splice(indexOfemptyStructureFittingGap, 1)[0];
                    structures.splice(i + 1, 0, emptyStructureFittingGap);
                    structuresSize++;
                }
            }
        }
    }

    private static findIndexOfEmptyStructuresThatFitsGap(emptyStructures: StructureWrapper[], structureWrapper1: StructureWrapper, structureWrapper2: StructureWrapper): number {
        for (let i = 0; i < emptyStructures.length; i++) {
            if (DosageTypeCalculator144.abuts(structureWrapper1, emptyStructures[i]) && DosageTypeCalculator144.abuts(emptyStructures[i], structureWrapper2)) {
                return i;
            }
        }

        return -1;
    }

    protected static hasGap(structureWrapper1: StructureWrapper, structureWrapper2: StructureWrapper): boolean {
        return !DosageTypeCalculator144.abuts(structureWrapper1, structureWrapper2);
    }

    private static firstNotEmptyStructure(structures: StructuresWrapper): StructureWrapper {
        return structures.getStructures().filter(s => s.getDays().length > 0)[0];
    }

    /* Check if at least one not-empty Structure containing both fixed and PN Dose's exists */
    private static hasAtLeastOneCombinedStructure(structures: StructuresWrapper): boolean {
        return structures.getStructures().some((structure, index, array) => structure.containsAccordingToNeedDose() && !structure.containsAccordingToNeedDosesOnly());
    }

    /* Check if at least one structure with fixed dose's only AND at least one structure with PN only doses exists
	 * Precondition: since this method is called after hasAtLeastOneCombinedStructure(),
	 * then we suggest that all Structures contains either fixed or PN doses, not combined inside one Structure
	 */
    private static hasMixedNotEmptyStructures(structures: StructuresWrapper): boolean {
        if (structures && structures.getStructures()) {

            let i = 0;

            let firstNotEmptyStructure: StructureWrapper;

            // Find first none-empty structure
            while (firstNotEmptyStructure === undefined && i < structures.getStructures().length) {
                let firstNotEmptyStructureCandidate: StructureWrapper = structures.getStructures()[i];
                if (firstNotEmptyStructureCandidate.getDays().length > 0) {
                    firstNotEmptyStructure = firstNotEmptyStructureCandidate;
                }
                else {
                    i++;
                }
            }

            if (firstNotEmptyStructure != null) {
                let firstType: DosageType = DosageTypeCalculator144.calculateFromStructure(firstNotEmptyStructure);
                for (let j = i; j < structures.getStructures().length; j++) {
                    let structure: StructureWrapper = structures.getStructures()[j];
                    if (structure.getDays().length > 0 && firstType !== DosageTypeCalculator144.calculateFromStructure(structure)) {
                        return true;
                    }
                }
            }
        }

        return false;
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
