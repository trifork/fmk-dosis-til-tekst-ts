/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { DosageProposalXMLGenerator, DosageProposalXML, FMKVersion, XML140Generator } from "../../../main/ts/index";

describe('parseMapping', () => {
    it('should handle morning dose', () => {
        let generator = new XML140Generator();
        let mapping = generator.parseMapping('1')

        expect(mapping.getMorning()).to.equal(1);
        expect(mapping.getNoon()).to.be.undefined;
        expect(mapping.getEvening()).to.be.undefined;
        expect(mapping.getNight()).to.be.undefined;
    });

    it('should handle morning+noon dose', () => {
        let generator = new XML140Generator();
        let mapping = generator.parseMapping('1+2')

        expect(mapping.getMorning()).to.equal(1);
        expect(mapping.getNoon()).to.equal(2);
        expect(mapping.getEvening()).to.be.undefined;
        expect(mapping.getNight()).to.be.undefined;
    });

    it('should handle morning+noon+evening dose', () => {
        let generator = new XML140Generator();
        let mapping = generator.parseMapping('1+2+3')

        expect(mapping.getMorning()).to.equal(1);
        expect(mapping.getNoon()).to.equal(2);
        expect(mapping.getEvening()).to.equal(3);
        expect(mapping.getNight()).to.be.undefined;
    });


    it('should handle morning+noon+evening+night dose', () => {
        let generator = new XML140Generator();
        let mapping = generator.parseMapping('1+2+3+4')

        expect(mapping.getMorning()).to.equal(1);
        expect(mapping.getNoon()).to.equal(2);
        expect(mapping.getEvening()).to.equal(3);
        expect(mapping.getNight()).to.equal(4);
    });

});

