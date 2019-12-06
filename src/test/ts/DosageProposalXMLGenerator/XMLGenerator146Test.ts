/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../../node_modules/@types/node/index.d.ts" />

import { expect, assert } from 'chai';

import { XML146Generator, DosagePeriod} from "../../../main/ts/index";

import * as xmlvalidator from 'xsd-schema-validator';

let beginDate = new Date(2010, 0, 1);
let endDate = new Date(2110, 0, 1);

function validateAndExpect(xml: string): Chai.Assertion {

    xmlvalidator.validateXML('<?xml version="1.0" encoding="UTF-8"?>' + xml, '../schemas/fmk-1.4.6-all-types.xsd', function(err, result) {
        if(err) {
            
            console.error("err.Message: " + err.message);
            
            console.error("result.result: " + result.result + "\n");
            console.error("result.valid: " + result.valid + "\n");
            if(result.messages) { 
                console.error("result.messages:\n");
                result.messages.forEach( m => console.error(m)); 
            } 
            assert.isNull(err, "Validation errors: " + err + "\nXML: " + xml);
        }

        result.valid = true;
      });

    
    return expect(xml);
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

    it('should handle M+M+A+N dose, testing entire xml structure', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3+4', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
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

    
    it('should handle M dose without enddate', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, undefined)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        validateAndExpect(xml).to.contain(
            "<m16:Structure>" +
            "<m16:IterationInterval>1</m16:IterationInterval>" +
            "<m16:StartDate>2010-01-01</m16:StartDate>" +
            "<m16:DosageEndingUndetermined/>" +
            "<m16:SupplementaryText>tages med rigeligt vand</m16:SupplementaryText>");
        expectFixed(xml)
    });


    it('should handle M dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
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
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
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
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3', 1, beginDate, endDate)], 'tabletter', 'tages med rigeligt vand');
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
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '0+0+0+0.5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Time>night</m16:Time>" +
            "<m16:Quantity>0.5</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>");
        expect(xml).to.not.contain("morning").and.not.contain("noon").and.not.contain("evening");
        expectFixed(xml)
    });
});

describe('XML146Generator N daglig', () => {

    it('should handle 1', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
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
        let xml = generator.generateXml([new DosagePeriod('N daglig', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
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


    it('should handle dag 1: 3 dag 2: 4 dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>3</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>" +
            "<m16:Day>" +
            "<m16:Number>2</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>4</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>"
        );
        expectFixed(xml)
    });


    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
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

    it('should handle 1', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
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
        let xml = generator.generateXml([new DosagePeriod('PN', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
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


    it('should handle dag 1: 3 dag 2: 4 dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        validateAndExpect(xml).to.contain(
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>3</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>" +
            "<m16:Day>" +
            "<m16:Number>2</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>4</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>"
        );
        expectAccordingToNeed(xml);
    });


describe('XMLGenerator144 Multiperiode', () => {

    it('should handle {M+M+A+N}{N daglig}{PN} dose, testing entire xml structure', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([
            new DosagePeriod('M+M+A+N', '1+2+3+4', 1, new Date(2010, 0, 1), new Date(2010, 0, 10)),
            new DosagePeriod('N daglig', '1', 1, new Date(2010, 0, 11), new Date(2010, 0, 20)),
            new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 2, new Date(2010, 0, 21), new Date(2010, 0, 30))
        ], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.equal("<m16:Dosage " +
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
            "<m16:EndDate>2010-01-10</m16:EndDate>" +
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
            "<m16:StartDate>2010-01-11</m16:StartDate>" +
            "<m16:EndDate>2010-01-20</m16:EndDate>" +
            "<m16:SupplementaryText>tages med rigeligt vand</m16:SupplementaryText>" +
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>1</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>" +
            "</m16:Structure>" +
            "</m16:StructuresFixed>" +

            "<m16:StructuresAccordingToNeed>" +
            "<m16:Structure>" +
            "<m16:IterationInterval>2</m16:IterationInterval>" +
            "<m16:StartDate>2010-01-21</m16:StartDate>" +
            "<m16:EndDate>2010-01-30</m16:EndDate>" +
            "<m16:SupplementaryText>tages med rigeligt vand</m16:SupplementaryText>" +
            "<m16:Day>" +
            "<m16:Number>1</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>3</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>" +
            "<m16:Day>" +
            "<m16:Number>2</m16:Number>" +
            "<m16:Dose>" +
            "<m16:Quantity>4</m16:Quantity>" +
            "</m16:Dose>" +
            "</m16:Day>" +
            "</m16:Structure>" +

            "</m16:StructuresAccordingToNeed>" +
            "</m16:Dosage>");
    });
});

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML146Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
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
