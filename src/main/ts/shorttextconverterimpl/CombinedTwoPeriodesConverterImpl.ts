import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { ShortTextConverter } from "../ShortTextConverter";
import { TextHelper } from "../TextHelper";
import { Dosage, Structure } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";

export class CombinedTwoPeriodesConverterImpl extends ShortTextConverterImpl {

    public getConverterClassName(): string {
        return "CombinedTwoPeriodesConverterImpl";
    }

    public canConvert(dosage: Dosage): boolean {

        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 2)
            return false;

        // Structure 0
        const structure0: Structure = dosage.structures.structures[0];
        if (structure0.iterationInterval !== 0 && !StructureHelper.isIterationToLong(structure0))
            return false;
        if (StructureHelper.containsAccordingToNeedDose(structure0))
            return false;

        // If last daynumber is 1, start and end must match
        const tempStructure: Structure = dosage.structures.structures[0];
        if (tempStructure.days.length === 0) {
            return false;
        }

        const dayNo = tempStructure.days[tempStructure.days.length - 1].dayNumber;

        if (dayNo === 1 && !StructureHelper.startsAndEndsSameDay(structure0)) {
            return false;
        }

        const tempDosage: Dosage = {
            structures: {
                startDate: undefined,
                endDate: undefined,
                unitOrUnits: dosage.structures.unitOrUnits,
                structures: [structure0],
                isPartOfMultiPeriodDosage: false
            }
        };

        if (!ShortTextConverter.getInstance().canConvert(tempDosage))
            return false;

        // Structure 1
        const structureLast: Structure = dosage.structures.structures[dosage.structures.structures.length - 1];
        if (StructureHelper.containsAccordingToNeedDose(structureLast))
            return false;

        const fixedDosage: Dosage = {
            structures: {
                startDate: dosage.structures.startDate,
                endDate: dosage.structures.endDate,
                unitOrUnits: dosage.structures.unitOrUnits,
                structures: [structureLast],
                isPartOfMultiPeriodDosage: true
            }
        };

        if (!ShortTextConverter.getInstance().canConvert(fixedDosage))
            return false;

        return true;
    }

    public doConvert(dosage: Dosage): string {

        const tempStructure: Structure = dosage.structures.structures[0];
        const tempSupplText: string = tempStructure.supplText;
        tempStructure.supplText = null;
        const tempDosage: Dosage = {
            structures: {
                startDate: dosage.structures.startDate,
                endDate: dosage.structures.endDate,
                unitOrUnits: dosage.structures.unitOrUnits,
                structures: [tempStructure],
                isPartOfMultiPeriodDosage: true
            }
        };
        const tempText: string = new ShortTextConverter().convert(tempDosage, undefined, 10000); // 10000 to avoid anything longer than 70 chars being cut
        tempStructure.supplText = tempSupplText;

        if (!tempText) {
            return null;
        }

        const fixedStructure: Structure = dosage.structures.structures[dosage.structures.structures.length - 1];
        const fixedSupplText: string = fixedStructure.supplText;
        fixedStructure.supplText = null;
        const fixedDosage: Dosage = {
            structures: {
                startDate: dosage.structures.startDate,
                endDate: dosage.structures.endDate,
                unitOrUnits: dosage.structures.unitOrUnits,
                structures: [fixedStructure],
                isPartOfMultiPeriodDosage: true
            }
        };

        const fixedText: string = new ShortTextConverter().convert(fixedDosage, undefined, 10000); // 10000 to avoid anything longer than 70 chars being cut
        fixedStructure.supplText = fixedSupplText;

        let supplText: string = "";
        if (tempStructure.supplText)
            supplText += TextHelper.addShortSupplText(tempStructure.supplText);
        if (fixedStructure.supplText && tempStructure.supplText !== fixedStructure.supplText)
            supplText += TextHelper.addShortSupplText(fixedStructure.supplText);

        const days = tempStructure.days[tempStructure.days.length - 1].dayNumber;
        if (days === 1) {
            return "Første dag " + tempText + ", herefter " + fixedText + supplText;
        }
        else {
            let tempTail = undefined;
            if (days === 7)
                tempTail = " i 1 uge";
            else if (days % 7 === 0)
                tempTail = " i " + (days / 7) + " uger";
            else
                tempTail = " i " + days + " dage";

            if (tempTail && tempText.indexOf(tempTail) > 0)
                return tempText + ", herefter " + fixedText + supplText;
            else
                return tempText + tempTail + ", herefter " + fixedText + supplText;
        }
    }
}
