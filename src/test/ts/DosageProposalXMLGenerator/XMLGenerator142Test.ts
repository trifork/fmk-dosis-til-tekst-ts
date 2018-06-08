/// <reference path="../../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../../node_modules/@types/node/index.d.ts" />

import { expect, assert } from 'chai';

import { XML142Generator, DosagePeriod } from "../../../main/ts/index";
import * as fs from 'ts-node';
import * as xsd from 'libxml-xsd';

let schema;
let beginDate = new Date(2010, 0, 1);
let endDate = new Date(2110, 0, 1);


describe('XMLGenerator142 M+M+A+N', () => {

    it('should handle M+M+A+N dose, testing entire xml structure', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3+4', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.equal("<m13:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2013/06/01 ../../../2013/06/01/DosageForRequest.xsd\" " +
            "xmlns:m13=\"http://www.dkma.dk/medicinecard/xml.schema/2013/06/01\" " +
            "xmlns:m12=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m13:Structures>" +
            "<m13:UnitTexts source=\"Doseringsforslag\">" +
            "<m12:Singular>tablet</m12:Singular>" +
            "<m12:Plural>tabletter</m12:Plural>" +
            "</m13:UnitTexts>" +
            "<m13:Structure>" +
            "<m13:IterationInterval>1</m13:IterationInterval>" +
            "<m13:StartDate>2010-01-01</m13:StartDate>" +
            "<m13:EndDate>2110-01-01</m13:EndDate>" +
            "<m13:SupplementaryText>tages med rigeligt vand</m13:SupplementaryText>" +
            "<m13:Day>" +
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
            "</m13:Day>" +
            "</m13:Structure>" +
            "</m13:Structures>" +
            "</m13:Dosage>");
    });

    it('should handle M dose', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Time>morning</m12:Time>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>");
    });

    
    it('should handle M dose without enddate', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, undefined)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.contain(
            "<m13:Structure>" +
            "<m13:IterationInterval>1</m13:IterationInterval>" +
            "<m13:StartDate>2010-01-01</m13:StartDate>" +
            "<m13:DosageEndingUndetermined/>" +
            "<m13:SupplementaryText>tages med rigeligt vand</m13:SupplementaryText>");
    });

    it('should handle M+M dose', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Time>morning</m12:Time>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Time>noon</m12:Time>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>");
    });

    it('should handle M+M+A dose', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.contain(
            "<m13:Day>" +
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
            "</m13:Day>");
    });

    it('should handle A dose', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('M+M+A+N', '0+0+0+0.5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Time>night</m12:Time>" +
            "<m12:Quantity>0.5</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>");
    });
});

describe('XMLGenerator142 N daglig', () => {

    it('should handle 1', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>"
        );
    });

    it('should handle 1;2', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>"
        );
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>" +
            "<m13:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>5</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>"
        );
    });

    it('should handle dag 1: 3 dag 2: 4 dose', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>" +
            "<m13:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>"
        );
    });

});

describe('XMLGenerator142 PN', () => {

    it('should handle 1', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m13:Day>"
        );
    });

    it('should handle 1;2', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m13:Day>"
        );
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>2</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m13:Day>" +
            "<m13:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "<m12:Dose>" +
            "<m12:Quantity>5</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m13:Day>"
        );
    });

    it('should handle dag 1: 3 dag 2: 4 dose', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m13:Day>" +
            "<m13:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m13:Day>"
        );
    });
});

describe('XMLGenerator142 Multiperiode', () => {

    it('should handle {M+M+A+N}{N daglig}{PN} dose, testing entire xml structure', () => {
        let generator = new XML142Generator();
        let xml = generator.generateXml([
            new DosagePeriod('M+M+A+N', '1+2+3+4', 1, new Date(2010, 0, 1), new Date(2010, 0, 10)),
            new DosagePeriod('N daglig', '1', 1, new Date(2010, 0, 11), new Date(2010, 0, 20)),
            new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 2, new Date(2010, 0, 21), new Date(2010, 0, 30))
        ], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.equal("<m13:Dosage " +
            "xsi:schemaLocation=\"http://www.dkma.dk/medicinecard/xml.schema/2013/06/01 ../../../2013/06/01/DosageForRequest.xsd\" " +
            "xmlns:m13=\"http://www.dkma.dk/medicinecard/xml.schema/2013/06/01\" " +
            "xmlns:m12=\"http://www.dkma.dk/medicinecard/xml.schema/2012/06/01\" " +
            "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\">" +
            "<m13:Structures>" +
            "<m13:UnitTexts source=\"Doseringsforslag\">" +
            "<m12:Singular>tablet</m12:Singular>" +
            "<m12:Plural>tabletter</m12:Plural>" +
            "</m13:UnitTexts>" +

            "<m13:Structure>" +
            "<m13:IterationInterval>1</m13:IterationInterval>" +
            "<m13:StartDate>2010-01-01</m13:StartDate>" +
            "<m13:EndDate>2010-01-10</m13:EndDate>" +
            "<m13:SupplementaryText>tages med rigeligt vand</m13:SupplementaryText>" +
            "<m13:Day>" +
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
            "</m13:Day>" +
            "</m13:Structure>" +

            "<m13:Structure>" +
            "<m13:IterationInterval>1</m13:IterationInterval>" +
            "<m13:StartDate>2010-01-11</m13:StartDate>" +
            "<m13:EndDate>2010-01-20</m13:EndDate>" +
            "<m13:SupplementaryText>tages med rigeligt vand</m13:SupplementaryText>" +
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>1</m12:Quantity>" +
            "</m12:Dose>" +
            "</m13:Day>" +
            "</m13:Structure>" +

            "<m13:Structure>" +
            "<m13:IterationInterval>2</m13:IterationInterval>" +
            "<m13:StartDate>2010-01-21</m13:StartDate>" +
            "<m13:EndDate>2010-01-30</m13:EndDate>" +
            "<m13:SupplementaryText>tages med rigeligt vand</m13:SupplementaryText>" +
            "<m13:Day>" +
            "<m12:Number>1</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>3</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m13:Day>" +
            "<m13:Day>" +
            "<m12:Number>2</m12:Number>" +
            "<m12:Dose>" +
            "<m12:Quantity>4</m12:Quantity>" +
            "<m12:IsAccordingToNeed/>" +
            "</m12:Dose>" +
            "</m13:Day>" +
            "</m13:Structure>" +


            "</m13:Structures>" +
            "</m13:Dosage>");
    });
});
