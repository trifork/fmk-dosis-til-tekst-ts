/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />

import { expect, assert } from 'chai';
import { DailyDosisCalculator } from "../../main/ts/index";

describe('DailyDosisCalculator', () => {
    it('should handle json without adminAccordingToSchema', () => {

        var dosageStr = '{ "structures": { "unitOrUnits": { "unit": "stk" },' 
        + '"structures": [ { "iterationInterval": 1, "supplText": "mod smerter", "startDateOrDateTime": { "date": 1293836400000 }, "endDateOrDateTime": { "date": 1294959600000 }, ' 
        + '"days": [ { "dayNumber": 1, "allDoses": [ { "doseQuantity": 1, "doseQuantityString": "1", "isAccordingToNeed": false, "type": "MorningDoseWrapper" } ] '
                            +'}]}]}, "structured": true }';

        expect(DailyDosisCalculator.calculateStr(dosageStr).value).to.equal(1);
    });
});
