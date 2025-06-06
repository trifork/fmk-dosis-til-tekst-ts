export enum DosageType {

    AccordingToNeed = "AccordingToNeed", // ”efter behov”: En dosering der udelukkende gives efter behov. Doseringen kan evt. have en begrænsning på en maksimal dagsdosis.
    Temporary = "Temporary", // ”temporær”: En dosering med en slutdato eller en dosering der ikke er gentaget (elementet NotIterated er anvendt i stedet for IterationInterval). Desuden skal doseringen ikke helt eller delivist gives efter behov.
    Fixed = "Fixed", 	   // ”fast”: En itereret dosering uden slutdato, der ikke helt eller delvist gives efter behov.
    OneTime = "OneTime",   // "engangs”: En dosering med kun en enkelt dosis, der ikke gives efter behov.
    Combined = "Combined", // ”kombineret”: En dosering der både gives (temporært eller fast) og efter behov.
    Unspecified = "Unspecified" // ”ikke angivet”: Anvendes for doseringer oprettet gennem versioner før FMK 1.3 / 1.4, og hvor det ikke er muligt at bestemme typen, dvs. at doseringen er som fritekst eller som ”efter skema i lokalt system”. Der kan ikke oprettes doseringer med typen ”ikke angivet” via FMK 1.3 / 1.4.

}