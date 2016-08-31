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

    public get unit() {
        return this._unit;
    }

    public get unitSingular() {
        return this._unitSingular;
    }

    public get unitPlural() {
        return this._unitPlural;
    }
}