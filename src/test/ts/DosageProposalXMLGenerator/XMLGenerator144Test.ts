/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../../node_modules/@types/node/index.d.ts" />

import { expect, assert } from 'chai';

import { XML144Generator } from "../../../main/ts/index";
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
            let fmk14schema = fs.getFile("../schemas/fmk-1.4.4-all-types.xsd");
            schema = xsd.parse(fmk14schema);
        }
    }
    catch (e) {
        if (e.code == "ENOENT") {
            throw new Error("Could not load fmk-1.4.4-all-types.xsd. Try running 'grunt copy:copyForPrepareTestSchemas' before running test.")
        }
        else {
            throw e;
        }
    }
}


describe('XMLGenerator144 M+M+A+N', () => {

    before(loadSchema);

    it('should handle M+M+A+N dose, testing entire xml structure', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '1+2+3+4', 'tablet', 'tabletter', 'tages med rigeligt vand');
        console.log(xml);
        validateAndExpect(xml).to.equal("<m15:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2015/01/01 ../../../2015/01/01/DosageForRequest.xsd\" " +
            "xmlns:m15=\"http://www.dkma.dk/medicinecard/xml.schema/2015/01/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m15:Structures>" +
            "<m15:UnitTexts source=\"Doseringsforslag\">" +
            "<m15:Singular>tablet</m15:Singular>" +
            "<m15:Plural>tabletter</m15:Plural>" +
            "</m15:UnitTexts>" +
            "<m15:Structure>" +
            "<m15:IterationInterval>1</m15:IterationInterval>" +
            "<m15:StartDate>2010-01-01</m15:StartDate>" +
            "<m15:EndDate>2110-01-01</m15:EndDate>" +
            "<m15:SupplementaryText>tages med rigeligt vand</m15:SupplementaryText>" +
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Time>morning</m15:Time>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Time>noon</m15:Time>" +
            "<m15:Quantity>2</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Time>evening</m15:Time>" +
            "<m15:Quantity>3</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Time>night</m15:Time>" +
            "<m15:Quantity>4</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>" +
            "</m15:Structure>" +
            "</m15:Structures>" +
            "</m15:Dosage>");
    });

    it('should handle M dose', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '1', 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Time>morning</m15:Time>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>");
    });

    it('should handle M+M dose', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '1+2', 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Time>morning</m15:Time>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Time>noon</m15:Time>" +
            "<m15:Quantity>2</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>");
    });

    it('should handle M+M+A dose', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '1+2+3', 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Time>morning</m15:Time>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Time>noon</m15:Time>" +
            "<m15:Quantity>2</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Time>evening</m15:Time>" +
            "<m15:Quantity>3</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>");
    });

    it('should handle A dose', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('M+M+A+N', 1, '0+0+0+0.5', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Time>night</m15:Time>" +
            "<m15:Quantity>0.5</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>");
    });
});

describe('XMLGenerator144 N daglig', () => {

    before(loadSchema);
    
    it('should handle 1', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('N daglig', 1, '1', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
    });

    it('should handle 1;2', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('N daglig', 1, '1;2', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Quantity>2</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('N daglig', 1, 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>2</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Quantity>3</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>" +
            "<m15:Day>" +
            "<m15:Number>2</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>4</m15:Quantity>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Quantity>5</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
    });
});

describe('XMLGenerator144 PN', () => {

    before(loadSchema);
    
    it('should handle 1', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('PN', 1, '1', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "<m15:IsAccordingToNeed/>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
    });

    it('should handle 1;2', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('PN', 1, '1;2', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "<m15:IsAccordingToNeed/>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Quantity>2</m15:Quantity>" +
            "<m15:IsAccordingToNeed/>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML144Generator();
        let xml = generator.generateXml('PN', 1, 'dag 1: 2;3 dag 2: 4;5', 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>2</m15:Quantity>" +
            "<m15:IsAccordingToNeed/>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Quantity>3</m15:Quantity>" +
            "<m15:IsAccordingToNeed/>" +
            "</m15:Dose>" +
            "</m15:Day>" +
            "<m15:Day>" +
            "<m15:Number>2</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>4</m15:Quantity>" +
            "<m15:IsAccordingToNeed/>" +
            "</m15:Dose>" +
            "<m15:Dose>" +
            "<m15:Quantity>5</m15:Quantity>" +
            "<m15:IsAccordingToNeed/>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
    });

});
