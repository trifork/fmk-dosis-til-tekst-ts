import { TextHelper } from "./TextHelper";


export function formatDateOnly(date: Date) {
    return TextHelper.formatYYYYMMDD(date);
}

export function formatDateDDMMYYYY(date: Date | string) {
    if (typeof(date) === "string") {
        date = new Date(date);
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

export function formatDateTime(dateTime: Date) {
    return dateTime && dateTime.toJSON();
}

export function diffInDays(a: Date, b: Date): number {
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    return Math.floor((utcB - utcA) / MS_PER_DAY);
}