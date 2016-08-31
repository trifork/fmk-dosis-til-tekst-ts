import { DoseWrapper } from "./vowrapper/DoseWrapper";
import { DateOrDateTimeWrapper } from "./vowrapper/DateOrDateTimeWrapper";
import { DayWrapper } from "./vowrapper/DayWrapper";
import { UnitOrUnitsWrapper } from "./vowrapper/UnitOrUnitsWrapper";
import { DayOfWeek } from "./vowrapper/DayOfWeek";

export class TextHelper {

    public static VERSION: string = "2014-02-10";
    public static INDENT = "   ";

    //    private static final FastDateFormat longDateTimeFormatter = FastDateFormat.getInstance(LONG_DATE_TIME_FORMAT, new Locale("da", "DK"));
    //    private static final FastDateFormat longDateTimeFormatterNoSecs = FastDateFormat.getInstance(LONG_DATE_TIME_FORMAT_NO_SECS, new Locale("da", "DK"));
    //    private static final FastDateFormat longDateFormatter = FastDateFormat.getInstance(LONG_DATE_FORMAT, new Locale("da", "DK"));

    private static _decimalsToFractions: { [key: string]: string; } = { "0,5": "1/2", "0,25": "1/4", "0,75": "3/4", "1,5": "1 1/2" };
    private static _singularToPlural: { [key: string]: string; };
    private static _pluralToSingular: { [key: string]: string; };

    private static UNITS: string[][] = [
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
        if (!num || Math.floor(num) > 1)
            return "gange";
        else
            return "gang";
    }

    public static maybeAddSpace(supplText: string): string {
        if (supplText && supplText.substr(0, 1) === "," || supplText.substr(0, 1) === ".")
            return "";
        else
            return " ";
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

    public static quantityToString(quantity: number): string {

        let quantityString = TextHelper.formatQuantity(quantity);
        let fractions = TextHelper._decimalsToFractions[quantityString];

        if (fractions) {
            return fractions;
        }
        else {
            return quantityString;
        }
    }

    static initSingularPlural() {
        for (let u of TextHelper.UNITS) {
            TextHelper._singularToPlural = {};
            TextHelper._singularToPlural[u[0]] = u[1];
            TextHelper._pluralToSingular = {};
            TextHelper._pluralToSingular[u[1]] = u[0];
        }
    }

    static get singularToPlural() {
        if (!TextHelper._singularToPlural) {
            TextHelper.initSingularPlural();
        }

        return TextHelper._singularToPlural;
    }

    static get pluralToSingular() {
        if (!TextHelper._pluralToSingular) {
            TextHelper.initSingularPlural();
        }

        return TextHelper._pluralToSingular;
    }


    public static unitToSingular(s: string): string {

        let singular = TextHelper.pluralToSingular[s];
        if (s in TextHelper.pluralToSingular) {
            return TextHelper.pluralToSingular[s];
        }
        else {
            return s;
        }
    }

    public static unitToPlural(s: string): string {
        if (s in TextHelper.singularToPlural)
            return TextHelper.singularToPlural[s];
        else
            return s;
    }

    public static getUnit(dose: DoseWrapper, unitOrUnits: UnitOrUnitsWrapper): string {
        if (unitOrUnits.unit)
            return TextHelper.correctUnit(dose, unitOrUnits.unit);
        else if (unitOrUnits.unitSingular && unitOrUnits.unitPlural)
            return TextHelper.chooseUnit(dose, unitOrUnits.unitSingular, unitOrUnits.unitPlural);
        else
            return null;
    }

    public static getUnitFromDoseNumber(dose: number, unitOrUnits: UnitOrUnitsWrapper): string {
        if (unitOrUnits.unit)
            return TextHelper.correctUnitForDoseNumber(dose, unitOrUnits.unit);
        else if (unitOrUnits.unitSingular && unitOrUnits.unitPlural)
            return TextHelper.chooseUnitForDoseNumber(dose, unitOrUnits.unitSingular, unitOrUnits.unitPlural);
        else
            return null;
    }

    private static correctUnit(dose: DoseWrapper, unit: string): string {
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

    private static chooseUnit(dose: DoseWrapper, unitSingular: string, unitPlural: string): string {
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

    private static hasPluralUnit(dose: DoseWrapper): boolean {
        if (dose.doseQuantity) {
            return dose.doseQuantity > 1.0 || dose.doseQuantity < 0.000000001;
        }
        else if (dose.maximalDoseQuantity) {
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

    public static makeDayString(startDateOrDateTime: DateOrDateTimeWrapper, dayNumber: number): string {
        let d = TextHelper.makeFromDateOnly(startDateOrDateTime.getDateOrDateTime());
        d.setDate(d.getDate() + dayNumber - 1);
        let dateString = TextHelper.formatLongDate(d);
        return dateString.charAt(0).toUpperCase() + dateString.substr(1);
    }

    public static makeFromDateOnly(date: Date): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    }

    public static formatLongDate(date: Date): string {
        return TextHelper.weekdays[date.getDay()] + " den " + date.getDate() + ". " + TextHelper.months[date.getMonth()] + " " + date.getFullYear();
    }

    public static formatLongDateTime(dateTime: Date): string {
        // "EEEEEEE "den" d"." MMMMMMM yyyy "kl." HH:mm:ss";
        return TextHelper.formatLongDate(dateTime) + "kl." + dateTime.toLocaleTimeString().replace(".", ":");
    }

    public static formatLongDateNoSecs(dateTime: Date): string {
        let dateTimeString = TextHelper.formatLongDateTime(dateTime);
        return dateTimeString.substr(0, dateTimeString.length - 2);
    }

    public static makeDayOfWeekAndName(startDateOrDateTime: DateOrDateTimeWrapper, day: DayWrapper, initialUpperCase: boolean): DayOfWeek {
        let dateOnly = TextHelper.makeFromDateOnly(startDateOrDateTime.getDateOrDateTime());
        dateOnly.setDate(dateOnly.getDate() + day.dayNumber - 1);

        let dayString = TextHelper.weekdays[dateOnly.getDay()];
        let name: string;
        if (initialUpperCase)
            name = dayString.charAt(0).toUpperCase() + dayString.substring(1);
        else
            name = dayString;
        return new DayOfWeek(dateOnly.getDay(), name, day);

    }
}