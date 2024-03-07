import { UnitOrUnits } from "../dto/Dosage";

export class UnitOrUnitsWrapper {

    readonly value: UnitOrUnits;

    constructor(unit: string, unitSingular: string, unitPlural: string) {
        this.value = {
            unit,
            unitSingular,
            unitPlural
        }
    }
}
