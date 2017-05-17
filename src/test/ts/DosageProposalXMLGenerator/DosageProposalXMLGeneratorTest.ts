/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { DosageProposalXMLGenerator, DosageProposalXML, FMKVersion, DosisTilTekstException } from "../../../main/ts/index";

let beginDate = new Date(2010, 0, 1);
let endDate = new Date(2110, 0, 1);

describe('version check', () => {
    it('should throw an exception for unsupported version', () => {
        expect(() => DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', 1, '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, 10000)).to.throw("Unsupported dosageProposalXMLGeneratorVersion, only version 1 is supported");
    });
});

describe('generateXMLSnippet dosagetranslation values for M+M+A+N', () => {

    let dosageProposalXMLGeneratorVersion = 1;

    it('should handle M+M+A+N dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', 1, '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet morgen tages med rigeligt vand + 2 tabletter middag tages med rigeligt vand + 3 tabletter aften tages med rigeligt vand + 4 tabletter før sengetid tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle Morning only', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', 1, '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet morgen tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet morgen tages med rigeligt vand");
    });

    it('should handle Noon only', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', 1, '0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet middag tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet middag tages med rigeligt vand");
    });

    it('should handle Evening only', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', 1, '0+0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet aften tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet aften tages med rigeligt vand");
    });

    it('should handle Night only', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('M+M+A+N', 1, '0+0+0+1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet før sengetid tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet før sengetid tages med rigeligt vand");
    });

});


describe('generateXMLSnippet N daglig', () => {

    let dosageProposalXMLGeneratorVersion = 1;

    it('should handle 1', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', 1, '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet 1 gang daglig tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet daglig tages med rigeligt vand");
    });

    it('should handle 1;2', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', 1, '1;2', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet tages med rigeligt vand + 2 tabletter tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', 1, 'dag 1: 2 dag 2: 3', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   Daglig: 2 tabletter tages med rigeligt vand\n   Daglig: 3 tabletter tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('N daglig', 1, 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   Daglig: 2 tabletter tages med rigeligt vand + 3 tabletter tages med rigeligt vand\n   Daglig: 4 tabletter tages med rigeligt vand + 5 tabletter tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });
});

describe('generateXMLSnippet PN', () => {

    let dosageProposalXMLGeneratorVersion = 1;
    
    it('should handle 1', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', 1, '1', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1 tablet efter behov højst 1 gang daglig tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.equal("1 tablet efter behov, højst 1 gang daglig tages med rigeligt vand");
    });

    it('should handle 1.1;2.2', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', 1, '1.1;2.2', 'ml', 'ml', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, gentages hver dag, og ophører onsdag den 1. januar 2110:\n   Doseringsforløb:\n   1,1 ml efter behov tages med rigeligt vand + 2,2 ml efter behov tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', 2, 'dag 1: 2 dag 3: 4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, forløbet gentages efter 2 dage, og ophører onsdag den 1. januar 2110.\nBemærk at doseringen varierer og har et komplekst forløb:\n   Doseringsforløb:\n   Fredag den 1. januar 2010: 2 tabletter efter behov højst 1 gang tages med rigeligt vand\n   Søndag den 3. januar 2010: 4 tabletter efter behov højst 1 gang tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2 dag 2: 3 dose without iteration', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', 0, 'dag 1: 2 dag 3: 4', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, og ophører onsdag den 1. januar 2110.\nBemærk at doseringen varierer og har et komplekst forløb:\n   Doseringsforløb:\n   Fredag den 1. januar 2010: 2 tabletter efter behov højst 1 gang tages med rigeligt vand\n   Søndag den 3. januar 2010: 4 tabletter efter behov højst 1 gang tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let snippet = DosageProposalXMLGenerator.generateXMLSnippet('PN', 2, 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter', 'tages med rigeligt vand', beginDate, endDate, FMKVersion.FMK146, dosageProposalXMLGeneratorVersion);
        expect(snippet.getLongDosageTranslation()).to.equal("Doseringsforløbet starter fredag den 1. januar 2010, forløbet gentages hver 2. dag, og ophører onsdag den 1. januar 2110.\nBemærk at doseringen varierer:\n   Doseringsforløb:\n   Dag 1: 2 tabletter efter behov tages med rigeligt vand + 3 tabletter efter behov tages med rigeligt vand\n   Dag 2: 4 tabletter efter behov tages med rigeligt vand + 5 tabletter efter behov tages med rigeligt vand");
        expect(snippet.getShortDosageTranslation()).to.be.null;
    });
});