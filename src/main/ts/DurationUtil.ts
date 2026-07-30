export class DurationUtil {

    public static formatMinutes(totalMinutes: number): string {
        const minutesPerHour = 60;
        const minutesPerDay = 24 * minutesPerHour;
        const days = Math.floor(totalMinutes / minutesPerDay);
        const hours = Math.floor(totalMinutes % minutesPerDay / minutesPerHour);
        const minutes = totalMinutes % minutesPerHour;
        const parts: string[] = [];

        if (days) {
            parts.push(`${days} ${days === 1 ? "dag" : "dage"}`);
        }
        if (hours) {
            parts.push(`${hours} ${hours === 1 ? "time" : "timer"}`);
        }
        if (minutes || parts.length === 0) {
            parts.push(`${minutes} ${minutes === 1 ? "minut" : "minutter"}`);
        }

        if (parts.length === 1) {
            return parts[0];
        }

        return `${parts.slice(0, -1).join(", ")} og ${parts[parts.length - 1]}`;
    }
}
