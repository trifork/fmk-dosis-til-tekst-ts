
import { expect } from 'chai';
import { XML144Generator, DosagePeriod } from "../../../main/ts/index";
import * as xmlvalidator from 'xsd-schema-validator';

const beginDate = new Date(2010, 0, 1);
const endDate = new Date(2110, 0, 1);

function validateXml(xml: string): void {
    try {
        xmlvalidator.validateXML('<?xml version="1.0" encoding="UTF-8"?>' + xml, '../schemas/fmk-1.4.4-all-types.xsd');
    } catch (err) {
        console.error("Validation errors: " + err + "\nXML: " + xml);
        throw err;
    }
}


describe('XMLGenerator144 M+M+A+N', () => {

    it('should handle M+M+A+N dose, testing entire xml structure', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3+4', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.equal("<m15:Dosage " +
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
        validateXml(xml);
    });

    it('should handle M dose', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Time>morning</m15:Time>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>");
        validateXml(xml);
    });

    it('should handle M dose without enddate', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, undefined)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.contain(
            "<m15:Structure>" +
            "<m15:IterationInterval>1</m15:IterationInterval>" +
            "<m15:StartDate>2010-01-01</m15:StartDate>" +
            "<m15:DosageEndingUndetermined/>" +
            "<m15:SupplementaryText>tages med rigeligt vand</m15:SupplementaryText>");
        validateXml(xml);
    });

    it('should handle M+M dose', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.contain(
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
        validateXml(xml);
    });

    it('should handle M+M+A dose', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.contain(
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
        validateXml(xml);
    });

    it('should handle A dose', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '0+0+0+0.5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Time>night</m15:Time>" +
            "<m15:Quantity>0.5</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>");
        validateXml(xml);
    });
});

describe('XMLGenerator144 N daglig', () => {

    it('should handle 1', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('N daglig', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
        validateXml(xml);
    });

    it('should handle 1;2', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('N daglig', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
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
        validateXml(xml);
    });

    it('should handle dag 1: 3 dag 2: 4 dose', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>3</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>" +
            "<m15:Day>" +
            "<m15:Number>2</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>4</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
        validateXml(xml);
    });


    it('should handle dag 1: 2;3 dag 2: 4;5 dose', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
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
        validateXml(xml);
    });
});

describe('XMLGenerator144 PN', () => {

    it('should handle 1', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('PN', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "<m15:IsAccordingToNeed/>" +
            "</m15:Dose>" +
            "</m15:Day>"
        );
        validateXml(xml);
    });

    it('should handle 1;2', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('PN', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
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
        validateXml(xml);
    });


    it('should handle dag 1: 3 dag 2: 4 dose', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
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
            "</m15:Day>"
        );
        validateXml(xml);
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(xml).to.contain(
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
        validateXml(xml);
    });

});


describe('XMLGenerator144 Multiperiode', () => {

    it('should handle {M+M+A+N}{N daglig}{PN} dose, testing entire xml structure', async () => {
        const generator = new XML144Generator();
        const xml = generator.generateXml([
            new DosagePeriod('M+M+A+N', '1+2+3+4', 1, new Date(2010, 0, 1), new Date(2010, 0, 10)),
            new DosagePeriod('N daglig', '1', 1, new Date(2010, 0, 11), new Date(2010, 0, 20)),
            new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 2, new Date(2010, 0, 21), new Date(2010, 0, 30))
        ], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(xml).to.equal("<m15:Dosage " +
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
            "<m15:EndDate>2010-01-10</m15:EndDate>" +
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

            "<m15:Structure>" +
            "<m15:IterationInterval>1</m15:IterationInterval>" +
            "<m15:StartDate>2010-01-11</m15:StartDate>" +
            "<m15:EndDate>2010-01-20</m15:EndDate>" +
            "<m15:SupplementaryText>tages med rigeligt vand</m15:SupplementaryText>" +
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
            "<m15:Dose>" +
            "<m15:Quantity>1</m15:Quantity>" +
            "</m15:Dose>" +
            "</m15:Day>" +
            "</m15:Structure>" +

            "<m15:Structure>" +
            "<m15:IterationInterval>2</m15:IterationInterval>" +
            "<m15:StartDate>2010-01-21</m15:StartDate>" +
            "<m15:EndDate>2010-01-30</m15:EndDate>" +
            "<m15:SupplementaryText>tages med rigeligt vand</m15:SupplementaryText>" +
            "<m15:Day>" +
            "<m15:Number>1</m15:Number>" +
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
            "</m15:Day>" +
            "</m15:Structure>" +


            "</m15:Structures>" +
            "</m15:Dosage>");
        validateXml(xml);
    });
});
