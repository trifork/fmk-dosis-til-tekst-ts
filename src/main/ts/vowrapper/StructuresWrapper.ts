import { UnitOrUnitsWrapper } from "./UnitOrUnitsWrapper";
import { StructureWrapper } from "./StructureWrapper";
import { DateOrDateTimeWrapper } from "./DateOrDateTimeWrapper";

export class StructuresWrapper {
    private unitOrUnits: UnitOrUnitsWrapper;
    private startDateOrDateTime: DateOrDateTimeWrapper;
    private endDateOrDateTime: DateOrDateTimeWrapper;
    private structures: StructureWrapper[];
    private isPartOfMultiPeriodDosage: boolean;

    public static fromJsonObject(jsonObject: any) {
        const structures: StructureWrapper[] = jsonObject.structures.map(s => StructureWrapper.fromJsonObject(s));
        return jsonObject ?
            new StructuresWrapper(UnitOrUnitsWrapper.fromJsonObject(jsonObject.unitOrUnits), DateOrDateTimeWrapper.fromJsonObject(jsonObject.startDateOrDateTime), DateOrDateTimeWrapper.fromJsonObject(jsonObject.endDateOrDateTime), structures, structures.length > 1)
            : undefined;
    }

    constructor(unitOrUnits: UnitOrUnitsWrapper, startDateOrDateTime: DateOrDateTimeWrapper, endDateOrDateTime: DateOrDateTimeWrapper, structures: StructureWrapper[], isPartOfMultiPeriodDosage: boolean) {
        this.unitOrUnits = unitOrUnits;
        structures.sort((s1, s2) => {
            let i = s1.getStartDateOrDateTime().getDateOrDateTime().getTime() - s2.getStartDateOrDateTime().getDateOrDateTime().getTime();
            if (i !== 0)
                return i;
            if (s1.containsAccordingToNeedDosesOnly())
                return 1;
            else
                return -1;
        });

        this.structures = structures;
        this.startDateOrDateTime = startDateOrDateTime;
        this.endDateOrDateTime = endDateOrDateTime;
        this.isPartOfMultiPeriodDosage = isPartOfMultiPeriodDosage;
    }

    public getUnitOrUnits() {
        return this.unitOrUnits;
    }

    public getStartDateOrDateTime(): DateOrDateTimeWrapper {
        return this.startDateOrDateTime;
    }

    public getEndDateOrDateTime(): DateOrDateTimeWrapper {
        return this.endDateOrDateTime;
    }

    public getStructures(): StructureWrapper[] {
        return this.structures;
    }

    public getIsPartOfMultiPeriodDosage(): boolean {
        return this.isPartOfMultiPeriodDosage;
    }

    public hasOverlappingPeriodes(): boolean {
        for (let i = 0; i < this.getStructures().length; i++) {
            for (let j = i + 1; j < this.getStructures().length; j++) {
                let dis = this.getStructures()[i].getStartDateOrDateTime();
                let die = this.getStructures()[i].getEndDateOrDateTime();
                let djs = this.getStructures()[j].getStartDateOrDateTime();
                let dje = this.getStructures()[j].getEndDateOrDateTime();
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
        if (ds && ds.getDateTime()) {
            d = new Date(ds.getDateTime().getTime());
            d.setMilliseconds(0);
        }
        else if (ds && ds.getDate()) {
            d = new Date(ds.getDate().getTime());
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

        if (de && de.getDateTime()) {
            d = new Date(de.getDateTime().getTime());
            d.setMilliseconds(0);
        }
        else if (de && de.getDate()) {
            d = new Date(de.getDate().getTime());
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
