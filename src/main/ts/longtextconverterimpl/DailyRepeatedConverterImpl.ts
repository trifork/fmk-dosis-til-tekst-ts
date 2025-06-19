import { LongTextConverterImpl } from "./LongTextConverterImpl";
import { TextHelper } from "../TextHelper";
import { TextOptions } from "../TextOptions";
import { DateOnly, Dosage, Dose, Structure, UnitOrUnits } from "../dto/Dosage";
import { StructureHelper } from "../helpers/StructureHelper";
import { DoseHelper } from "../helpers/DoseHelper";
import { DateOrDateTimeHelper } from "../helpers/DateOrDateTimeHelper";
import { DayHelper } from "../helpers/DayHelper";

export class DailyRepeatedConverterImpl extends LongTextConverterImpl {

    public getConverterClassName(): string {
        return "DailyRepeatedConverterImpl";
    }

    public canConvert(dosage: Dosage, options: TextOptions): boolean {
        if (!dosage.structures)
            return false;
        if (dosage.structures.structures.length !== 1)
            return false;
        const structure = dosage.structures.structures[0];
        if (structure.iterationInterval !== 1)
            return false;
        if (DateOrDateTimeHelper.isEqualTo(structure.startDate, structure.endDate))
            return false;
        if (structure.days.length !== 1)
            return false;
        if (structure.days[0].dayNumber !== 1)
            return false;
        return true;
    }


    public doConvert(dosage: Dosage, options: TextOptions, currentTime: Date): string {
        return this.convert(dosage.structures.unitOrUnits, dosage.structures.structures[0], options);
    }

    public convert(unitOrUnits: UnitOrUnits, structure: Structure, options: TextOptions): string {
        let s = "";
        s += this.getDosageStartText(structure.startDate, structure.iterationInterval, options);

        if (structure.endDate) {
            s += this.getDosageEndText(structure, options);
        }
        s += ":\n";

        const day = StructureHelper.getDay(structure, 1);

        if (day.allDoses.length === 1 && DayHelper.containsMorningNoonEveningNightDoses(day)) {
            s += this.makeOneIteratedDose(day.allDoses[0], unitOrUnits, 1, structure.startDate);
        }
        else {
            s += this.getDaysText(unitOrUnits, structure, options);
        }


        s = this.appendSupplText(structure, s, options);
        return s;
    }

    // ex.: 1 tablet hver aften (uden denne metode ville teksten blive: 1 tablet aften - hver dag)
    protected makeOneIteratedDose(dose: Dose, unitOrUnits: UnitOrUnits, dayNumber: number, startDate: DateOnly): string {

        let s = DoseHelper.getAnyDoseQuantityString(dose);
        s += " " + TextHelper.getUnit(dose, unitOrUnits) + " hver";

        if (DoseHelper.getLabel(dose).length > 0) {
            s += " " + DoseHelper.getLabel(dose);
        }
        if (dose.isAccordingToNeed) {
            s += " efter behov";
        }
        return s;
    }

}
