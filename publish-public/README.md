Dosis-til-tekst-ts
==============
Dosis-til-tekst-ts er en javascript komponent, der kan 
- generere hhv. korte og lange doseringstekster, givet en struktureret repræsentation af en FMK dosering
- generere doserings-xml givet en LMS-doseringsforslag lignende repræsentation af doseringen, til brug ved FMK kald. Denne del af komponenten er beskrevet i et selvstændigt afsnit herunder.

Dosis-til-tekst-ts er en typescript-omskrivning af den eksisterende java-udgave til brug for Fælles Medicinkort klienter. Vha. omskrivningen, er det nu muligt at anvende dosis-til-tekst vha. javascript og typescript, d.v.s. også fra eksempelvis webbaserede FMK-klienter. API'et er stort set opbygget som den gamle java udgave af dosis-til-tekst, specielt vedr. wrapper-klasserne, der anvendes til at definere doseringsstrukturerne.

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
```HTML
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


### Generel anvendelse
Konverteringsklasserne tilgås vha. flg. linjer:
```javascript
var shortTextConverter = dosistiltekst.Factory.getShortTextConverter();
var longTextConverter = dosistiltekst.Factory.getLongTextConverter();

```
#### Datoer
Datoer oprettes enten som en dato eller en dato/tid. I nedenstående eksempel oprettes først datoen 5. januar 2017, dernæst tidspunktet 12:20:25 den 5. januar 2017:
```javascript
var startdate = new dosistiltekst.DateOrDateTimeWrapper(new Date(2017, 1, 5, 0, 0, 0, 0));
var startdatetime = new dosistiltekst.DateOrDateTimeWrapper(undefined, new Date(2017, 1, 5, 12, 20, 25, 0));
```
#### Doseringer
Doseringer oprettes vha. DosageWrapper klassen, der opretter javascript objekter af de respektive typer, hhv. vha. metoderne `dosistiltekst.DosageWrapper.makeAccordingToSchemaDosage(), dosistiltekst.DosageWrapper.makeFreeTextDosage(),` samt `dosistiltekst.DosageWrapper.makeStructuredDosage()`.

###Lokal administrerede doseringer
Lokaladministrerede doseringer kan oprettes med start- og evt. slutdato. Hvis slutdato ikke findes, udelades dette argument blot:
```javascript
var localadminWithoutEnddate = 
	dosistiltekst.DosageWrapper.makeAccordingToSchemaDosage(
		new dosistiltekst.AdministrationAccordingToSchemaWrapper(startdate));
var localadminWithEnddate = 
	dosistiltekst.DosageWrapper.makeAccordingToSchemaDosage(
		new dosistiltekst.AdministrationAccordingToSchemaWrapper(startdate, enddate));

```
### Fritekstdoseringer
Fritekstdoseringer kan ligeledes oprettes med start- og evt. slutdato. Hvis slutdato ikke findes, anvendes `undefined`:

```javascript
var freetextWithoutEnddate = dosistiltekst.DosageWrapper.makeFreeTextDosage(
	    new dosistiltekst.FreeTextWrapper(startdate, undefined, "Indtages med rigeligt væske"));
var freetextWithEnddate = dosistiltekst.DosageWrapper.makeFreeTextDosage(
	    new dosistiltekst.FreeTextWrapper(startdate, enddate, "Indtages med rigeligt væske"));

```   
### Strukturerede doseringer
For strukturerede doseringer angives hhv. en doseringsenhed (unit) samt et antal doseringsperioder. Doseringsenheden kan enten oprettes med en fælles entals-/flertalsangivelse (første argument), eller separat entals- og flertalsangivelse, her et eksempel på separat angivelse:
```javascript
var unit = new dosistiltekst.UnitOrUnitsWrapper(undefined, 'tablet','tabletter');
```
Herefter oprettes doseringsperioderne som et array af StructureWrapper's, med én structure per doseringsperiode, her f.eks. en itereret dosering, der gentages hver 2. dag, 'tages med rigeligt væske' som supplerende tekst, samt en start- og slutdato og et array af "doseringsdage":

```javascript
 var structures = [
	    new dosistiltekst.StructureWrapper(2, 'tages med rigeligt væske', startdate, enddate, days)
	];
```
Hvis doseringen ikke er gentaget, angives 0 som iterationInterval (iterationInterval = 1. parameter til StructureWrapper constructor).

En "doseringsdag" angiver hvordan lægemidlet skal tages på den enkelte dag. En "doseringsdag", repræsenteret ved `DayWrapper` objekter, angiver et dagsnummer samt et array af enkelt-doseringer, som kan være enten en morgen, middag, aften, nat-dosering (`MorningDoseWrapper, NoonDoseWrapper, EveningDoseWrapper, NightDoseWrapper`), dosering med tidspunkt (`DateOrDateTimeWrapper`) eller en daglig dosering (`PlainDoseWrapper`). Parametrene til eksempelvis MorningDoseWrapper er hhv. fast værdi, minimumværdi, maximumvære, 3 parametre der p.t. ikke anvendes (er medtaget af hensyn til bagudkompatibilitet med java-udgaven), samt angivelse af om enkeltdoseringen er efter behov. Herunder et eksempel på 2 doseringsdage, hver dag med et doseringselement, hhv. en morgen-dosering med 2 tabletter og en middagsdosering mellem 1 og 3 tabletter efter behov:
```javascript
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
```javascript
var dosagestructures = dosistiltekst.DosageWrapper.makeStructuredDosage(
	new dosistiltekst.StructuresWrapper(unit, structures));
shorttext = shortTextConverter.convertWrapper(dosagestructures, 100);
longtext = longTextConverter.convertWrapper(dosagestructures, 500);
```
Det sidste argument i kaldene til convertWrapper metoderne angiver max-længden af de genererede strenge.
Alternativt kan den kombinerede converter kaldes, jvf. ovenstående eksempel.


Doserings-XML generering ud fra doseringsforslag
==============

Dosis-til-tekst-ts komponenten har udover doseringstekst funktionalitet, også en funktion til at generere doserings-xml til brug i et FMK request, givet en doserings-repræsentation identisk med den der anvendes i NSP'ens KRS importer af doseringsforslag (se: TODO - link til NSP-doc). 
Funktionen kaldes således i javascript:


```javascript
var snippet = dosistiltekst.DosageProposalXMLGenerator.generateXMLSnippet(type, iteration, mapping, unitTextSingular, unitTextPlural, supplementaryText, dosageStartDates, dosageEndDates, fmkVersion, dosageProposalVersion);
```

Typescript definition:
```typescript
generateXMLSnippet(type: string, iteration: string, mapping: string, unitTextSingular: string, unitTextPlural: string, supplementaryText: string, beginDates: Date[], endDates: Date[], fmkversion: string, dosageProposalVersion: number, shortTextMaxLength: number = 70): DosageProposalXML 
```


Argumenterne til kaldet er:
- type: enten "M+M+A+N" (ved morgen+middag+aften+nat), "N daglig" eller "PN". Ved flere perioder, indsættes hver periode-værdi i {}, eks. '{M+M+A+N}{PN}'
- iteration: iterationer i doseringen. Ved flere perioder, indsættes hver periode-værdi i {}, eks. '{2}{1}'
- mapping: en såkaldt "simpel streng", se ovenståede NSP-dokument for definition.
- unitTextSingular: entals-form af doseringsenhed
- unitTextPlural: flertals-form af doseringsenhed
- supplementaryText: supplerende doseringstekst
- dosageStartDate: array af doseringsstartdatoer, en pr. periode.
- dosageEndDate: array af doseringsslutdatoer, en pr. periode.
- fmkversion: p.t. enten "FMK140", "FMK142", "FMK144" eller "FMK146"
- dosageProposalVersion: for fremtidig versioneringsbrug af såvel komponent som doseringsforslag, SKAL p.t. sættes til 1.
- shortTextMaxLength (optionel): hvis der ønskes en længere kort doseringstekst end FMK-snitfladernes sædvanlige 70 karakterer, kan denne parameter sættes til et højere tal. Hvis den korte tekst overstiger shortTextMaxLength returneres null i getShortDosageTranslation().

Efter kaldet indeholder snippet variablen hhv. doserings-xml samt den korte og den lange doseringstekst, som kan hentes hhv. vha. getXml(), getShortDosageTranslation() og getLongDosageTranslation().

Eksempel på anvendelse:
```javascript
var snippet = dosistiltekst.DosageProposalXMLGenerator.generateXMLSnippet("PN", 1, "1", "tablet", "tabletter", ", tages med rigeligt vand", [new Date(2017,04,17)], [new Date(2017,05,01)], "FMK146", 1);
```
snippet.getXml() vil returnere
```xml
<m16:Dosage xsi:schemaLocation="http://www.dkma.dk/medicinecard/xml.schema/2015/06/01 ../../../2015/06/01/DosageForRequest.xsd" xmlns:m16="http://www.dkma.dk/medicinecard/xml.schema/2015/06/01" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <m16:UnitTexts source="Doseringsforslag">
        <m16:Singular>tablet</m16:Singular>
        <m16:Plural>tabletter</m16:Plural>
    </m16:UnitTexts>
    <m16:StructuresAccordingToNeed>
        <m16:Structure>
            <m16:IterationInterval>1</m16:IterationInterval>
            <m16:StartDate>2017-04-17</m16:StartDate>
            <m16:EndDate>2017-05-01</m16:EndDate>
            <m16:SupplementaryText>, tages med rigeligt vand</m16:SupplementaryText>
            <m16:Day>
                <m16:Number>1</m16:Number>
                <m16:Dose>
                    <m16:Quantity>1</m16:Quantity>
                </m16:Dose>
            </m16:Day>
        </m16:Structure>
    </m16:StructuresAccordingToNeed>
</m16:Dosage>
```