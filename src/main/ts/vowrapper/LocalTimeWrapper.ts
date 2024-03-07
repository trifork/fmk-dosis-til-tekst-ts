import { LocalTime } from "../dto/Dosage";

export class LocalTimeWrapper {

    readonly value: LocalTime;

    public constructor(hour: number, minute: number, second?: number) {
        this.value = {
            hour,
            minute,
            second
        };
    }
}
