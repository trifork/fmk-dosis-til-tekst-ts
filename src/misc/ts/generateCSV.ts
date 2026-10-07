import { Dosage, DosageV2, Factory, LongTextConverter, ShortTextConverter } from "../../main/ts";
import { DefaultDosageRendererFactory } from "../../main/ts/dosagerenderer/DefaultDosageRendererFactory";
import { OldToNewDosageConverter } from "../../main/ts/helpers/OldToNewDosageConverter";
import { readFile } from "node:fs/promises";
import { parseArgs } from "node:util";
import { createWriteStream } from "node:fs";
import type { Writable } from "node:stream";

const longTextExamples: Dosage[] = [
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "endDate": "2019-01-19", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "NightDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "endDate": "2019-01-19", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NoonDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NightDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "TimedDoseWrapper", "time": { "hour": 8, "minute": 0, "second": 0 }, "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "TimedDoseWrapper", "time": { "hour": 12, "minute": 30, "second": 0 }, "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "TimedDoseWrapper", "time": { "hour": 12, "minute": 30, "second": 0 }, "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "TimedDoseWrapper", "time": { "hour": 3, "minute": 1, "second": 0 }, "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "TimedDoseWrapper", "time": { "hour": 21, "minute": 1, "second": 0 }, "doseQuantity": 4, "isAccordingToNeed": false }, { "type": "TimedDoseWrapper", "time": { "hour": 3, "minute": 1, "second": 0 }, "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "TimedDoseWrapper", "time": { "hour": 15, "minute": 1, "second": 0 }, "doseQuantity": 3, "isAccordingToNeed": false }, { "type": "TimedDoseWrapper", "time": { "hour": 9, "minute": 1, "second": 0 }, "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NightDoseWrapper", "doseQuantity": 5, "isAccordingToNeed": false }, { "type": "NoonDoseWrapper", "doseQuantity": 6, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 7, "isAccordingToNeed": false }, { "type": "MorningDoseWrapper", "doseQuantity": 8, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }, { "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }, { "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }, { "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2018-12-04", "endDate": "2018-12-04", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2018-12-04", "endDate": "2018-12-04", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NightDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2020-08-27", "endDate": "2020-09-02", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "supplText": "tages med rigeligt vand", "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NightDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 4, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 0.5, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 4, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1.5, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NoonDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NoonDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "NoonDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 4, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "EveningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "EveningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 0, "allDoses": [{ "type": "EveningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "endDate": "2020-11-01", "structures": [{ "iterationInterval": 0, "startDate": "2020-10-27", "endDate": "2020-11-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "endDate": "2020-11-01", "structures": [{ "iterationInterval": 0, "startDate": "2020-10-27", "endDate": "2020-11-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 0, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 0, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "startDate": "2020-10-27", "endDate": "2020-11-02", "structures": [{ "iterationInterval": 0, "startDate": "2020-10-27", "endDate": "2020-11-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "startDate": "2020-10-27", "structures": [{ "iterationInterval": 0, "startDate": "2020-10-27", "endDate": "2020-11-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "startDate": "2020-10-27", "endDate": "2020-11-01", "structures": [{ "iterationInterval": 0, "startDate": "2020-10-27", "endDate": "2020-11-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "endDate": "2020-11-30", "structures": [{ "iterationInterval": 0, "startDate": "2020-10-27", "endDate": "2020-11-30", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2020-10-27", "endDate": "2020-11-30", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "endDate": "2021-11-01", "structures": [{ "iterationInterval": 0, "startDate": "2021-10-25", "endDate": "2021-11-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "startDate": "2021-10-18", "structures": [{ "iterationInterval": 0, "startDate": "2021-10-25", "endDate": "2021-11-05", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2021-10-25", "endDate": "2021-11-06", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 14, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NoonDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "NoonDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "NoonDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 4, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "EveningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2020-01-22", "endDate": "2020-01-26", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }, { "iterationInterval": 2, "startDate": "2020-01-27", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2020-01-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }] }] }, { "iterationInterval": 2, "startDate": "2020-01-23", "endDate": "2020-01-26", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "plaster", "unitPlural": "plastre" }, "structures": [{ "iterationInterval": 3, "startDate": "2020-06-30", "endDate": "2020-07-29", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }, { "iterationInterval": 4, "startDate": "2020-07-30", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2020-10-27", "endDate": "2020-11-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }, { "iterationInterval": 7, "startDate": "2020-11-02", "endDate": "2020-12-09", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 5, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 4, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2018-12-04", "endDate": "2018-12-10", "days": [] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2019-11-15", "endDate": "2020-05-27", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }, { "iterationInterval": 1, "startDate": "2020-06-01", "endDate": "2020-07-22", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }, { "iterationInterval": 1, "startDate": "2020-05-28", "endDate": "2020-05-31", "days": [] }] } },
    { "freeText": { "startDate": "2018-12-04", "text": "1,5 tabl om morgenen" } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 14, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 21, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 21, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 3, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 4, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 4, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 0, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }, { "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 0, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }, { "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-04-18", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "TimedDoseWrapper", "time": { "hour": 10, "minute": 0, "second": 0 }, "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "NoonDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "ml", "unitPlural": "ml" }, "structures": [{ "iterationInterval": 2, "startDate": "2018-12-04", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "TimedDoseWrapper", "time": { "hour": 8, "minute": 0, "second": 0 }, "doseQuantity": 5, "isAccordingToNeed": false }, { "type": "TimedDoseWrapper", "time": { "hour": 12, "minute": 0, "second": 0 }, "doseQuantity": 10, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2020-01-22", "endDate": "2020-01-26", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2020-01-22", "endDate": "2020-01-26", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }, { "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "endDate": "2020-01-25", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }, { "dayNumber": 6, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-01-22", "endDate": "2021-03-01", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-01-22", "endDate": "2021-01-25", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-01-22", "endDate": "2021-01-22", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-01-22", "endDate": "2021-03-01", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-01-22", "endDate": "2021-03-01", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "startDate": "2020-01-22", "endDate": "2020-04-01", "structures": [{ "iterationInterval": 0, "startDate": "2020-01-22", "endDate": "2020-01-24", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }, { "iterationInterval": 7, "startDate": "2020-01-25", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "endDate": "2020-03-01", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "supplText": "Bemærkninger til ugeskema", "startDate": "2020-01-22", "endDate": "2020-03-01", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "startDate": "2020-01-22", "endDate": "2020-04-01", "structures": [{ "iterationInterval": 0, "startDate": "2020-01-22", "endDate": "2020-01-24", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }, { "iterationInterval": 7, "startDate": "2020-01-25", "days": [{ "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 6, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unit": "mg" }, "startDate": "2020-01-22", "endDate": "2020-04-01", "structures": [{ "iterationInterval": 7, "startDate": "2020-01-22", "endDate": "2020-01-24", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 15, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 15, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "ml", "unitPlural": "ml" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-04-13", "endDate": "2019-04-15", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "NoonDoseWrapper", "doseQuantity": 2.5, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "NoonDoseWrapper", "doseQuantity": 2.5, "isAccordingToNeed": false }] }] }] } },
];

const shortTextExamples: Dosage[] = [
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 1, "startDate": "2019-04-18", "endDate": "2019-04-23", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": true }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2020-08-27", "endDate": "2020-09-02", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 2, "startDate": "2026-06-03", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "ml", "unitPlural": "ml" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-04-13", "endDate": "2019-04-15", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "NoonDoseWrapper", "doseQuantity": 2.5, "isAccordingToNeed": false }] }, { "dayNumber": 3, "allDoses": [{ "type": "NoonDoseWrapper", "doseQuantity": 2.5, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2026-06-03", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "supplText": "suppl tekst", "startDate": "2026-06-03", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "NightDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "supplText": "test af suppl", "startDate": "2026-06-03", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "supplText": "test af suppl", "startDate": "2026-06-03", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 2, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }, { "dayNumber": 4, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-12-01", "endDate": "2021-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-12-01", "endDate": "2021-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 30, "startDate": "2021-12-01", "endDate": "2022-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 30, "startDate": "2021-12-01", "endDate": "2021-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 30, "startDate": "2021-12-01", "endDate": "2022-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 30, "startDate": "2021-12-01", "endDate": "2021-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 14, "startDate": "2021-12-01", "endDate": "2022-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 14, "startDate": "2021-12-01", "endDate": "2021-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 10, "startDate": "2021-12-01", "endDate": "2022-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 10, "startDate": "2021-12-01", "endDate": "2021-12-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2026-06-03", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-09-01", "endDate": "2019-09-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }, { "iterationInterval": 1, "startDate": "2019-09-02", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2019-09-01", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2016-01-13", "endDate": "2020-06-07", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "EveningDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }, { "iterationInterval": 1, "startDate": "2020-06-08", "endDate": "2022-06-08", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "NightDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2020-06-01", "endDate": "2020-06-07", "days": [] }, { "iterationInterval": 5, "startDate": "2020-06-08", "endDate": "2022-06-08", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "NightDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2016-01-13", "endDate": "2016-01-13", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }, { "iterationInterval": 1, "startDate": "2020-06-08", "endDate": "2022-06-08", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "NightDoseWrapper", "doseQuantity": 2, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2016-01-13", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2016-01-13", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 0.5, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2016-01-13", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "PlainDoseWrapper", "doseQuantity": 0.5, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 7, "startDate": "2021-10-25", "endDate": "2021-10-25", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2021-10-25", "endDate": "2021-10-25", "days": [] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, "startDate": "2021-10-25", "endDate": "2021-10-25", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 14, "startDate": "2021-10-25", "endDate": "2021-10-25", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 1, "isAccordingToNeed": false }, { "type": "EveningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } }
];


const miscExamples: Dosage[] = [
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, supplText: "[Single period longer than dosage days]", "startDate": "2020-08-27", "endDate": "2020-09-02", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    { "structures": { "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [{ "iterationInterval": 0, supplText: "[Single period - no endDate]", "startDate": "2020-08-27", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }] } },
    {
        "structures": {
            "unitOrUnits": { "unitSingular": "tablet", "unitPlural": "tabletter" }, "structures": [
                { "iterationInterval": 0, supplText: "[Two periods - first longer than dosage days]", "startDate": "2020-08-27", "endDate": "2020-09-02", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] },
                { "iterationInterval": 0, "startDate": "2020-09-03", "days": [{ "dayNumber": 1, "allDoses": [{ "type": "MorningDoseWrapper", "doseQuantity": 3, "isAccordingToNeed": false }] }] }
            ], "isPartOfMultiPeriodDosage": true
        }
    },
]

export async function main() {
    const { values, positionals } = parseArgs({
        options: {
            legacy: {
                type: "boolean",
                short: "l"
            },
            output: {
                type: "string",
                short: "o"
            },
            help: {
                type: "boolean",
                short: "h",
            }
        },
        allowPositionals: true,
    });

    if (values.help) {
        console.log(`
Usage:
  generateCSV [options] <input1.json> <input2.json> ..

Options:
  -o, --output <file>  Write output to a file instead of stdout
  -l, --legacy         Input is legacy dosage json. Produce comparison of old/new dosage rendering
  -h, --help           Show this help
`);

        process.exit(0);
    }

    const filenames = positionals;

    const output = getOutput(values.output);

    const legacy = !!values.legacy;

    await generate(output, legacy, filenames);

    if (output !== process.stdout) {
        output.end();
    }
}

async function generate(output: Writable, legacy: boolean, filenames: string[]) {
    if (legacy) {
        output.write(`${escapeCsvValue("Kort oversættelse - gammel")},${escapeCsvValue("Kort oversættelse - ny")},${escapeCsvValue("Lang oversættelse - gammel")},${escapeCsvValue("Lang oversættelse - ny")},${escapeCsvValue("json - kun DosagePeriod[]")}\n`);
    } else {
        output.write(`${escapeCsvValue("Kort oversættelse")},${escapeCsvValue("Lang oversættelse")},${escapeCsvValue("json - kun DosagePeriod[]")}\n`);
    }

    for (const filename of filenames) {
        const contents = await readFile(filename, "utf-8");
        if (legacy) {
            const dosages = JSON.parse(contents) as Dosage[];
            await generateCompareToLegacyCSV(output, dosages);
        } else {
            const dosages = JSON.parse(contents) as DosageV2[];
            await generateCSV(output, dosages);
        }
    }
}

function getOutput(output?: string): Writable {
    return output
        ? createWriteStream(output, { encoding: "utf8" })
        : process.stdout;
}

async function generateCompareToLegacyCSV(output: Writable, dosages: Dosage[]) {
    const oldLongTextConverter = new LongTextConverter();
    const newLongTextConverter = new DefaultDosageRendererFactory().getDosageRenderer({ html: false, oneLine: false });

    const oldShortTextConverter = new ShortTextConverter();
    const newShortTextConverter = new DefaultDosageRendererFactory().getDosageRenderer({ html: false, oneLine: true });

    dosages.forEach(async (dosage, index) => {
        const oldLongTextTranslation = oldLongTextConverter.convert(dosage);
        const oldShortTextTranslation = oldShortTextConverter.convert(dosage, undefined, 400);

        const newDosage = new OldToNewDosageConverter().convertDosage(dosage);

        const newShortTextTranslation = newShortTextConverter.render(newDosage);
        const newLongTextTranslation = newLongTextConverter.render(newDosage);

        let dosageJson: string;
        if (newDosage.DosagePeriod) {
            dosageJson = formatJson(newDosage.DosagePeriod);
        } else if (newDosage.AdministrationAccordingToSchemaInLocalSystem) {
            dosageJson = formatJson(newDosage.AdministrationAccordingToSchemaInLocalSystem);
        } else if (newDosage.FreeText) {
            dosageJson = formatJson(newDosage.FreeText);
        } else {
            dosageJson = "-";
        }

        await output.write(`${escapeCsvValue(oldShortTextTranslation)},${escapeCsvValue(newShortTextTranslation)},${escapeCsvValue(oldLongTextTranslation)},${escapeCsvValue(newLongTextTranslation)},${escapeCsvValue(dosageJson)}\n`);
    });
}

async function generateCSV(output: Writable, dosages: DosageV2[]) {
    const newLongTextConverter = new DefaultDosageRendererFactory().getDosageRenderer({ html: false, oneLine: false });
    const newShortTextConverter = new DefaultDosageRendererFactory().getDosageRenderer({ html: false, oneLine: true });

    dosages.forEach(async (dosage, index) => {
        const newShortTextTranslation = newShortTextConverter.render(dosage);
        const newLongTextTranslation = newLongTextConverter.render(dosage);

        let dosageJson: string;
        if (dosage.DosagePeriod) {
            dosageJson = formatJson(dosage.DosagePeriod);
        } else if (dosage.AdministrationAccordingToSchemaInLocalSystem) {
            dosageJson = formatJson(dosage.AdministrationAccordingToSchemaInLocalSystem);
        } else if (dosage.FreeText) {
            dosageJson = formatJson(dosage.FreeText);
        } else {
            dosageJson = "-";
        }

        await output.write(`${escapeCsvValue(newShortTextTranslation)},${escapeCsvValue(newLongTextTranslation)},${escapeCsvValue(dosageJson)}\n`);
    });
}

function formatJson(object: unknown) {
    const json = JSON.stringify(object, null, 4);
    // Remove quotes around keys to save space: 
    return json.replace(/"([A-Za-z0-9]+)":/g, "$1:");
}

function escapeCsvValue(value: unknown): string {
    return `"${(value ? String(value) : "").replace(/"/g, '""')}"`;
}



main();