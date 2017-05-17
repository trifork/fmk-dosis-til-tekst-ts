export interface XMLGenerator {
    generateXml(type: string, iteration: number, mapping: string, unitTextSingular: string, unitTextPlural: string, beginDate: Date, endDate: Date, supplementaryText?: string, ): string;
}