import { MMANMapping } from './MMANMapping';

export abstract class AbstractXMLGenerator {

    public parseMapping(mapping: string): MMANMapping {
        let splittedMapping = mapping.split("+");
        let mmanMapping = new MMANMapping();
        
        if(splittedMapping.length > 0) {
            mmanMapping.setMorning(parseFloat(splittedMapping[0]));
        }
        
        if(splittedMapping.length > 1) {
            mmanMapping.setNoon(parseFloat(splittedMapping[1]));
        }
        
        if(splittedMapping.length > 2) {
            mmanMapping.setEvening(parseFloat(splittedMapping[2]));
        }

        if(splittedMapping.length > 3) {
            mmanMapping.setNight(parseFloat(splittedMapping[3]));
        }

        return mmanMapping;
    }

    public escape(s: string): string {
		if(s) {
		    return s.replace("<", "&lt;").replace(">", "&gt;").replace("&", "&amp;").replace("\"", "&quot").replace("'", "&apos;");
        }

        return s;
	}
}