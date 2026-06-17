
export type CompactionPatterns =
    "SameDoseWeekly"              // Ugentlig dosering → 1 tablet onsdag, torsdag og lørdag hver uge
    | "OnlyDay1"                  //  Kun Index=1 (eller iterationInterval=1 ?) → udelad “Dag 1:”
    | "AllDosesEqualWithinDay"    //  Hvis alle doseringer inden for samme dag er ens, skrives dosering kun 1 gang: 1 tablet kl 8:00, kl 12:00 og kl 18:00
    | "SameDosageAllDays"         // Hvis alle doseringer på alle dage er ens, skrives dosering kun 1 gang: 1 tablet morgen og aften torsdag og søndag / Dag 2,4 og 7: 1 tablet / Dag 12-112: 1 tablet
    | "MmanSameDose"              // 1 stk morgen og 1 stk aften hver dag → 1 stk morgen og aften
    | "OnlyEveryXWeek"            // Uge 1 1 tablet onsdag, uge 2 ingen dosering → 1 tablet onsdag hver 2. uge
    | "IterationLongerThanPeriod" // Assume not iterated when iterationInterval > PeriodLength


export type EnabledCompactionPatterns = Partial<Record<CompactionPatterns, boolean>>;

export const defaultEnabledCompactionPatterns: EnabledCompactionPatterns = {
    SameDoseWeekly: true,
    OnlyDay1: true,
    AllDosesEqualWithinDay: true,
    SameDosageAllDays: true,
    MmanSameDose: true,
    OnlyEveryXWeek: true,
    IterationLongerThanPeriod: true
};