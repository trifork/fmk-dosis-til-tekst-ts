import { UnitOrUnitsWrapper } from "./UnitOrUnitsWrapper";
import { StructureWrapper } from "./StructureWrapper";
import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";
import { Structures } from "../dto/Dosage";

export class StructuresWrapper {

    readonly value: Structures;

    constructor(unitOrUnits: UnitOrUnitsWrapper, startDateOrDateTime: DateOrDateTimeWrapper | undefined | null, endDateOrDateTime: DateOrDateTimeWrapper | undefined | null, structures: StructureWrapper[], isPartOfMultiPeriodDosage: boolean) {
        this.value = {
            unitOrUnits: unitOrUnits.value,
            startDate: startDateOrDateTime?.value,
            endDate: endDateOrDateTime?.value,
            structures: structures.map(s => s.value),
            isPartOfMultiPeriodDosage
        };
    }
}
