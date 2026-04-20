import { TextHelper } from "./TextHelper";


export function formatDateOnly(date: Date) {
    return TextHelper.formatYYYYMMDD(date);
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