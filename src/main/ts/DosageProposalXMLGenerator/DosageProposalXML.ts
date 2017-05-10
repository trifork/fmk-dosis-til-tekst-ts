export class DosageProposalXML {
    private _xml: string;
    private _shortDosageTranslation: string;
    private _longDosageTranslation: string;

    public constructor(xml: string, shortDosageTranslation: string, longDosageTranslation: string) {
        this._xml = xml;
        this._shortDosageTranslation = shortDosageTranslation;
        this._longDosageTranslation = longDosageTranslation;
    }

    public getXml(): string {
        return this._xml;
    }

    public getShortDosageTranslation(): string {
        return this._shortDosageTranslation;
    }

    public getLongDosageTranslation(): string {
        return this._longDosageTranslation;
    }
}