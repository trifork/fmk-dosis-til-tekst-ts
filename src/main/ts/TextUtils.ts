export function capitalize(s?: string) {
    return s?.length
        ? s[0].toUpperCase() + s.slice(1)
        : s;
}

export function joinTextList(items: string[]) {
    if (items.length <= 2) {
        return items.join(" og ");
    }

    return items.slice(0, -1).join(", ") + " og " + items[items.length - 1];
}
