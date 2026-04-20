
import { assert, expect } from 'chai';

import { XML160Generator, DosagePeriod } from "../../../main/ts/index";

import * as xmlvalidator from 'xsd-schema-validator';
import { formatXml } from '../formatXml';

const beginDate = new Date(2010, 0, 1);
const endDate = new Date(2110, 0, 1);

function pokeDummyPrecondition(xml: string) {
    return xml.replace(">", "><Precondition><ValidFrom>2026-04-15</ValidFrom></Precondition>");
}

async function validateXml(xml: string) {
    const xmlWithPrecondition = pokeDummyPrecondition(xml);
    const result = await xmlvalidator.validateXML('<?xml version="1.0" encoding="UTF-8"?>' + xmlWithPrecondition, 'target/fmk-schemas/schemas/fmk-1.6.0-all-types.xsd');
    assert.strictEqual(result.valid, true);
}

function expectFixed(xml: string) {
    expect(xml).to.contain("<Fixed>")
        .and.to.contain("</Fixed>")
        .and.not.to.contain("<PRN>")
        .and.not.to.contain("</PRN>");
}

function expectAccordingToNeed(xml: string) {
    expect(xml).to.contain("<PRN>")
        .and.to.contain("</PRN>")
        .and.not.to.contain("<Fixed>")
        .and.not.to.contain("</Fixed>");
    ;
}

describe('XML160Generator M+M+A+N', () => {

    it('should handle M+M+A+N dose, testing entire xml structure', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3+4', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(formatXml(xml)).to.equal(`<Dosage xmlns="http://fmk-teknik.dk/160">
    <UnitTexts>
        <Singular>tablet</Singular>
        <Plural>tabletter</Plural>
    </UnitTexts>
    <DosagePeriod>
        <PeriodLength>36525</PeriodLength>
        <Fixed>
            <Instruction>
                <FreeText>tages med rigeligt vand</FreeText>
            </Instruction>
            <IterationInterval>1</IterationInterval>
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimeOfDay>morning</TimeOfDay>
                    <Quantity>1</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>noon</TimeOfDay>
                    <Quantity>2</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>evening</TimeOfDay>
                    <Quantity>3</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>night</TimeOfDay>
                    <Quantity>4</Quantity>
                </Dose>
            </Day>
        </Fixed>
    </DosagePeriod>
</Dosage>`);

        await validateXml(xml);
    });

    it('should handle M dose without enddate', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, undefined)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(formatXml(xml)).to.equal(`<Dosage xmlns="http://fmk-teknik.dk/160">
    <UnitTexts>
        <Singular>tablet</Singular>
        <Plural>tabletter</Plural>
    </UnitTexts>
    <DosagePeriod>
        <Fixed>
            <Instruction>
                <FreeText>tages med rigeligt vand</FreeText>
            </Instruction>
            <IterationInterval>1</IterationInterval>
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimeOfDay>morning</TimeOfDay>
                    <Quantity>1</Quantity>
                </Dose>
            </Day>
        </Fixed>
    </DosagePeriod>
</Dosage>`);
        expectFixed(xml)
        await validateXml(xml);
    });


    it('should handle M dose', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimeOfDay>morning</TimeOfDay>
                    <Quantity>1</Quantity>
                </Dose>
            </Day>`);
        expectFixed(xml);
        await validateXml(xml);
    });

    it('should handle M+M dose', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2', 1, beginDate, endDate)], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimeOfDay>morning</TimeOfDay>
                    <Quantity>1</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>noon</TimeOfDay>
                    <Quantity>2</Quantity>
                </Dose>
            </Day>`);
        expectFixed(xml);
        await validateXml(xml);
    });

    it('should handle M+M+A dose', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '1+2+3', 1, beginDate, endDate)], 'tabletter', 'tages med rigeligt vand');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimeOfDay>morning</TimeOfDay>
                    <Quantity>1</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>noon</TimeOfDay>
                    <Quantity>2</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>evening</TimeOfDay>
                    <Quantity>3</Quantity>
                </Dose>
            </Day>`);
        expectFixed(xml);
        await validateXml(xml);
    });

    it('should handle A dose', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('M+M+A+N', '0+0+0+0.5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimeOfDay>night</TimeOfDay>
                    <Quantity>0.5</Quantity>
                </Dose>
            </Day>`);
        expect(xml).to.not.contain("morning").and.not.contain("noon").and.not.contain("evening");
        expectFixed(xml);
        await validateXml(xml);
    });
});

describe('XML160Generator N daglig', () => {

    it('should handle 1', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('N daglig', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>1</Quantity>
                </Dose>
            </Day>`);
        expectFixed(xml);
        await validateXml(xml);
    });

    it('should handle 1;2', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('N daglig', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>1</Quantity>
                </Dose>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>2</Quantity>
                </Dose>
            </Day>`);
        expectFixed(xml);
        await validateXml(xml);
    });


    it('should handle dag 1: 3 dag 2: 4 dose', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>3</Quantity>
                </Dose>
            </Day>
            <Day>
                <Index>2</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>4</Quantity>
                </Dose>
            </Day>`);
        expectFixed(xml);
        await validateXml(xml);
    });


    it('should handle dag 1: 2;3 dag 2: 4;5 dose', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('N daglig', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>2</Quantity>
                </Dose>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>3</Quantity>
                </Dose>
            </Day>
            <Day>
                <Index>2</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>4</Quantity>
                </Dose>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>5</Quantity>
                </Dose>
            </Day>`);
        expectFixed(xml);
        await validateXml(xml);
    });
});

describe('XML160Generator PN', () => {

    it('should handle 1', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('PN', '1', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>1</Quantity>
                </Dose>
            </Day>`);

        expectAccordingToNeed(xml);
        await validateXml(xml);
    });

    it('should handle 1;2', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('PN', '1;2', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>1</Quantity>
                </Dose>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>2</Quantity>
                </Dose>
            </Day>`);
        expectAccordingToNeed(xml);
        await validateXml(xml);
    });


    it('should handle dag 1: 3 dag 2: 4 dose', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>3</Quantity>
                </Dose>
            </Day>
            <Day>
                <Index>2</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>4</Quantity>
                </Dose>
            </Day>`);
        expectAccordingToNeed(xml);
        await validateXml(xml);
    });
});

describe('XML160Generator Multiperiode', () => {

    it('should handle {M+M+A+N}{N daglig}{PN} dose, testing entire xml structure', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([
            new DosagePeriod('M+M+A+N', '1+2+3+4', 1, new Date(2010, 0, 1), new Date(2010, 0, 10)),
            new DosagePeriod('N daglig', '1', 1, new Date(2010, 0, 11), new Date(2010, 0, 20)),
            new DosagePeriod('PN', 'dag 1: 3 dag 2: 4', 2, new Date(2010, 0, 21), new Date(2010, 0, 30))
        ], 'tablet', 'tabletter', 'tages med rigeligt vand');
        expect(formatXml(xml)).to.equal(`<Dosage xmlns="http://fmk-teknik.dk/160">
    <UnitTexts>
        <Singular>tablet</Singular>
        <Plural>tabletter</Plural>
    </UnitTexts>
    <DosagePeriod>
        <PeriodLength>10</PeriodLength>
        <Fixed>
            <Instruction>
                <FreeText>tages med rigeligt vand</FreeText>
            </Instruction>
            <IterationInterval>1</IterationInterval>
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimeOfDay>morning</TimeOfDay>
                    <Quantity>1</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>noon</TimeOfDay>
                    <Quantity>2</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>evening</TimeOfDay>
                    <Quantity>3</Quantity>
                </Dose>
                <Dose>
                    <TimeOfDay>night</TimeOfDay>
                    <Quantity>4</Quantity>
                </Dose>
            </Day>
        </Fixed>
    </DosagePeriod>
    <DosagePeriod>
        <PeriodLength>10</PeriodLength>
        <Fixed>
            <Instruction>
                <FreeText>tages med rigeligt vand</FreeText>
            </Instruction>
            <IterationInterval>1</IterationInterval>
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>1</Quantity>
                </Dose>
            </Day>
        </Fixed>
    </DosagePeriod>
    <DosagePeriod>
        <PeriodLength>10</PeriodLength>
        <PRN>
            <Instruction>
                <FreeText>tages med rigeligt vand</FreeText>
            </Instruction>
            <IterationInterval>2</IterationInterval>
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>3</Quantity>
                </Dose>
            </Day>
            <Day>
                <Index>2</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>4</Quantity>
                </Dose>
            </Day>
        </PRN>
    </DosagePeriod>
</Dosage>`);

        await validateXml(xml);
    });

    it('should handle dag 1: 2;3 dag 2: 4;5 dose', async () => {
        const generator = new XML160Generator();
        const xml = generator.generateXml([new DosagePeriod('PN', 'dag 1: 2;3 dag 2: 4;5', 1, beginDate, endDate)], 'tablet', 'tabletter');
        expect(formatXml(xml)).to.contain(`
            <Day>
                <Index>1</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>2</Quantity>
                </Dose>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>3</Quantity>
                </Dose>
            </Day>
            <Day>
                <Index>2</Index>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>4</Quantity>
                </Dose>
                <Dose>
                    <TimesPerDay>1</TimesPerDay>
                    <Quantity>5</Quantity>
                </Dose>
            </Day>`);
        expectAccordingToNeed(xml);
        await validateXml(xml);
    });
});
