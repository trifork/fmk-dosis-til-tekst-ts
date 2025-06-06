
import { LongTextConverter } from "./LongTextConverter";
import { ShortTextConverter } from "./ShortTextConverter";

export class Factory {

    static shortTextConverter: ShortTextConverter;

    public static getLongTextConverter() {
        return LongTextConverter.getInstance();
    }

    public static getShortTextConverter() {
        return ShortTextConverter.getInstance();
    }
}

