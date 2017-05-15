/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../../node_modules/@types/node/index.d.ts" />

import { expect, assert } from 'chai';

import { XML146Generator } from "../../../main/ts/index";
import * as fs from 'ts-node';
import * as xsd from 'libxml-xsd';

let schema;


function validateAndExpect(xml: string): Chai.Assertion {
    let result = schema.validate(xml);
    assert.isNull(result, "Validation errors: " + result + "\nXML: " + xml)
    return expect(xml);
}


function loadSchema() {
    try {
        if (schema === undefined) {
            let fmk14schema = fs.getFile("../schemas/fmk-1.4.6-all-types.xsd");
            schema = xsd.parse(fmk14schema);
        }
    }
    catch (e) {
        if (e.code == "ENOENT") {
            throw new Error("Could not load fmk-1.4.6-all-types.xsd. Try running 'grunt copy:copyForPrepareTestSchemas' before running test.")
        }
        else {
            throw e;
        }
    }
}

function expectFixed(xml: string) {
    expect(xml).to.contain("<m16:StructuresFixed>")
        .and.to.contain("</m16:StructuresFixed>")
        .and.not.to.contain("</m16:StructuresAccordingToNeed>")
        .and.not.to.contain("<m16:StructuresAccordingToNeed>");
}

function expectAccordingToNeed(xml: string) {
    expect(xml).to.contain("</m16:StructuresAccordingToNeed>")
        .and.to.contain("<m16:StructuresAccordingToNeed>")
        .and.not.to.contain("<m16:StructuresFixed>")
        .and.not.to.contain("</m16:StructuresFixed>");
    ;
}

describe('XML146Generator M+M+A+N', () => {

    before(loadSchema);

    it('should handle M+M+A+N dose, testing entire xml structure', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand');
        console.log(xml);
        validateAndExpect(xml).to.equal("<m16:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2015/06/01 ../../../2015/06/01/DosageForRequest.xsd\" " +
            "xmlns:m16=\"http://www.dkma.dk/medicinecard/xml.schema/2015/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m16:UnitTexts source=\"Doseringsforslag\">" +
            "<m16:Singular>tablet</m16:Singular>" +
            "<m16:Plural>tabletter</m16:Plural>" +
            "</m16:UnitTexts>" +
            "<m16:StructuresFixed>" +
            "<m16:Structure>" +
            "<m16:IterationInterval>1</m16:IterationInterval>" +
            "<m16:StartDate>2010-01-01</m16:StartDate>" +
            "<m16:EndDate>2110-01-01</m16:EndDate>" +
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
            "</m16:StructuresFixed>" +
            "</m16:Dosage>");
    });

    it('should handle M dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '1', 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Time>morning</m16:Time>" +
            "<m16:Quantity>1</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>");
        expectFixed(xml)
    });

    it('should handle M+M dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '1+2', 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
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
            "</m16:Day>");
        expectFixed(xml)
    });

    it('should handle M+M+A dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '1+2+3', 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
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
            "</m16:Day>");
        expectFixed(xml)
    });

    it('should handle A dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '0+0+0+0.5', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Time>night</m16:Time>" +
            "<m16:Quantity>0.5</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>");
        expectFixed(xml)
    });
});

describe('XML146Generator N daglig', () => {

    before(loadSchema);

    it('should handle 1', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('N daglig', 1, '1', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>1</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>"
        );
        expectFixed(xml)
    });

    it('should handle 1;2', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('N daglig', 1, '1;2', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>1</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Quantity>2</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>"
        );
        expectFixed(xml)
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('N daglig', 1, 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>2</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Quantity>3</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>" +
            "<m16:Day>" +
            "<m16:Number>2</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>4</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Quantity>5</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>"
        );
        expectFixed(xml)
    });
});

describe('XML146Generator PN', () => {

    before(loadSchema);

    it('should handle 1', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('PN', 1, '1', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>1</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>"
        );

        expectAccordingToNeed(xml);
    });

    it('should handle 1;2', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('PN', 1, '1;2', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>1</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Quantity>2</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>"
        );
        expectAccordingToNeed(xml);
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml('PN', 1, 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>2</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Quantity>3</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>" +
            "<m16:Day>" +
            "<m16:Number>2</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>4</m16:Quantity>" +
            "</m16:Dose>" +
            "<m16:Dose>" +
            "<m16:Quantity>5</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>"
        );
        expectAccordingToNeed(xml);
    });

});
