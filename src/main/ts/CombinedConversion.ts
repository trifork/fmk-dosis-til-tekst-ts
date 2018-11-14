import { DailyDosis } from "./DailyDosis";

export class CombinedConversion {

    private combinedShortText: string;
    private combinedLongText: string;
    private combinedDailyDosis: DailyDosis;
    private periodTexts: Array<[string, string, DailyDosis]>;


    public constructor(combinedShortText: string, combinedLongText: string, combinedDailyDosis: DailyDosis, periodTexts: Array<[string, string, DailyDosis]>) {
        this.combinedShortText = combinedShortText;
        this.combinedLongText = combinedLongText;
        this.combinedDailyDosis = combinedDailyDosis;
        this.periodTexts = periodTexts;
    }

    public getCombinedShortText(): string {
        return this.combinedShortText;
    }

    public getCombinedLongText(): string {
        return this.combinedLongText;
    }

    public getCombinedDailyDosis(): DailyDosis {
        return this.combinedDailyDosis;
    }

    public getPeriodTexts(): Array<[string, string, DailyDosis]> {
        return this.periodTexts;
    }
}
