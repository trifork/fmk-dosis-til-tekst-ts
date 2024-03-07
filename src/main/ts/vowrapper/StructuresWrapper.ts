import { UnitOrUnitsWrapper } from "./UnitOrUnitsWrapper";
import { StructureWrapper } from "./StructureWrapper";
import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";
import { Structures } from "../dto/Dosage";

export class StructuresWrapper {

    readonly value: Structures;

    constructor(unitOrUnits: UnitOrUnitsWrapper, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, structures: StructureWrapper[], isPartOfMultiPeriodDosage: boolean) {
        this.value = {
            unitOrUnits: unitOrUnits.value,
            startDateOrDateTime: startDateOrDateTime && startDateOrDateTime.value,
            endDateOrDateTime: endDateOrDateTime && endDateOrDateTime.value,
            structures: structures.map(s => s.value),
            isPartOfMultiPeriodDosage
        };
    }
}
