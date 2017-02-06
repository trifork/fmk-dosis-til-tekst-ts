Dosis-til-tekst-ts
==============
Dosis-til-tekst-ts er en javascript komponent, der kan generere hhv. korte og lange doseringstekster, givet en struktureret repræsentation af en FMK dosering. Dosis-til-tekst-ts er en typescript-omskrivning af den eksisterende java-udgave til brug for Fælles Medicinkort klienter. Vha. omskrivningen, er det nu muligt at anvende dosis-til-tekst vha. javascript og typescript, d.v.s. også fra eksempelvis webbaserede FMK-klienter. API'et er stort set opbygget som den gamle java udgave af dosis-til-tekst, specielt vedr. wrapper-klasserne, der anvendes til at definere doseringsstrukturerne.

Anvendelse fra javascript
--
Komponenten er tilgængelig via npmjs.org vha. npm (Node Package Manager, kan hentes fra https://www.npmjs.com/package/npm). Den hentes vha. `npm i fmk-dosis-til-tekst-ts`. Selve js-filen kan herefter findes under node_modules/fmk-dosis-til-tekst-ts/target/dosistiltekst.js. Ved eksempelvis at inkludere dosistiltekst.js filen på en html-side, kan man tilgå komponentens funktionalitet. 

I eksemplet herunder, oprettes 3 doseringer, og den korte og den lange doseringstekst vises for hver af de 3 doseringer:

- en lokaladministreret dosering, med doseringsstart 05.01.2017, og uden slutdato.
- en fritekstdosering , ligeledes med doseringsstart 05.01.2017, og uden slutdato.
- en struktureret dosering med en enkelt periode, doseringsstart 05.01.2017 og -slut den 10.01.2017. Doseringen gentages hver 2. dag, 1. dag tages 2 tabletter om morgenen, 2. dag tages mellem 1 og 3 tabletter om middagen efter behov.

Efter det fulde eksempel, gennemgås de enkelte dele mere detaljeret.

Eksempel
-------------
```
<!DOCTYPE html>
<html>

<script src="./node_modules/fmk-dosis-til-tekst-ts/target/dosistiltekst.js"></script>

<body>
    <h1>Dosis-til-tekst testpage</h1>

    AdministrationAccordingToSchema:
    <p id="schema"></p>

    Freetext:
    <p id="freetext"></p>
    
    Structured:
    <p id="structured"></p>


    <script>
	    var shortTextConverter = dosistiltekst.Factory.getShortTextConverter();
	    var longTextConverter = dosistiltekst.Factory.getLongTextConverter();
	    var startdate = new dosistiltekst.DateOrDateTimeWrapper(
		    new Date(2017, 1, 5, 0, 0, 0, 0));
	    var enddate = new dosistiltekst.DateOrDateTimeWrapper(
		    new Date(2017, 1, 10, 0, 0, 0, 0));

	    // Example: administration according to schema
	    var localadmin = dosistiltekst.DosageWrapper.makeAccordingToSchemaDosage(
		    new dosistiltekst.AdministrationAccordingToSchemaWrapper(startdate));
	    var shorttext = shortTextConverter.convertWrapper(localadmin, 100);
	    var longtext = longTextConverter.convertWrapper(localadmin, 100);
	    document.getElementById("schema").innerHTML = "Short text: " + shorttext + "<br/>Long text: " + longtext;

    // Example: freetext dosage
    var freetext = dosistiltekst.DosageWrapper.makeFreeTextDosage(
	    new dosistiltekst.FreeTextWrapper(startdate, undefined, 
		    "Indtages dagligt med rigeligt væske"));
    shorttext = shortTextConverter.convertWrapper(freetext, 100);
    longtext = longTextConverter.convertWrapper(freetext, 100);
    document.getElementById("freetext").innerHTML = "Short text: " + shorttext + "<br/>Long text: " + longtext;

    // Example: structured dosage
    var unit = new dosistiltekst.UnitOrUnitsWrapper(undefined, 'tablet','tabletter');
    var days = [
        new dosistiltekst.DayWrapper(1, [
	        new dosistiltekst.MorningDoseWrapper(2, undefined, undefined, "2", undefined, undefined, false)
	        ]
	    ),
        new dosistiltekst.DayWrapper(2, [
	        new dosistiltekst.NoonDoseWrapper(undefined, 1, 3, undefined, "1", "3", false)
	        ])
    ];

    var structures = [
	    new dosistiltekst.StructureWrapper(2, 'tages med rigeligt væske', startdate, enddate, days)
	];
    var dosagestructures = dosistiltekst.DosageWrapper.makeStructuredDosage(
	    new dosistiltekst.StructuresWrapper(unit, structures));
    shorttext = shortTextConverter.convertWrapper(dosagestructures, 100);
    longtext = longTextConverter.convertWrapper(dosagestructures, 500);
    document.getElementById("structured").innerHTML = "Short text: " + shorttext + "<br/>Long text: " + longtext;

    // Combined
	var combined = dosistiltekst.CombinedTextConverter.convertWrapper(dosagestructures);
	document.getElementById("structuredCombined").innerHTML = "<ul><li>" + combined.getCombinedShortText() + "</li><li>" + combined.getCombinedLongText() + "</li><li>" + combined.getCombinedDailyDosis().getInterval().minimum + "-" +  combined.getCombinedDailyDosis().getInterval().maximum + "</li></ul>";
		
	// Iterate each period - in this case, only onemptied
	for(i = 0; i < combined.getPeriodTexts().length; i++) {
		var periodText = combined.getPeriodTexts()[i];
		// Each periodText is a tuple of three elements
		document.getElementById("structuredCombined").innerHTML += "<ul><li>" + periodText[0] + "</li><li>" + periodText[1] + "</li><li>" + periodText[2].getInterval().minimum + "-" +  periodText[2].getInterval().maximum + "</li></ul>";
	}

    </script>
</body>

</html>
```
Endelig er der også mulighed for, vha. CombinedTextConverter, at få både kort og lang doseringstekst såvel samlet for alle strukturerede perioder samt enkeltvist per periode, samt daglig dosis beregnet på en gang.


###Generel anvendelse
Konverteringsklasserne tilgås vha. flg. linjer:
```
var shortTextConverter = dosistiltekst.Factory.getShortTextConverter();
var longTextConverter = dosistiltekst.Factory.getLongTextConverter();

```
####Datoer
Datoer oprettes enten som en dato eller en dato/tid. I nedenstående eksempel oprettes først datoen 5. januar 2017, dernæst tidspunktet 12:20:25 den 5. januar 2017:
```
var startdate = new dosistiltekst.DateOrDateTimeWrapper(new Date(2017, 1, 5, 0, 0, 0, 0));
var startdatetime = new dosistiltekst.DateOrDateTimeWrapper(undefined, new Date(2017, 1, 5, 12, 20, 25, 0));
```
####Doseringer
Doseringer oprettes vha. DosageWrapper klassen, der opretter javascript objekter af de respektive typer, hhv. vha. metoderne `dosistiltekst.DosageWrapper.makeAccordingToSchemaDosage(), dosistiltekst.DosageWrapper.makeFreeTextDosage(),` samt `dosistiltekst.DosageWrapper.makeStructuredDosage()`.

###Lokal administrerede doseringer
Lokaladministrerede doseringer kan oprettes med start- og evt. slutdato. Hvis slutdato ikke findes, udelades dette argument blot:
```
var localadminWithoutEnddate = 
	dosistiltekst.DosageWrapper.makeAccordingToSchemaDosage(
		new dosistiltekst.AdministrationAccordingToSchemaWrapper(startdate));
var localadminWithEnddate = 
	dosistiltekst.DosageWrapper.makeAccordingToSchemaDosage(
		new dosistiltekst.AdministrationAccordingToSchemaWrapper(startdate, enddate));

```
###Fritekstdoseringer
Fritekstdoseringer kan ligeledes oprettes med start- og evt. slutdato. Hvis slutdato ikke findes, anvendes `undefined`:

```
var freetextWithoutEnddate = dosistiltekst.DosageWrapper.makeFreeTextDosage(
	    new dosistiltekst.FreeTextWrapper(startdate, undefined, "Indtages med rigeligt væske"));
var freetextWithEnddate = dosistiltekst.DosageWrapper.makeFreeTextDosage(
	    new dosistiltekst.FreeTextWrapper(startdate, enddate, "Indtages med rigeligt væske"));

```   
###Strukturerede doseringer
For strukturerede doseringer angives hhv. en doseringsenhed (unit) samt et antal doseringsperioder. Doseringsenheden kan enten oprettes med en fælles entals-/flertalsangivelse (første argument), eller separat entals- og flertalsangivelse, her et eksempel på separat angivelse:
```
var unit = new dosistiltekst.UnitOrUnitsWrapper(undefined, 'tablet','tabletter');
```
Herefter oprettes doseringsperioderne som et array af StructureWrapper's, med én structure per doseringsperiode, her f.eks. en itereret dosering, der gentages hver 2. dag, 'tages med rigeligt væske' som supplerende tekst, samt en start- og slutdato og et array af "doseringsdage":

```
 var structures = [
	    new dosistiltekst.StructureWrapper(2, 'tages med rigeligt væske', startdate, enddate, days)
	];
```
En "doseringsdag" angiver hvordan lægemidlet skal tages på den enkelte dag. En "doseringsdag", repræsenteret ved `DayWrapper` objekter, angiver et dagsnummer samt et array af enkelt-doseringer, som kan være enten en morgen, middag, aften, nat-dosering (`MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper`), dosering med tidspunkt (`DateOrDateTimeWrapper`) eller en daglig dosering (`PlainDoseWrapper`). Parametrene til eksempelvis MorningDoseWrapper er hhv. fast værdi, minimumværdi, maximumvære, 3 parametre der p.t. ikke anvendes (er medtaget af hensyn til bagudkompatibilitet med java-udgaven), samt angivelse af om enkeltdoseringen er efter behov. Herunder et eksempel på 2 doseringsdage, hver dag med et doseringselement, hhv. en morgen-dosering med 2 tabletter og en middagsdosering mellem 1 og 3 tabletter efter behov:
```
 var days = [
        new dosistiltekst.DayWrapper(1, [
	        new dosistiltekst.MorningDoseWrapper(2, undefined, undefined, undefined, undefined, undefined, false)
	        ]
	    ),
        new dosistiltekst.DayWrapper(2, [
	        new dosistiltekst.NoonDoseWrapper(undefined, 1, 3, undefined, undefined, undefined, true)
	        ])
    ];
```

Afslutningsvis kædes enheder og doseringsperioder sammen vha. en StructuresWrapper (bemærk flertalsformen, ikke at forveksle med StructureWrapper), hvorefter converterne kaldes:
```
var dosagestructures = dosistiltekst.DosageWrapper.makeStructuredDosage(
	new dosistiltekst.StructuresWrapper(unit, structures));
shorttext = shortTextConverter.convertWrapper(dosagestructures, 100);
longtext = longTextConverter.convertWrapper(dosagestructures, 500);
```
Det sidste argument i kaldene til convertWrapper metoderne angiver max-længden af de genererede strenge.
Alternativt kan den kombinerede converter kaldes, jvf. ovenstående eksempel.

