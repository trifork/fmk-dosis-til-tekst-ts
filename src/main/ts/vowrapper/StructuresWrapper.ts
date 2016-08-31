import { UnitOrUnitsWrapper } from "./UnitOrUnitsWrapper";
import { StructureWrapper } from "./StructureWrapper";
import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";

export class StructuresWrapper {
    private _unitOrUnits: UnitOrUnitsWrapper;
    private _structures: StructureWrapper[];

    public static fromJsonObject(jsonObject: any) {
        return jsonObject ?
            new StructuresWrapper(UnitOrUnitsWrapper.fromJsonObject(jsonObject.unitOrUnits), jsonObject.structures.map(s => StructureWrapper.fromJsonObject(s)))
            : undefined;
    }

    constructor(unitOrUnits: UnitOrUnitsWrapper, structures: StructureWrapper[]) {
        this._unitOrUnits = unitOrUnits;
        structures.sort((s1, s2) => {
            let i = s1.startDateOrDateTime.getDateOrDateTime().getMilliseconds() - s2.startDateOrDateTime.getDateOrDateTime().getMilliseconds();
            if (i !== 0)
                return i;
            if (s1.containsAccordingToNeedDosesOnly())
                return 1;
            else
                return -1;
        });

        this._structures = structures;
    }

    public get unitOrUnits() {
        return this._unitOrUnits;
    }

    public get structures() {
        return this._structures;
    }

    public hasOverlappingPeriodes(): boolean {
        for (let i = 0; i < this.structures.length; i++) {
            for (let j = i + 1; j < this.structures.length; j++) {
                let dis = this.structures[i].startDateOrDateTime;
                let die = this.structures[i].endDateOrDateTime;
                let djs = this.structures[j].startDateOrDateTime;
                let dje = this.structures[j].endDateOrDateTime;
                if (this.overlaps(dis, die, djs, dje))
                    return true;
            }
        }
        return false;
    }

    private overlaps(dis: DateOrDateTimeWrapper, die: DateOrDateTimeWrapper, djs: DateOrDateTimeWrapper, dje: DateOrDateTimeWrapper): boolean {
        let cis = this.makeStart(dis);
        let cjs = this.makeStart(djs);
        if (cis.getTime() === cjs.getTime()) {
            return true;
        }
        let cie = this.makeEnd(die);
        let cje = this.makeEnd(dje);
        if (cis.getTime() < cjs.getTime()) {
            return cie.getTime() >= cje.getTime();
        }
        else {
            return cje.getTime() >= cie.getTime();
        }
    }

    private makeStart(ds: DateOrDateTimeWrapper): Date {
        let d: Date;
        if (ds && ds.dateTime) {
            d = new Date(ds.dateTime.getTime());
            d.setMilliseconds(0);
        }
        else if (ds && ds.date) {
            d = new Date(ds.date.getTime());
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
        }
        else {
            d = new Date(2000, 0, 1, 0, 0, 0);
        }
        return d;
    }

    private makeEnd(de: DateOrDateTimeWrapper): Date {
        let d: Date;

        if (de && de.dateTime) {
            d = new Date(de.dateTime.getTime());
            d.setMilliseconds(0);
        }
        else if (de && de.date) {
            d = new Date(de.date.getTime());
            d.setHours(0);
            d.setMinutes(0);
            d.setSeconds(0);
            d.setMilliseconds(0);
        }
        else {
            d = new Date(2999, 11, 31, 23, 59, 59, 0);
        }
        return d;
    }
}