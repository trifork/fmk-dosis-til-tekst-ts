export class UnitOrUnitsWrapper {

    private _unit: string;
    private _unitSingular: string;
    private _unitPlural: string;

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new UnitOrUnitsWrapper(jsonObject.unit, jsonObject.unitSingular, jsonObject.unitPlural)
            : undefined;
    }

    constructor(unit: string, unitSingular: string, unitPlural: string) {
        this._unit = unit;
        this._unitSingular = unitSingular;
        this._unitPlural = unitPlural;
    }

    public getUnit() {
        return this._unit;
    }

    public getUnitSingular() {
        return this._unitSingular;
    }

    public getUnitPlural() {
        return this._unitPlural;
    }
}
