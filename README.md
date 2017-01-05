Dosis-til-tekst-js is a javascript component that can generate short and long dosage-texts, given a structured dosage defining how a patient must take his medicine.

2 converters are available, and they are used like this:

```
dosistiltekst.Factory.getLongTextConverter().convert(dosage) 
```
and
```
dosistiltekst.Factory.getLongTextConverter().convert(dosage) 
```

..where dosage is the json-representation of the structured dosage.

