import { TextHelper } from "../TextHelper";
import { Dose } from "../dto/Dosage";

export abstract class DoseWrapper {
    abstract readonly value: Dose;
}
