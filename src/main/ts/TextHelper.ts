import { DateOrDateTime, Day, Dose, UnitOrUnits } from "./dto/Dosage";
import { DateOrDateTimeHelper } from "./helpers/DateOrDateTimeHelper";
import { DayOfWeek } from "./DayOfWeek";

declare function log(msg: string): void;

export class TextHelper {

    public static VERSION: string = "2014-02-10";
    public static INDENT = ""; // "   "; Indentation disabled for now (CHJ 22.01.2020 - keeping comment for now)

    //    private static final FastDateFormat longDateTimeFormatter = FastDateFormat.getInstance(LONG_DATE_TIME_FORMAT, new Locale("da", "DK"));
    //    private static final FastDateFormat longDateTimeFormatterNoSecs = FastDateFormat.getInstance(LONG_DATE_TIME_FORMAT_NO_SECS, new Locale("da", "DK"));
    //    private static final FastDateFormat longDateFormatter = FastDateFormat.getInstance(LONG_DATE_FORMAT, new Locale("da", "DK"));

    private static _unit: string[][] = [
        ["ampul", "ampuller"],
        ["applikatordosis", "applikatordoser"],
        ["beholder", "beholdere"],
        ["behandling", "behandlinger"],
        ["brev", "breve"],
        ["brusetablet", "brusetabletter"],
        ["bukkalfilm", "bukkalfilm"],
        ["doseringssprøjte", "doseringssprøjter"],
        ["dosis", "doser"],
        ["dråbe", "dråber"],
        ["engangspen", "engangspenne"],
        ["engangssprøjte", "engangssprøjter"],
        ["enkeltdosisbeholder", "enkeltdosisbeholdere"],
        ["hætteglas", "hætteglas"],
        ["hætteglas+brev", "hætteglas+breve"],
        ["IE", "IE"],
        ["implantat", "implantater"],
        ["indgnidning", "indgnidninger"],
        ["indsprøjtning", "indsprøjtninger"],
        ["inhalationskapsel", "inhalationskapsler"],
        ["injektionssprøjte", "injektionssprøjter"],
        ["injektor", "injektorer"],
        ["kapsel", "kapsler"],
        ["kapsel med inhalationspulver", "kapsler med inhalationspulver"],
        ["L", "L"],
        ["liter", "liter"],
        ["mg", "mg"],
        ["ml", "ml"],
        ["måleske", "måleskeer"],
        ["oral sprøjte", "orale sprøjter"],
        ["pensling", "penslinger"],
        ["plaster", "plastre"],
        ["plastflaske", "plastflasker"],
        ["pudring", "pudringer"],
        ["pulver+solvens", "pulver+solvens"],
        ["pump", "pump"],
        ["pust", "pust"],
        ["påsmøring", "påsmøringer"],
        ["rektal stikpille", "rektale stikpiller"],
        ["rektalsprøjte", "rektalsprøjte"],
        ["rektaltube", "rektaltuber"],
        ["resoriblet", "resoribletter"],
        ["skylning", "skylninger"],
        ["spiral", "spiraler"],
        ["streg", "streger"],
        ["stribe", "striber"],
        ["strømpe", "strømper"],
        ["sug", "sug"],
        ["sugetablet", "sugetabletter"],
        ["sæt breve A+B", "sæt breve A+B"],
        ["tablet", "tabletter"],
        ["tablet+opløsningsvæske", "tabletter+opløsningsvæsker"],
        ["tablet til rektal anvendelse", "tabletter til rektal anvendelse"],
        ["tryk", "tryk"],
        ["tube", "tuber"],
        ["tubule", "tubuler"],
        ["tyggegummi", "tyggegummier"],
        ["tyggetabletter", "tyggetabletter"],
        ["tykt lag", "tykke lag"],
        ["tyndt lag", "tynde lag"],
        ["vaginalindlæg", "vaginalindlæg"],
        ["vaginalkapsel", "vaginalkapsler"],
        ["vaginaltablet", "vaginaltabletter"],
        ["vagitorie", "vagitorier"],
        ["vask", "vaske"],
        ["øjenlamel", "øjenlamel"],
        ["øjenskylning", "øjenskylninger"],
    ];

    public static formatQuantity(quantity: number): string {
        // We replace . with , below using string replace as we want to make
        // sure we always use , no matter what the locale settings are
        return TextHelper.trim(quantity.toString().replace(".", ","));
    }

    public static gange(num: number): String {
        if (num === undefined || Math.floor(num) > 1)
            return "gange";
        else
            return "gang";
    }

    public static trim(numberStr: string): string {
        if (numberStr.indexOf(".") < 0 && numberStr.indexOf(",") < 0)
            return numberStr;
        if (numberStr.length === 1 || numberStr.charAt(numberStr.length - 1) > "0")
            return numberStr;
        else
            return TextHelper.trim(numberStr.substring(0, numberStr.length - 1));
    }

    public static formatDate(date: Date): string {
        return date.toISOString().substr(0, 10);
    }

    public static unitToSingular(plural: string): string {
        let singular = TextHelper._unit.filter(u => u[1] === plural).map(u => u[0]);
        if (singular && singular.length > 0) {
            return singular[0];
        }

        return plural;
    }

    public static unitToPlural(singular: string): string {
        let plural = TextHelper._unit.filter(u => u[0] === singular);
        if (plural && plural.length > 0) {
            return plural[0][1];
        }

        return singular;
    }

    public static getUnit(dose: Dose, unitOrUnits: UnitOrUnits): string {
        if (!unitOrUnits) return "";

        if (unitOrUnits.unit)
            return TextHelper.correctUnit(dose, unitOrUnits.unit);
        else if (unitOrUnits.unitSingular && unitOrUnits.unitPlural)
            return TextHelper.chooseUnit(dose, unitOrUnits.unitSingular, unitOrUnits.unitPlural);
        else
            return "";
    }

    public static getUnitFromDoseNumber(dose: number, unitOrUnits: UnitOrUnits): string {
        if (unitOrUnits.unit)
            return TextHelper.correctUnitForDoseNumber(dose, unitOrUnits.unit);
        else if (unitOrUnits.unitSingular && unitOrUnits.unitPlural)
            return TextHelper.chooseUnitForDoseNumber(dose, unitOrUnits.unitSingular, unitOrUnits.unitPlural);
        else
            return "";
    }

    private static correctUnit(dose: Dose, unit: string): string {
        if (TextHelper.hasPluralUnit(dose))
            return TextHelper.unitToPlural(unit);
        else
            return TextHelper.unitToSingular(unit);
    }

    private static correctUnitForDoseNumber(dose: number, unit: string): string {
        if (TextHelper.hasPluralUnitForNumber(dose))
            return TextHelper.unitToPlural(unit);
        else
            return TextHelper.unitToSingular(unit);
    }

    private static chooseUnit(dose: Dose, unitSingular: string, unitPlural: string): string {
        if (TextHelper.hasPluralUnit(dose))
            return unitPlural;
        else
            return unitSingular;
    }

    private static chooseUnitForDoseNumber(dose: number, unitSingular: string, unitPlural: string): string {
        if (TextHelper.hasPluralUnitForNumber(dose))
            return unitPlural;
        else
            return unitSingular;
    }

    private static hasPluralUnit(dose: Dose): boolean {
        if (typeof dose.doseQuantity === "number") {
            return dose.doseQuantity > 1.0 || dose.doseQuantity < 0.000000001;
        }
        else if (typeof dose.maximalDoseQuantity === "number") {
            return dose.maximalDoseQuantity > 1.0 || dose.maximalDoseQuantity < 0.000000001;
        }
        else {
            return false;
        }
    }

    private static hasPluralUnitForNumber(dose: number): boolean {
        if (dose) {
            return dose > 1.0 || dose < 0.000000001;
        }
        else {
            return false;
        }
    }

    private static weekdays: string[] = [
        "søndag",
        "mandag",
        "tirsdag",
        "onsdag",
        "torsdag",
        "fredag",
        "lørdag"
    ];

    private static weekdaysUppercase: string[] = [
        "Søndag",
        "Mandag",
        "Tirsdag",
        "Onsdag",
        "Torsdag",
        "Fredag",
        "Lørdag"
    ];

    private static months: string[] = [
        "januar",
        "februar",
        "marts",
        "april",
        "maj",
        "juni",
        "juli",
        "august",
        "september",
        "oktober",
        "november",
        "december"
    ];

    private static abbrevMonths: string[] = [
        "jan.",
        "feb.",
        "mar.",
        "apr.",
        "maj",
        "juni",
        "juli",
        "aug.",
        "sep.",
        "okt.",
        "nov.",
        "dec."
    ];

    public static getWeekday(dayNumber: number): string {
        return TextHelper.weekdays[dayNumber];
    }

    public static getWeekdayUppercase(dayNumber: number): string {
        return TextHelper.weekdaysUppercase[dayNumber];
    }

    public static makeDayString(dayNumber: number): string {
        return "Dag " + dayNumber + ": ";
    }

    public static makeFromDateOnly(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    }

    public static formatLongDateAbbrevMonth(date: Date): string {
        return date.getDate() + ". " + TextHelper.abbrevMonths[date.getMonth()] + " " + date.getFullYear();
    }

    public static makeDateString(startDateOrDateTime: DateOrDateTime, dayNumber: number): string {
        let d = TextHelper.makeFromDateOnly(DateOrDateTimeHelper.getDateOrDateTime(startDateOrDateTime));
        d.setDate(d.getDate() + dayNumber - 1);
        let dateString = TextHelper.formatLongDateAbbrevMonth(d);
        return dateString.charAt(0).toUpperCase() + dateString.substr(1);
    }

    public static formatLongDateTime(dateTime: Date): string {
        // "EEEEEEE "den" d"." MMMMMMM yyyy "kl." HH:mm:ss";
        return TextHelper.formatLongDateAbbrevMonth(dateTime) + " kl. " + dateTime.getHours() + ":" + TextHelper.pad(dateTime.getMinutes(), 2) + ":" + TextHelper.pad(dateTime.getSeconds(), 2);
    }

    public static formatLongDateNoSecs(dateTime: Date): string {
        let dateTimeString = TextHelper.formatLongDateTime(dateTime);
        return dateTimeString.substr(0, dateTimeString.length - 3);
    }

    public static pad(n: number, length: number): string {
        let s = String(n);
        while (s.length < (length || 2)) { s = "0" + s; }
        return s;
    }

    public static formatYYYYMMDD(d: Date): string {
        return TextHelper.pad(d.getFullYear(), 4) + "-" + TextHelper.pad(d.getMonth() + 1, 2) + "-" + TextHelper.pad(d.getDate(), 2);
    }

    public static makeDayOfWeekAndName(startDateOrDateTime: DateOrDateTime, day: Day, initialUpperCase: boolean): DayOfWeek {
        let dateOnly = TextHelper.makeFromDateOnly(DateOrDateTimeHelper.getDateOrDateTime(startDateOrDateTime));
        dateOnly.setDate(dateOnly.getDate() + day.dayNumber - 1);

        let dayString = TextHelper.weekdays[dateOnly.getDay()];
        let name: string;
        if (initialUpperCase)
            name = dayString.charAt(0).toUpperCase() + dayString.substring(1);
        else
            name = dayString;
        return { dayOfWeek: dateOnly.getDay(), name, day };

    }

    public static addShortSupplText(supplText: string): string {
        return ".\nBemærk: " + supplText;
    }

    public static strStartsWith(str: string, prefix: string): boolean {
        return str.indexOf(prefix) === 0;
    }

    public static strEndsWith(str: string, suffix: string): boolean {
        return str.lastIndexOf(suffix) === str.length - suffix.length;
    }
}
