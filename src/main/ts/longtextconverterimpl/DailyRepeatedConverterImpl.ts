import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { DosageWrapper } from "../vowrapper/DosageWrapper";
import { StructureWrapper } from "../vowrapper/StructureWrapper";
import { TextHelper } from "../TextHelper";
import { UnitOrUnitsWrapper } from "../vowrapper/UnitOrUnitsWrapper";
import { DoseWrapper } from "../vowrapper/DoseWrapper";
import { DateOrDateTimeWrapper } from "../vowrapper/DateOrDateTimeWrapper";

export class DailyRepeatedConverterImpl extends LongTextConverterImpl {

    public canConvert(dosage: DosageWrapper): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.getStructures().length !== 1)
            return false;
        let structure: StructureWrapper = dosage.structures.getStructures()[0];
        if (structure.getIterationInterval() !== 1)
            return false;
        if (structure.getStartDateOrDateTime().isEqualTo(structure.getEndDateOrDateTime()))
            return false;
        if (structure.getDays().length !== 1)
            return false;
        if (structure.getDays()[0].getDayNumber() !== 1)
            return false;
        return true;
    }


    public doConvert(dosage: DosageWrapper): string {
        return this.convert(dosage.structures.getUnitOrUnits(), dosage.structures.getStructures()[0]);
    }

    public convert(unitOrUnits: UnitOrUnitsWrapper, structure: StructureWrapper): string {
        let s = "";
        s += this.getDosageStartText(structure.getStartDateOrDateTime(), structure.getIterationInterval());

        if (structure.getEndDateOrDateTime() && structure.getEndDateOrDateTime().getDateOrDateTime()) {
            s += this.getDosageEndText(structure);
        }
        s += ":\n";

        if (structure.getDay(1).getAllDoses().length === 1 && structure.getDay(1).containsMorningNoonEveningNightDoses()) {
            s += this.makeOneIteratedDose(structure.getDay(1).getDose(0), unitOrUnits, 1, structure.getStartDateOrDateTime());
        }
        else {
            s += this.getDaysText(unitOrUnits, structure);
        }


        s = this.appendSupplText(structure, s);
        return s;
    }

    // ex.: 1 tablet hver aften (uden denne metode ville teksten blive: 1 tablet aften - hver dag)
    protected makeOneIteratedDose(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper, dayNumber: number, startDateOrDateTime: DateOrDateTimeWrapper): string {

        let s = dose.getAnyDoseQuantityString();
        s += " " + TextHelper.getUnit(dose, unitOrUnits) + " hver";

        if (dose.getLabel().length > 0) {
            s += " " + dose.getLabel();
        }
        if (dose.getIsAccordingToNeed()) {
            s += " efter behov";
        }
        return s;
    }

}
