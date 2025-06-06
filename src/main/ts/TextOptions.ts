export enum TextOptions {
    STANDARD = "STANDARD",
    VKA = "VKA",
    VKA_WITH_MARKUP = "VKA_WITH_MARKUP"

}

export function textOptionFromString(value: string): TextOptions | undefined {
    return Object.values(TextOptions).includes(value as TextOptions) ? (value as TextOptions) : undefined;
};
