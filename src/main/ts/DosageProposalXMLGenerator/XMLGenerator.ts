export interface XMLGenerator {
    generateXml(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string): string;
}