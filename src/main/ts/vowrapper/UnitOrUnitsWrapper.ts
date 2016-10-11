export class UnitOrUnitsWrapper {

    private unit: string;
    private unitSingular: string;
    private unitPlural: string;

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new UnitOrUnitsWrapper(jsonObject.unit, jsonObject.unitSingular, jsonObject.unitPlural)
            : undefined;
    }

    constructor(unit: string, unitSingular: string, unitPlural: string) {
        this.unit = unit;
        this.unitSingular = unitSingular;
        this.unitPlural = unitPlural;
    }

    public getUnit() {
        return this.unit;
    }

    public getUnitSingular() {
        return this.unitSingular;
    }

    public getUnitPlural() {
        return this.unitPlural;
    }
}
