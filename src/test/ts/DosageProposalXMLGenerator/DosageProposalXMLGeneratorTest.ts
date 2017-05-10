/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { DosageProposalXMLGenerator, DosageProposalXML, FMKVersion } from "../../../main/ts/index";

describe('generateXMLSnippet for PN', () => {
    it('should just do something', () => {
        let dummy = DosageProposalXMLGenerator.generateXMLSnippet('PN', 1, '1;1', 'tablet', 'tabletter', '1 time før virkning ønskes', FMKVersion.FMK140);
        // expect(dummy.getXml()).to.equal('');
        expect(dummy.getLongDosageTranslation()).to.equal('');
        expect(dummy.getShortDosageTranslation()).to.equal('');

    });
});

