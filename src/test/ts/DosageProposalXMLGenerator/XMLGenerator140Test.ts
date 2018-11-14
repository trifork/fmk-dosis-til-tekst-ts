/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';

import { XML140Generator, DosagePeriod } from "../../../main/ts/index";

import * as fs from 'ts-node';
import * as xsd from 'libxml-xsd';

let schema;
let beginDate = new Date(2010, 0, 1);
let endDate = new Date(2110, 0, 1);

function validateAndExpect(xml: string): Chai.Assertion {
    let result = schema.validate(xml);
    assert.isNull(result, "Validation errors: " + result + "\nXML: " + xml)
    return expect(xml);
}

function loadSchema() {
    try {
        if (schema === undefined) {
            let fmk14schema = fs.getFile("../schemas/fmk-1.4-all-types.xsd");
            schema = xsd.parse(fmk14schema);
        }
    }
    catch (e) {
        if (e.code == "ENOENT") {
            throw new Error("Could not load fmk-1.4-all-types.xsd. Try running 'grunt copy:copyForPrepareTestSchemas' before running test.")
        }
        else {
            throw e;
        }
    }
}

describe('XMLGenerator140 M+M+A+N', () => {

    before(loadSchema);

    it('should handle M+M+A+N dose, testing entire xml structure', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3+4', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');

        validateAndExpect(xml).to.equal("<m12:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01 ../../../2012/06/01/Dosage.xsd\" " +
            "xmlns:m12=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m12:Structure>" +
            "<m12:IterationInterval>1</m12:IterationInterval>" +
            "<m12:StartDate>2010-01-01</m12:StartDate>" +
            "<m12:EndDate>2110-01-01</m12:EndDate>" +
            "<m12:UnitTexts source=\"Doseringsforslag\">" +
            "<m12:Singular>tablet</m12:Singular>" +
            "<m12:Plural>tabletter</m12:Plural>" +
            "</m12:UnitTexts>" +
            "<m12:SupplementaryText>tages med rigeligt vand</m12:SupplementaryText>" +
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Time>morning</m12:Time>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Time>noon</m12:Time>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Time>evening</m12:Time>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Time>night</m12:Time>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>" +
            "</m12:Structure>" +
            "</m12:Dosage>");
    });

    it('should handle M dose', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Time>morning</m12:Time>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>");
    });

    it('should handle M dose without enddate', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, undefined)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m12:Structure>" +
            "<m12:IterationInterval>1</m12:IterationInterval>" +
            "<m12:StartDate>2010-01-01</m12:StartDate>" +
            "<m12:DosageEndingUndetermined/>" +
            "<m12:UnitTexts source=\"Doseringsforslag\">");
    });

    it('should handle M+M dose', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Time>morning</m12:Time>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Time>noon</m12:Time>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>");
    });

    it('should handle M+M+A dose', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Time>morning</m12:Time>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Time>noon</m12:Time>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Time>evening</m12:Time>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>");
    });

    it('should handle A dose', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '0+0+0+0.5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Time>night</m12:Time>" +
            "<m12:Quantity>0.5</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>");
    });
});

describe('XMLGenerator140 N daglig', () => {

    before(loadSchema);

    it('should handle 1', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>"
        );
    });

    it('should handle 1;2', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>"
        );
    });

     it('should handle dag 1: 3 dag 2: 4 dose', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>" +
            "<m12:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>"
        );
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>" +
            "<m12:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>5</m12:Quantity>" +
            "</m12:Dose>" +
            "</m12:Day>"
        );
    });
});

describe('XMLGenerator140 PN', () => {

    before(loadSchema);
    it('should handle 1', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m12:Day>"
        );
    });

    it('should handle 1;2', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m12:Day>"
        );
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m12:Day>" +
            "<m12:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>5</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m12:Day>"
        );
    });

      it('should handle dag 1: 3 dag 2: 4 dose', () => {
        let generator = new XML140Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m12:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m12:Day>" +
            "<m12:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m12:Day>"
        );
    });

});
