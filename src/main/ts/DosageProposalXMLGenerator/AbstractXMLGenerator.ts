import { MMANMapping } from "./MMANMapping";

export abstract class AbstractXMLGenerator {

    public readonly daysMappingRegExp = /dag\s(\d+):\s(\d+(\.\d+)?([;+]\d+(\.\d+)?)*)/g;  /* Match på ex. "dag 1: 1.0", "dag 1: 1.2;2.3", "dag 1: 1 dag 2: 2" "dag 1: 1+1 dag 2: 1+3" */

    // Namespace to be used for all elements expect for Day elements in dosages, that due to the mixed namespaces in 1.4.2 has its own dosageNS parameter on many of the methods
    protected abstract getNamespace(): string;

    public static parseMapping(mapping: string): MMANMapping {
        let splittedMapping = mapping.split("+");
        let mmanMapping = new MMANMapping();

        if (splittedMapping.length > 0) {
            mmanMapping.setMorning(parseFloat(splittedMapping[0]));
        }

        if (splittedMapping.length > 1) {
            mmanMapping.setNoon(parseFloat(splittedMapping[1]));
        }

        if (splittedMapping.length > 2) {
            mmanMapping.setEvening(parseFloat(splittedMapping[2]));
        }

        if (splittedMapping.length > 3) {
            mmanMapping.setNight(parseFloat(splittedMapping[3]));
        }

        return mmanMapping;
    }

    public escape(s: string): string {
        if (s) {
            return s.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;").replace("\"", "&quot").replace("'", "&apos;");
        }

        return s;
    }
}