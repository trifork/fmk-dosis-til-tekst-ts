
import { expect } from 'chai';
import { DateOrDateTimeWrapper, DayWrapper, DosageWrapper, LongTextConverter, MorningDoseWrapper, StructuresWrapper, StructureWrapper, UnitOrUnitsWrapper } from "../../../main/ts/index";

describe('EmptyStructureConverterImpl', () => {

    // FMK-6211
    it('should return correct from/to', () => {
        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null, [new StructureWrapper(0, "", new DateOrDateTimeWrapper(new Date(2018, 11, 4), undefined), new DateOrDateTimeWrapper(new Date(2018, 11, 10), undefined), [], undefined)], false));
        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 4. dec. 2018 til d. 10. dec. 2018:\n" +
            "Bemærk: skal ikke anvendes i denne periode!");
    });

    // FMK-6211
    it('should return in correct sort-order', () => {

        const periode1 = new StructureWrapper(2, "", new DateOrDateTimeWrapper(new Date(2019, 10, 15), undefined), new DateOrDateTimeWrapper(new Date(2020, 4, 27), undefined), [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false)])], undefined);

        const emptyperiod = new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2020, 4, 28), undefined), new DateOrDateTimeWrapper(new Date(2020, 4, 31), undefined), [], undefined);

        const periode2 = new StructureWrapper(1, "", new DateOrDateTimeWrapper(new Date(2020, 5, 1), undefined), new DateOrDateTimeWrapper(new Date(2020, 6, 22), undefined), [
            new DayWrapper(1, [new MorningDoseWrapper(1, undefined, undefined, false)])], undefined);


        const dose = new DosageWrapper(undefined, undefined, new StructuresWrapper(new UnitOrUnitsWrapper(undefined, "tablet", "tabletter"),
            null, null,
            [periode1, periode2, emptyperiod], false));

        expect(LongTextConverter.getInstance().convertWrapper(dose)).to.equal(
            "Dosering fra d. 15. nov. 2019 til d. 27. maj 2020:\n" +
            "1 tablet morgen hver 2. dag\n\n" +

            "Dosering fra d. 28. maj 2020 til d. 31. maj 2020:\n" +
            "Bemærk: skal ikke anvendes i denne periode!\n\n" +

            "Dosering fra d. 1. juni 2020 til d. 22. juli 2020:\n" +
            "1 tablet hver morgen");
    });
});
