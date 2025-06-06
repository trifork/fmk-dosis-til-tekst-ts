
import { expect } from 'chai';
import { DosageProposalXMLGenerator } from "../../../main/ts/index";

const beginDates = [new Date(2010, 0, 1)];
const endDates = [new Date(2110, 0, 1)];

describe('version check', () => {
    it('should throw an exception for unsupported version', () => {
        expect(() => DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", 10000)).to.throw("Unsupported dosageProposalXMLGeneratorVersion, only version 1 is supported");
    });
});

describe('generateXMLSnippet dosagetranslation values for M+M+A+N', () => {

    const dosageProposalXMLGeneratorVersion = 1;

    it('should handle M+M+A+N dose without enddate', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, [ undefined ], "FMK146", dosageProposalXMLGeneratorVersion);
//        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 og gentages hver dag:\n   Doseringsforløb:\n   1 tablet morgen tages med rigeligt vand + 2 tabletter middag tages med rigeligt vand + 3 tabletter aften tages med rigeligt vand + 4 tabletter nat tages med rigeligt vand");
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010:\n1 tablet morgen, 2 tabletter middag, 3 tabletter aften og 4 tabletter nat - hver dag\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });
    

    it('should handle M+M+A+N dose', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet morgen, 2 tabletter middag, 3 tabletter aften og 4 tabletter nat - hver dag\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle Morning only', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet hver morgen\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet morgen.\nBemærk: tages med rigeligt vand");
    });

    it('should handle Noon only', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet hver middag\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet middag.\nBemærk: tages med rigeligt vand");
    });

    it('should handle Evening only', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '0+0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet hver aften\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet aften.\nBemærk: tages med rigeligt vand");
    });

    it('should handle Night only', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '0+0+0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet hver nat\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet nat.\nBemærk: tages med rigeligt vand");
    });

    // FMK-5729
    it('should handle M+M+A+N, iteration 0, mapping dag 2: 1+0+0+0 dag 3: 0+2+0+0', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '0', 'dag 2: 1+0+0+0 dag 3: 0+2+0+0', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\nLørdag d. 2. jan. 2010: 1 tablet morgen\nSøndag d. 3. jan. 2010: 2 tabletter middag\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

});


describe('generateXMLSnippet N daglig', () => {

    const dosageProposalXMLGeneratorVersion = 1;

    it('should handle 1', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet hver dag\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet daglig.\nBemærk: tages med rigeligt vand");
    });

    it('should handle 1 daily iter 7 without enddate', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '7', '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, [ undefined ], "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 - gentages hver uge:\nFredag: 1 tablet\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet fredag hver uge.\nBemærk: tages med rigeligt vand");
    });


    it('should handle 1;2', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '1', '1;2', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet og 2 tabletter hver dag\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '2', 'dag 1: 2 dag 2: 3', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110 - gentages hver 2. dag:\nDag 1: 2 tabletter\nDag 2: 3 tabletter\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '2', 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110 - gentages hver 2. dag:\nDag 1: 2 tabletter og 3 tabletter\nDag 2: 4 tabletter og 5 tabletter\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle not iterated without enddate (FMK-6364)', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '0', '1', 'tablet', 'tabletter', 'engangsdosis. Gentages ikke', beginDates,  [ undefined ], "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering kun d. 1. jan. 2010:\n1 tablet\nBemærk: engangsdosis. Gentages ikke");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet 1 gang.\nBemærk: engangsdosis. Gentages ikke");
    });
 
});

describe('generateXMLSnippet PN', () => {

    const dosageProposalXMLGeneratorVersion = 1;

    it('should handle PN 1', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet efter behov, højst 1 gang dagligt\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle 1 with long suppl.text', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet efter behov, højst 1 gang dagligt\nBemærk: tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle 1 with long suppl.text and longer shorttext', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion, 10000);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1 tablet efter behov, højst 1 gang dagligt\nBemærk: tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet efter behov, højst 1 gang dagligt.\nBemærk: tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER");
    });

    it('should handle 1.1;2.2', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '1', '1.1;2.2', 'ml', 'ml', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\n1,1 ml efter behov og 2,2 ml efter behov - hver dag\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '2', 'dag 1: 2 dag 3: 4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110 - gentages hver 2. dag:\nDag 1: 2 tabletter efter behov, højst 1 gang dagligt\nDag 3: 4 tabletter efter behov, højst 1 gang dagligt\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose without iteration', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '0', 'dag 1: 2 dag 3: 4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110:\nFredag d. 1. jan. 2010: 2 tabletter efter behov, højst 1 gang dagligt\nSøndag d. 3. jan. 2010: 4 tabletter efter behov, højst 1 gang dagligt\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '2', 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 1. jan. 2110 - gentages hver 2. dag:\nDag 1: 2 tabletter efter behov og 3 tabletter efter behov\nDag 2: 4 tabletter efter behov og 5 tabletter efter behov\nBemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });
});


describe('generateXMLSnippet Multiperiode', () => {

    const dosageProposalXMLGeneratorVersion = 1;

    it('should handle M+M+A+N dose', () => {
        const snippet = DosageProposalXMLGenerator.generateXMLSnippet('{M+M+A+N}{PN}{N daglig}', '{1}{2}{1}', '{1+2+3+4}{dag 1: 2 dag 2: 3}{2}', 'tablet', 'tabletter', 'tages med rigeligt vand', [new Date(2010, 0, 1), new Date(2010, 1, 1), new Date(2010, 2, 1)], [new Date(2010, 0, 31), new Date(2010, 1, 28), new Date(2010, 2, 31)], "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getXml()).to.equal("<m16:Dosage xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2015/06/01 ../../../2015/06/01/DosageForRequest.xsd\" xmlns:m16=\"http://www.dkma.dk/medicinecard/xml.schema/2015/06/01\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m16:UnitTexts source=\"Doseringsforslag\">" +
            "<m16:Singular>tablet</m16:Singular>" +
            "<m16:Plural>tabletter</m16:Plural>" +
            "</m16:UnitTexts>" +
            "<m16:StructuresFixed>" +
            "<m16:Structure>" +
            "<m16:IterationInterval>1</m16:IterationInterval>" +
            "<m16:StartDate>2010-01-01</m16:StartDate>" +
            "<m16:EndDate>2010-01-31</m16:EndDate>" +
            "<m16:SupplementaryText>tages med rigeligt vand</m16:SupplementaryText>" +
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Time>morning</m16:Time>" +
            "<m16:Quantity>1</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Time>noon</m16:Time>" +
            "<m16:Quantity>2</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Time>evening</m16:Time>" +
            "<m16:Quantity>3</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Time>night</m16:Time>" +
            "<m16:Quantity>4</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>" +
            "</m16:Structure>" +
            "<m16:Structure>" +
            "<m16:IterationInterval>1</m16:IterationInterval>" +
            "<m16:StartDate>2010-03-01</m16:StartDate>" +
            "<m16:EndDate>2010-03-31</m16:EndDate>" +
            "<m16:SupplementaryText>tages med rigeligt vand</m16:SupplementaryText>" +
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose><m16:Quantity>2</m16:Quantity></m16:Dose>" +
            "</m16:Day>" +
            "</m16:Structure>" +
            "</m16:StructuresFixed>" +
            "<m16:StructuresAccordingToNeed>" +
            "<m16:Structure>" +
            "<m16:IterationInterval>2</m16:IterationInterval>" +
            "<m16:StartDate>2010-02-01</m16:StartDate>" +
            "<m16:EndDate>2010-02-28</m16:EndDate>" +
            "<m16:SupplementaryText>tages med rigeligt vand</m16:SupplementaryText>" +
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose><m16:Quantity>2</m16:Quantity></m16:Dose>" +
            "</m16:Day>" +
            "<m16:Day>" +
            "<m16:Number>2</m16:Number>" +
            "<m16:Dose><m16:Quantity>3</m16:Quantity></m16:Dose>" +
            "</m16:Day>" +
            "</m16:Structure>" +
            "</m16:StructuresAccordingToNeed>" +
            "</m16:Dosage>");
        expect(snippet.getLongDosageTranslation()).to.equal("Dosering fra d. 1. jan. 2010 til d. 31. jan. 2010:\n" +
            "1 tablet morgen, 2 tabletter middag, 3 tabletter aften og 4 tabletter nat - hver dag\nBemærk: tages med rigeligt vand\n\n" +

            "Dosering fra d. 1. feb. 2010 til d. 28. feb. 2010 - gentages hver 2. dag:\n" +
            "Dag 1: 2 tabletter efter behov, højst 1 gang dagligt\n" +
            "Dag 2: 3 tabletter efter behov, højst 1 gang dagligt\nBemærk: tages med rigeligt vand\n\n"  +

            "Dosering fra d. 1. mar. 2010 til d. 31. mar. 2010:\n" +
            "2 tabletter hver dag\nBemærk: tages med rigeligt vand"

        );
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });
});

describe('getPeriodStrings', () => {

    it('should handle {M+M+A+N}{N daglig}{PN} dose', () => {
        const strings = DosageProposalXMLGenerator.getPeriodStrings("{M+M+A+N}{N daglig}{PN}");
        expect(strings.length).to.equal(3);
        expect(strings[0]).to.equal("M+M+A+N");
        expect(strings[1]).to.equal("N daglig");
        expect(strings[2]).to.equal("PN");
    });

    it('should handle M+M+A+N dose', () => {
        const strings = DosageProposalXMLGenerator.getPeriodStrings("M+M+A+N");
        expect(strings.length).to.equal(1);
        expect(strings[0]).to.equal("M+M+A+N");
    });
});
