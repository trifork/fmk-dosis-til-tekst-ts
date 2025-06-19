import { Structure } from "../dto/Dosage";
import { DateOrDateTimeHelper } from "./DateOrDateTimeHelper";
import { StructureHelper } from "./StructureHelper";

export class StructuresHelper {

    public static dosagePeriodSorter(s1: Structure, s2: Structure): number {
        const startDate1 = DateOrDateTimeHelper.getDate(s1.startDate);
        const startDate2 = DateOrDateTimeHelper.getDate(s2.startDate);

        const i = startDate1.getTime() - startDate2.getTime();
        if (i !== 0)
            return i;
        if (StructureHelper.containsAccordingToNeedDosesOnly(s1))
            return 1;

        else
            return -1;
    }

}