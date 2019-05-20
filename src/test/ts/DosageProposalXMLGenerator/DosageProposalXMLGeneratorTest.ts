/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { DosageProposalXMLGenerator, DosageProposalXML, DosisTilTekstException } from "../../../main/ts/index";

let beginDates = [new Date(2010, 0, 1)];
let endDates = [new Date(2110, 0, 1)];

describe('version check', () => {
    it('should throw an exception for unsupported version', () => {
        expect(() => DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", 10000)).to.throw("Unsupported dosageProposalXMLGeneratorVersion, only version 1 is supported");
    });
});

describe('generateXMLSnippet dosagetranslation values for M+M+A+N', () => {

    let dosageProposalXMLGeneratorVersion = 1;

    it('should handle M+M+A+N dose without enddate', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, [ undefined ], "FMK146", dosageProposalXMLGeneratorVersion);
//        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010 og gentages hver dag:\n   Doseringsforløb:\n   1 tablet morgen tages med rigeligt vand + 2 tabletter middag tages med rigeligt vand + 3 tabletter aften tages med rigeligt vand + 4 tabletter nat tages med rigeligt vand");
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010 og gentages hver dag:\n   Doseringsforløb:\n   1 tablet morgen + 2 tabletter middag + 3 tabletter aften + 4 tabletter nat.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle M+M+A+N dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet morgen + 2 tabletter middag + 3 tabletter aften + 4 tabletter nat.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle Morning only', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet morgen.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet morgen.\n   Bemærk: tages med rigeligt vand");
    });

    it('should handle Noon only', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet middag.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet middag.\n   Bemærk: tages med rigeligt vand");
    });

    it('should handle Evening only', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '0+0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet aften.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet aften.\n   Bemærk: tages med rigeligt vand");
    });

    it('should handle Night only', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', '1', '0+0+0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet nat.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet nat.\n   Bemærk: tages med rigeligt vand");
    });

});


describe('generateXMLSnippet N daglig', () => {

    let dosageProposalXMLGeneratorVersion = 1;

    it('should handle 1', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet 1 gang daglig.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet daglig.\n   Bemærk: tages med rigeligt vand");
    });

    it('should handle 1;2', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '1', '1;2', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet + 2 tabletter.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '1', 'dag 1: 2 dag 2: 3', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   Daglig: 2 tabletter\n   Daglig: 3 tabletter.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', '1', 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   Daglig: 2 tabletter + 3 tabletter\n   Daglig: 4 tabletter + 5 tabletter.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });
});

describe('generateXMLSnippet PN', () => {

    let dosageProposalXMLGeneratorVersion = 1;

    it('should handle 1', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet efter behov højst 1 gang daglig.\n   Bemærk: tages med rigeligt vand");
        //expect(snippet.getShortDosageTranslation()).to.equal("1 tablet efter behov, højst 1 gang daglig.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle 1 with long suppl.text', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet efter behov højst 1 gang daglig.\n   Bemærk: tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle 1 with long suppl.text and longer shorttext', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '1', '1', 'tablet', 'tabletter', 'tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion, 10000);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet efter behov højst 1 gang daglig.\n   Bemærk: tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet efter behov, højst 1 gang daglig.\n   Bemærk: tages med rigeligt vand OG EN HEL MASSE MERE DER FÅR DEN KORTE TEKST TIL AT BLIVE LÆNGERE END 70 KARAKTERER");
    });

    it('should handle 1.1;2.2', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '1', '1.1;2.2', 'ml', 'ml', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1,1 ml efter behov + 2,2 ml efter behov.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '2', 'dag 1: 2 dag 3: 4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, forløbet gentages efter 2 dage, og ophører onsdag den 1. januar 2110.\nBemærk at doseringen varierer og har et komplekst forløb:\n   Doseringsforløb:\n   Fredag den 1. januar 2010: 2 tabletter efter behov højst 1 gang\n   Søndag den 3. januar 2010: 4 tabletter efter behov højst 1 gang.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose without iteration', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '0', 'dag 1: 2 dag 3: 4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, og ophører onsdag den 1. januar 2110.\nBemærk at doseringen varierer og har et komplekst forløb:\n   Doseringsforløb:\n   Fredag den 1. januar 2010: 2 tabletter efter behov højst 1 gang\n   Søndag den 3. januar 2010: 4 tabletter efter behov højst 1 gang.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', '2', 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDates, endDates, "FMK146", dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, forløbet gentages hver 2. dag, og ophører onsdag den 1. januar 2110.\nBemærk at doseringen varierer:\n   Doseringsforløb:\n   Dag 1: 2 tabletter efter behov + 3 tabletter efter behov\n   Dag 2: 4 tabletter efter behov + 5 tabletter efter behov.\n   Bemærk: tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });
});


describe('generateXMLSnippet Multiperiode', () => {

    let dosageProposalXMLGeneratorVersion = 1;

    it('should handle M+M+A+N dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('{M+M+A+N}{PN}{N daglig}', '{1}{2}{1}', '{1+2+3+4}{dag 1: 2 dag 2: 3}{2}', 'tablet', 'tabletter', 'tages med rigeligt vand', [new Date(2010, 0, 1), new Date(2010, 1, 1), new Date(2010, 2, 1)], [new Date(2010, 0, 31), new Date(2010, 1, 28), new Date(2010, 2, 31)], "FMK146", dosageProposalXMLGeneratorVersion);
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
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringen indeholder flere perioder:\n\n" +
            "Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører søndag den 31. januar 2010:\n" +
            "   Doseringsforløb:\n" +
            "   1 tablet morgen + 2 tabletter middag + 3 tabletter aften + 4 tabletter nat.\n   Bemærk: tages med rigeligt vand\n\n" +

            "Doseringsforløbet starter mandag den 1. februar 2010, forløbet gentages hver 2. dag, og ophører søndag den 28. februar 2010.\n" +
            "Bemærk at doseringen varierer:\n" +
            "   Doseringsforløb:\n" +
            "   Dag 1: 2 tabletter efter behov højst 1 gang\n" +
            "   Dag 2: 3 tabletter efter behov højst 1 gang.\n   Bemærk: tages med rigeligt vand\n\n" +
            "Doseringsforløbet starter mandag den 1. marts 2010, gentages hver dag, og ophører onsdag den 31. marts 2010:\n" +
            "   Doseringsforløb:\n" +
            "   2 tabletter 1 gang daglig.\n   Bemærk: tages med rigeligt vand"
        );
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });
});

describe('getPeriodStrings', () => {

    it('should handle {M+M+A+N}{N daglig}{PN} dose', () => {
        let strings = DosageProposalXMLGenerator.getPeriodStrings("{M+M+A+N}{N daglig}{PN}");
        expect(strings.length).to.equal(3);
        expect(strings[0]).to.equal("M+M+A+N");
        expect(strings[1]).to.equal("N daglig");
        expect(strings[2]).to.equal("PN");
    });

    it('should handle M+M+A+N dose', () => {
        let strings = DosageProposalXMLGenerator.getPeriodStrings("M+M+A+N");
        expect(strings.length).to.equal(1);
        expect(strings[0]).to.equal("M+M+A+N");
    });
});
