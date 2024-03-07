import { DosageType } from "./DosageType";
import { DosageTypeCalculator } from "./DosageTypeCalculator";
import { Dosage, Structure, Structures } from "./dto/Dosage";
import { DateOrDateTimeHelper } from "./helpers/DateOrDateTimeHelper";
import { StructureHelper } from "./helpers/StructureHelper";
import { DosageWrapper } from "./vowrapper/DosageWrapper";


/***
 * From FMK 1.4.4 and above, only 3 dosage types are available: Fixed, AccordingToNeed and Combined (besides Unspec.).
 * Use this DosageTypeCalculator144 for all services using FMK 1.4.4 and higher, and use DosageTypeCalculator for FMK 1.4.2 and below
 *
 *
 */
export class DosageTypeCalculator144 {

    public static calculateStr(jsonStr: string) {
        return DosageTypeCalculator144.calculate(JSON.parse(jsonStr));
    }

    public static calculate(dosage: Dosage): DosageType {
        if (dosage.administrationAccordingToSchema)
            return DosageType.Unspecified;
        else if (dosage.freeText)
            return DosageType.Unspecified;
        else
            return DosageTypeCalculator144.calculateFromStructures(dosage.structures);
    }

    /**
    * @deprecated This method and the corresponding wrapper classes will be removed. Use calculate(dosage: Dosage, ...) instead.
    */
    public static calculateWrapper(dosage: DosageWrapper): DosageType {
        return DosageTypeCalculator144.calculate(dosage.value);
    }

    private static calculateFromStructures(structures: Structures): DosageType {
        if (DosageTypeCalculator144.hasAtLeastOneCombinedStructure(structures) || DosageTypeCalculator144.hasMixedNotEmptyStructures(structures)) {
            return DosageType.Combined;
        }
        else {
            /* Invariant at this point: all structures are a) fixed or empty .... or b) PN or empty
			 * The dosagetype is then found by finding the dosagetype of the first not-empty Structure
			 * If only empty structures are present, return fixed...just because */

            let fixedStructures: Structure[] = [];
            let pnStructures: Structure[] = [];

            DosageTypeCalculator144.splitInFixedAndPN(structures, fixedStructures, pnStructures);

            if (fixedStructures.length === 0) {
                return DosageType.AccordingToNeed;
            }
            else {
                return pnStructures.length === 0 ? DosageType.Fixed : DosageType.Combined;
            }
        }
    }

    public static structureSorter(s1: Structure, s2: Structure): number {
        return DateOrDateTimeHelper.getDateOrDateTime(s1.startDateOrDateTime).getTime() - DateOrDateTimeHelper.getDateOrDateTime(s2.startDateOrDateTime).getTime();
    }

    /*
	 * Precondition: all structures contains only fixed or pn doses
	 * In case some contained mixed, this method would never have been called, since we then know that the DosageType would be combined
	 */
    public static splitInFixedAndPN(structures: Structures, fixedStructures: Structure[], pnStructures: Structure[]) {

        let emptyStructures: Structure[] = [];

        structures.structures.forEach(s => {
            if (StructureHelper.isEmpty(s) || StructureHelper.containsEmptyDosagesOnly(s)) {
                emptyStructures.push(s);
            } else {
                if (StructureHelper.containsAccordingToNeedDosesOnly(s)) {
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

        let unhandledEmptyStructures: Structure[] = [];

        for (let i = 0; i < emptyStructures.length; i++) {
            let es: Structure = emptyStructures[i];
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
    public static abuts(first: Structure, second: Structure): boolean {
        if (first.endDateOrDateTime != null) {
            if (first.endDateOrDateTime.date
                && second.startDateOrDateTime.date
                && DosageTypeCalculator144.dateAbuts(new Date(first.endDateOrDateTime.date), new Date(second.startDateOrDateTime.date))) {
                return true;
            }
            else if (first.endDateOrDateTime.dateTime
                && second.startDateOrDateTime.dateTime
                && DosageTypeCalculator144.dateTimeAbuts(new Date(first.endDateOrDateTime.dateTime), new Date(second.startDateOrDateTime.dateTime))) {
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

    private static fillGapsWithEmptyPeriods(structures: Structure[], emptyStructures: Structure[]): void {
        let structuresSize: number = structures.length;
        for (let i = 0; i < structuresSize - 1; i++) {
            if (DosageTypeCalculator144.hasGap(structures[i], structures[i + 1])) {
                let indexOfemptyStructureFittingGap = DosageTypeCalculator144.findIndexOfEmptyStructuresThatFitsGap(emptyStructures, structures[i], structures[i + 1]);
                if (indexOfemptyStructureFittingGap > -1) {
                    let emptyStructureFittingGap: Structure = emptyStructures.splice(indexOfemptyStructureFittingGap, 1)[0];
                    structures.splice(i + 1, 0, emptyStructureFittingGap);
                    structuresSize++;
                }
            }
        }
    }

    private static findIndexOfEmptyStructuresThatFitsGap(emptyStructures: Structure[], structureWrapper1: Structure, structureWrapper2: Structure): number {
        for (let i = 0; i < emptyStructures.length; i++) {
            if (DosageTypeCalculator144.abuts(structureWrapper1, emptyStructures[i]) && DosageTypeCalculator144.abuts(emptyStructures[i], structureWrapper2)) {
                return i;
            }
        }

        return -1;
    }

    protected static hasGap(structureWrapper1: Structure, structureWrapper2: Structure): boolean {
        return !DosageTypeCalculator144.abuts(structureWrapper1, structureWrapper2);
    }

    private static firstNotEmptyStructure(structures: Structures): Structure {
        return structures.structures.filter(s => s.days.length > 0)[0];
    }

    /* Check if at least one not-empty Structure containing both fixed and PN Dose's exists */
    private static hasAtLeastOneCombinedStructure(structures: Structures): boolean {
        return structures.structures.some((structure, index, array) => StructureHelper.containsAccordingToNeedDose(structure) && !StructureHelper.containsAccordingToNeedDosesOnly(structure));
    }

    /* Check if at least one structure with fixed dose's only AND at least one structure with PN only doses exists
	 * Precondition: since this method is called after hasAtLeastOneCombinedStructure(),
	 * then we suggest that all Structures contains either fixed or PN doses, not combined inside one Structure
	 */
    private static hasMixedNotEmptyStructures(structures: Structures): boolean {
        if (structures && structures.structures) {

            let i = 0;

            let firstNotEmptyStructure: Structure;

            // Find first none-empty structure
            while (firstNotEmptyStructure === undefined && i < structures.structures.length) {
                let firstNotEmptyStructureCandidate: Structure = structures.structures[i];
                if (firstNotEmptyStructureCandidate.days.length > 0) {
                    firstNotEmptyStructure = firstNotEmptyStructureCandidate;
                }
                else {
                    i++;
                }
            }

            if (firstNotEmptyStructure != null) {
                let firstType: DosageType = DosageTypeCalculator144.calculateFromStructure(firstNotEmptyStructure);
                for (let j = i; j < structures.structures.length; j++) {
                    let structure: Structure = structures.structures[j];
                    if (structure.days.length > 0 && firstType !== DosageTypeCalculator144.calculateFromStructure(structure)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private static calculateFromStructure(structure: Structure): DosageType {
        if (DosageTypeCalculator.isAccordingToNeed(structure)) {
            return DosageType.AccordingToNeed;
        }
        else if (StructureHelper.containsAccordingToNeedDose(structure)) {
            return DosageType.Combined;
        }
        else {
            return DosageType.Fixed;
        }
    }
}
