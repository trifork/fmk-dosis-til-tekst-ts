import { LocalTime } from "../dto/Dosage";

export class LocalTimeHelper {

    public static toString(localTime: LocalTime): string {

        let hourString = localTime.hour.toString();
        let minuteString = localTime.minute.toString();
        if (minuteString.length === 1) {
            minuteString = "0" + minuteString;
        }

        let secondString: string;

        if (localTime.second !== undefined && localTime.second !== 0) {
            secondString = localTime.second.toString();
            if (secondString.length === 1) {
                secondString = "0" + secondString;
            }
        }

        let s = hourString + ":" + minuteString;
        if (secondString) {
            s += ":" + secondString;
        }

        return s;
    }
}
