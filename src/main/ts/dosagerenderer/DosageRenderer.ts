import { DosageV2 } from "./Dosage";

export interface DosageRenderer {
    render(dosage: DosageV2): string;
}
