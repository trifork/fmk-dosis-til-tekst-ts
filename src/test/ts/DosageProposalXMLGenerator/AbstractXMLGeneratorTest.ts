/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { AbstractXMLGenerator } from "../../../main/ts/DosageProposalXMLGenerator/AbstractXMLGenerator";

describe('parseMapping', () => {
    it('should handle morning dose', () => {
        let mapping = AbstractXMLGenerator.parseMapping('1')

        expect(mapping.getMorning()).to.equal(1);
        expect(mapping.getNoon()).to.be.undefined;
        expect(mapping.getEvening()).to.be.undefined;
        expect(mapping.getNight()).to.be.undefined;
    });

    it('should handle morning+noon dose', () => {
        let mapping = AbstractXMLGenerator.parseMapping('1+2')

        expect(mapping.getMorning()).to.equal(1);
        expect(mapping.getNoon()).to.equal(2);
        expect(mapping.getEvening()).to.be.undefined;
        expect(mapping.getNight()).to.be.undefined;
    });

    it('should handle morning+noon+evening dose', () => {
        let mapping = AbstractXMLGenerator.parseMapping('1+2+3')

        expect(mapping.getMorning()).to.equal(1);
        expect(mapping.getNoon()).to.equal(2);
        expect(mapping.getEvening()).to.equal(3);
        expect(mapping.getNight()).to.be.undefined;
    });


    it('should handle morning+noon+evening+night dose', () => {
        let mapping = AbstractXMLGenerator.parseMapping('1+2+3+4')

        expect(mapping.getMorning()).to.equal(1);
        expect(mapping.getNoon()).to.equal(2);
        expect(mapping.getEvening()).to.equal(3);
        expect(mapping.getNight()).to.equal(4);
    });

});

