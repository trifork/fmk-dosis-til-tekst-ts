import { TextHelper } from "./TextHelper";


export function formatDateOnly(date: Date) {
    return TextHelper.formatYYYYMMDD(date);
}

export function formatDateTime(dateTime: Date) {
    return dateTime && dateTime.toJSON();
}
