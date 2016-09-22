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
        if (dosage.structures.structures.length !== 2)
            return false;

        // Structure 0
        let structure0: StructureWrapper = dosage.structures.structures[0];
        if (structure0.iterationInterval !== 0)
            return false;
        if (structure0.containsAccordingToNeedDose())
            return false;

        let tempStructure: StructureWrapper = dosage.structures.structures[0];
        let tempDosage: DosageWrapper = new DosageWrapper(undefined, undefined,
            new StructuresWrapper(
                dosage.structures.unitOrUnits,
                [tempStructure]));
        if (!ShortTextConverter.canConvert(tempDosage))
            return false;

        // Structure 1
        let structure1: StructureWrapper = dosage.structures.structures[dosage.structures.structures.length - 1];
        if (structure1.containsAccordingToNeedDose())
            return false;

        let fixedStructure: StructureWrapper = dosage.structures.structures[dosage.structures.structures.length - 1];
        let fixedDosage: DosageWrapper = new DosageWrapper(undefined, undefined,
            new StructuresWrapper(
                dosage.structures.unitOrUnits,
                [fixedStructure]));
        if (!ShortTextConverter.canConvert(fixedDosage))
            return false;

        return true;
    }

    public doConvert(dosage: DosageWrapper): string {

        let tempStructure: StructureWrapper = dosage.structures.structures[0];
        let tempDosage: DosageWrapper = new DosageWrapper(undefined, undefined,
            new StructuresWrapper(
                dosage.structures.unitOrUnits,
                [tempStructure]));
        let tempText: String = new ShortTextConverter().convertWrapper(tempDosage);

        let fixedStructure: StructureWrapper = dosage.structures.structures[dosage.structures.structures.length - 1];
        let fixedDosage: DosageWrapper = new DosageWrapper(undefined, undefined,
            new StructuresWrapper(
                dosage.structures.unitOrUnits,
                [fixedStructure]));
        let fixedText: string = new ShortTextConverter().convertWrapper(fixedDosage);

        let days = tempStructure.days[tempStructure.days.length - 1].dayNumber;
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
