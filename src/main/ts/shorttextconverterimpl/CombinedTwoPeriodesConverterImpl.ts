import { ShortTextConverterImpl } from "./ShortTextConverterImpl";
import { ShortTextConverter } from "../ShortTextConverter";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DayWrapper } from "../vowrapper/DayWrapper";
import { StructuresWrapper } from "../vowrapper/StructuresWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";

export class CombinedTwoPeriodesConverterImpl extends ShortTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {

        if (dosage.structures === undefined)
            return false;
        if (dosage.structures.getStructures().length !== 2)
            return false;

        // Structure 0
        let structure0: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure0.getIterationInterval() !== 0)
            return false;
        if (structure0.containsAccordingToNeedDose())
            return false;

        let tempDosage: DosageWrapper = new DosageWrapper(undefined, undefined,
            new StructuresWrapper(
                dosage.structures.getUnitOrUnits(),
                [structure0]));
        if (!ShortTextConverter.getInstance().canConvert(tempDosage))
            return false;

        // Structure 1
        let structureLast: StructureWrapper = dosage.structures.getStructures()[dosage.structures.getStructures().length - 1];
        if (structureLast.containsAccordingToNeedDose())
            return false;

        let fixedDosage: DosageWrapper = new DosageWrapper(undefined, undefined,
            new StructuresWrapper(
                dosage.structures.getUnitOrUnits(),
                [structureLast]));
        if (!ShortTextConverter.getInstance().canConvert(fixedDosage))
            return false;

        return true;
    }

    public doConvert(dosage: DosageWrapper): string {

        let tempStructure: StructureWrapper = dosage.structures.getStructures()[0];
        let tempDosage: DosageWrapper = new DosageWrapper(undefined, undefined,
            new StructuresWrapper(
                dosage.structures.getUnitOrUnits(),
                [tempStructure]));
        let tempText: String = new ShortTextConverter().convertWrapper(tempDosage, 10000); // 10000 to avoid anything longer than 70 chars being cut
        
        if(!tempText) {
            return null;
        }
        
        let fixedStructure: StructureWrapper = dosage.structures.getStructures()[dosage.structures.getStructures().length - 1];
        let fixedDosage: DosageWrapper = new DosageWrapper(undefined, undefined,
            new StructuresWrapper(
                dosage.structures.getUnitOrUnits(),
                [fixedStructure]));
        let fixedText: string = new ShortTextConverter().convertWrapper(fixedDosage, 10000); // 10000 to avoid anything longer than 70 chars being cut

        let days = tempStructure.getDays()[tempStructure.getDays().length - 1].getDayNumber();
        if (days === 1) {
            return "første dag " + tempText + ", herefter " + fixedText;
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
                return tempText + ", herefter " + fixedText;
            else
                return tempText + tempTail + ", herefter " + fixedText;
        }
    }
}
