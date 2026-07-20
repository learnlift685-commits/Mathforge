(() => {
  'use strict';

  const extension = (decision, specialCases, traps, alternative, examChecklist) => ({
    decision, specialCases, traps, alternative, examChecklist
  });

  const lessonExtensions = {
    F0: extension(
      ['Ist es ein Term oder eine Gleichung?', 'Welche Operation steht äußerlich?', 'Welche Definitionsbedingungen gelten?', 'Welche Umformung erhält Wert oder Lösungsmenge?'],
      ['verschachtelte Minusklammern', 'Bruchgleichungen mit verbotenen Nennerwerten', 'Gleichungen mit Parameter oder ohne/einer/unendlich vielen Lösungen'],
      ['durch eine möglicherweise null werdende Variable teilen', 'Potenzgesetze auf Summen anwenden', 'Probe nach längeren Umformungen weglassen'],
      ['Waagenmodell für Gleichungen', 'Strukturbaum für Terme', 'Rückwärtsprobe durch Einsetzen'],
      ['Definitionsmenge notieren', 'jede Äquivalenzumformung kennzeichnen', 'Lösungsmenge und Probe angeben']
    ),
    F1: extension(
      ['Welche Größen sind Eingabe und Ausgabe?', 'Welche Darstellungsform liegt vor?', 'Welche Werte sind mathematisch und sachlich zulässig?', 'Welche Eigenschaft soll exakt oder nur qualitativ bestimmt werden?'],
      ['stückweise definierte Funktionen', 'eingeschränkte Sachbereiche', 'Umkehrung einer Zuordnung und Eindeutigkeit'],
      ['x- und y-Koordinate vertauschen', 'Graphenwerte als exakt behandeln', 'Definitions- und Wertebereich verwechseln'],
      ['Maschinenmodell', 'Pfeildiagramm', 'Übersetzung Term ↔ Tabelle ↔ Graph ↔ Text'],
      ['Definitionsbereich nennen', 'Punktprobe sauber einsetzen', 'Aussage im Sachkontext formulieren']
    ),
    F2: extension(
      ['Ist die Gleichung bereits in Produktform?', 'Kann ausgeklammert werden?', 'Sind ganzzahlige Faktoren erkennbar?', 'Sonst Ergänzung oder Lösungsformel wählen.'],
      ['doppelte Nullstelle', 'keine reelle Lösung', 'Parameter beeinflusst Anzahl der Lösungen'],
      ['± beim Wurzelziehen vergessen', 'p und q mit falschem Vorzeichen einsetzen', 'Scheitelpunktform und Nullstellenform vermischen'],
      ['Faktorisieren', 'quadratische Ergänzung', 'pq-/Mitternachtsformel'],
      ['Methode begründen', 'beide Lösungen vollständig angeben', 'Anzahl der Lösungen kontrollieren']
    ),
    F3: extension(
      ['Sind zwei Punkte, Punkt und Steigung oder ein Sachtext gegeben?', 'Welche Einheit besitzt die Steigung?', 'Ist eine proportionale oder affine Beziehung gemeint?'],
      ['senkrechte Geraden', 'negative Steigung', 'Schnitt zweier linearer Modelle'],
      ['Δx und Δy vertauschen', 'Achsenabschnitt aus dem falschen Punkt bestimmen', 'Einheit und Interpretation vergessen'],
      ['Zweipunkteform', 'Punkt-Steigungs-Form', 'lineares Gleichungssystem beim Schnitt'],
      ['Steigung berechnen', 'Geradengleichung prüfen', 'Bedeutung von m und b deuten']
    ),
    A1: extension(
      ['Ist der Exponent positiv, null oder negativ?', 'Welche Symmetrie folgt aus geradem/ungeradem Exponenten?', 'Welche Definitionslücke entsteht bei negativen Exponenten?'],
      ['x⁰=1 mit x≠0 im Ursprungskontext', 'negative gerade Exponenten', 'Vergleich verschiedener Exponenten nahe 0 und im Unendlichen'],
      ['negativen Exponenten als negatives Ergebnis lesen', 'Definitionslücke x=0 vergessen', 'Symmetrie nur am Bild erraten'],
      ['Kehrwertdarstellung', 'Wertetabelle mit strategischen x-Werten', 'Transformation aus Grundfunktion'],
      ['Definitionsbereich', 'Symmetrie', 'Verhalten bei 0 und ±∞']
    ),
    A2: extension(
      ['Grad und Leitkoeffizient bestimmen', 'Leitterm für das Endverhalten isolieren', 'geraden/ungeraden Grad unterscheiden', 'weitere Eigenschaften getrennt prüfen'],
      ['fehlende Potenzen', 'mehrfache Nullstellen und Berührungen', 'gleicher Grad mit verschiedenem Leitkoeffizienten'],
      ['Endverhalten aus konstantem Term ableiten', 'lokalen Verlauf mit globalem Verhalten verwechseln', 'Grad falsch ablesen'],
      ['Leittermvergleich', 'Vorzeichentabelle', 'Graphenfamilien vergleichen'],
      ['Grad und Leitkoeffizient nennen', 'beide Grenzrichtungen angeben', 'Aussage sprachlich und symbolisch formulieren']
    ),
    A3: extension(
      ['Liegt Produktform vor?', 'Kann ein gemeinsamer Faktor ausgeklammert werden?', 'Ist eine Substitution möglich?', 'Welche maximale Nullstellenzahl erlaubt der Grad?'],
      ['mehrfache Nullstellen', 'biquadratische Gleichungen', 'Polynome ohne vollständig ganzzahlige Faktorisierung'],
      ['durch x teilen und x=0 verlieren', 'Vorzeichen im linearen Faktor falsch lösen', 'Substitutionslösungen nicht zurückübersetzen'],
      ['Nullproduktregel', 'Substitution z=x²', 'Polynomdivision/Faktorsatz als Erweiterung'],
      ['alle Kandidaten aufführen', 'Vielfachheit beachten', 'durch Einsetzen kontrollieren']
    ),
    A4: extension(
      ['Welche Grundfunktion liegt vor?', 'Welche Änderung geschieht innen, welche außen?', 'In welcher Reihenfolge wirken Streckung, Spiegelung und Verschiebung?'],
      ['negative Innenfaktoren', 'mehrere Transformationen gleichzeitig', 'Parameterrekonstruktion aus einem Graphen'],
      ['horizontale Verschiebung mit falschem Vorzeichen', 'Innen- und Außenstreckung verwechseln', 'Transformationen in falscher Reihenfolge beschreiben'],
      ['Punktabbildung', 'Parametervergleich', 'Reglerexperiment im Visual-Labor'],
      ['Grundfunktion nennen', 'jede Transformation einzeln beschreiben', 'markante Punkte kontrollieren']
    ),
    A5: extension(
      ['Amplitude, Mittellinie, Periode und Phasenverschiebung getrennt bestimmen', 'Innenparameter zuerst zur Periodenlänge übersetzen', 'Sachkontext und Einheit prüfen'],
      ['negative Amplitude', 'Grad- und Bogenmaß', 'periodische Modelle mit vertikaler Verschiebung'],
      ['Periode mit 2π·b statt 2π/b berechnen', 'Amplitude und Mittellinie verwechseln', 'Phasenverschiebung mit falschem Vorzeichen'],
      ['markante Viertelperioden-Punkte', 'Parameter aus Max/Min/Periode', 'Vergleich mit Einheitskreisidee'],
      ['Amplitude', 'Periode', 'Mittellinie und Verschiebung', 'mindestens einen Kontrollpunkt']
    ),
    A6: extension(
      ['Intervallgrenzen identifizieren', 'beide Funktionswerte berechnen', 'Δy und Δx in gleicher Reihenfolge bilden', 'Quotient mit Einheit deuten'],
      ['negative mittlere Rate', 'nicht symmetrische Intervalle', 'Sachtexte mit verschiedenen Einheiten'],
      ['nur Δy angeben', 'Reihenfolge oben und unten inkonsistent', 'Sekantensteigung nicht deuten'],
      ['Zweipunkteform', 'Differenzenquotient', 'grafische Sekante'],
      ['Formel', 'Einsetzen mit Klammern', 'Einheit und Antwortsatz']
    ),
    A7: extension(
      ['Stelle x₀ festlegen', 'f(x₀+h) vollständig bilden', 'Differenz ausklammern/vereinfachen', 'erst danach Grenzwert h→0'],
      ['einseitige Annäherung', 'nicht differenzierbare Knicke als Ausblick', 'allgemeine Stelle statt konkrete Zahl'],
      ['h sofort 0 setzen', 'Klammern in f(x+h) falsch ausmultiplizieren', 'Grenzwert ohne Vereinfachung behaupten'],
      ['h-Methode', 'Sekantenfolge im Visual-Labor', 'Ableitungsregel als kontrollierter Vergleich'],
      ['Differenzenquotient korrekt aufstellen', 'algebraisch kürzbar machen', 'Grenzwert und Bedeutung nennen']
    ),
    A8: extension(
      ['Berührstelle bestimmen', 'Ableitung und Steigung berechnen', 'Punkt-Steigungs-Form verwenden', 'bei Normalen negative Kehrwertbeziehung prüfen'],
      ['waagerechte Tangente', 'senkrechte Normale', 'Steigungswinkel mit negativer Steigung'],
      ['y-Wert der Berührstelle vergessen', 'Normale nur mit negativem Vorzeichen statt Kehrwert', 'Grad/Radiant beim Winkel verwechseln'],
      ['Punkt-Steigungs-Form', 'Geradenform y=mx+b', 'geometrische Konstruktion'],
      ['Punkt', 'Steigung', 'Geradengleichung und Probe']
    ),
    A9: extension(
      ['Wo steigt/fällt f?', 'Wo besitzt f waagerechte Tangenten?', 'Wie stark ist die Steigung?', 'Welche Form muss daraus für f′ entstehen?'],
      ['Ableitung an Ecken nicht definiert', 'konstante Abschnitte', 'Graph von f′ aus qualitativen Informationen'],
      ['Funktionshöhe mit Steigung verwechseln', 'Extrempunkte von f als Extrempunkte von f′ markieren', 'Vorzeichenbereiche nicht verbinden'],
      ['Steigungstabelle', 'Tangentenfächer', 'f- und f′-Graph parallel lesen'],
      ['Nullstellen von f′', 'Vorzeichen von f′', 'relative Größe der Steigungen']
    ),
    A10: extension(
      ['Term in Summanden zerlegen', 'Koeffizient und Exponent je Summand identifizieren', 'Regel termweise anwenden', 'Ergebnis ordnen und kontrollieren'],
      ['negative ganzzahlige Exponenten', 'Parameter als konstante Faktoren', 'mehrfaches Ableiten'],
      ['Exponent nur verringern', 'Konstante stehen lassen', 'Vorzeichen/Koeffizient verlieren'],
      ['Potenzregel aus Differenzenquotient', 'Termtabelle Alt → Neu', 'Rückkontrolle über Graphensteigung'],
      ['vollständige Ableitung', 'saubere Potenzschreibweise', 'Plausibilitätskontrolle des Grades']
    ),
    A11: extension(
      ['f′=0 liefert Kandidaten', 'Vorzeichenwechsel oder f″ zur Klassifikation', 'y-Werte in f bestimmen', 'lokal/global im betrachteten Bereich unterscheiden'],
      ['Terrassenpunkt', 'Randextrema in eingeschränkten Intervallen', 'Parameter erzeugt verschiedene Extremzahlen'],
      ['f′=0 automatisch als Extrempunkt', 'x-Stelle als Punkt ausgeben', 'Randpunkte ignorieren'],
      ['Vorzeichenwechseltest', 'zweite Ableitung', 'Vergleich von Funktionswerten für globale Extrema'],
      ['Kandidaten', 'hinreichender Nachweis', 'Punktkoordinaten und Deutung']
    ),
    A12: extension(
      ['f″=0 liefert Kandidaten', 'Vorzeichenwechsel von f″ prüfen', 'y-Wert bestimmen', 'Krümmungsintervalle sauber angeben'],
      ['f″=0 ohne Wendepunkt', 'Wendepunkt mit waagerechter Tangente', 'Krümmungswechsel bei Parameterfunktionen'],
      ['f″=0 als ausreichenden Beweis behandeln', 'links/rechtsgekrümmt ohne Vorzeichenbezug', 'Wendestelle statt Wendepunkt'],
      ['Vorzeichenwechseltest', 'dritte Ableitung als mögliches Kriterium', 'grafischer Vergleich f′-Extremum ↔ f-Wendepunkt'],
      ['Kandidat', 'hinreichender Nachweis', 'Punkt und Krümmungsintervalle']
    ),
    A13: extension(
      ['Globales Verhalten zuerst', 'Nullstellen/Symmetrie', 'f′ für Monotonie/Extrema', 'f″ für Krümmung/Wende', 'alle Ergebnisse zu einer Skizze verbinden'],
      ['mehrfache Nullstellen', 'fehlende Extrema trotz kritischer Stelle', 'eingeschränkter Definitionsbereich'],
      ['isolierte Ergebnisse ohne Zusammenhang', 'Punktkoordinaten oder Nachweise vergessen', 'Graph widerspricht Vorzeichenanalyse'],
      ['klassische Reihenfolge', 'eigenschaftsorientierte Untersuchung', 'Graph ↔ Algebra als ständige Doppelkontrolle'],
      ['Übersichtstabelle', 'vollständige Nachweise', 'konsistente Graphenskizze']
    ),
    A14: extension(
      ['Größen und Einheiten definieren', 'Annahmen explizit machen', 'mathematisches Modell wählen', 'Parameter aus Bedingungen bestimmen', 'Ergebnis validieren'],
      ['Interpolation vs. Extrapolation', 'mehr Bedingungen als Parameter', 'mehrere Modelle passen lokal ähnlich gut'],
      ['Parameter ohne Einheit', 'mathematische Lösung ungeprüft übernehmen', 'Modellgrenzen nicht nennen'],
      ['Bedingungsgleichungen', 'Regression als Ausblick', 'Vergleich zweier Modelltypen'],
      ['Variablen erklären', 'Bedingungen übersetzen', 'Ergebnis im Kontext und Modellkritik']
    ),
    G1: extension(
      ['Punkt oder Vektor unterscheiden', 'Ortsvektor vom Ursprung erkennen', 'Verbindungsvektor Ziel−Start bilden', 'geometrische Bedeutung aussprechen'],
      ['gleiche Koordinaten als Punkt und Vektor mit anderer Bedeutung', 'Bewegungsvektoren', 'Translation ganzer Figuren'],
      ['Start−Ziel statt Ziel−Start', 'Punktnotation und Vektornotation vermischen', 'Einheit im Bewegungskontext vergessen'],
      ['Pfeilmodell', 'Koordinatendifferenz', 'Translation'],
      ['Orientierung', 'Komponentenrechnung', 'geometrische Interpretation']
    ),
    G2: extension(
      ['Operation komponentenweise ausführen', 'Länge nur nach Skalarprodukt-ähnlicher Quadratsumme', 'Kollinearität über einen gemeinsamen Faktor prüfen'],
      ['Nullvektor', 'negative Skalare und Richtungswechsel', 'Abstand in 3D'],
      ['Beträge der Komponenten addieren', 'für jede Komponente anderen Kollinearitätsfaktor verwenden', 'Wurzel vergessen'],
      ['Komponentenmodell', 'Pythagoras im Raum', 'Verhältnisprüfung'],
      ['Operation zeilenweise', 'exakte Wurzelform', 'gemeinsamen Faktor angeben']
    ),
    G3: extension(
      ['passende Seiten-/Diagonalvektoren bilden', 'Kriterium der gesuchten Figur auswählen', 'Vektorgleichheiten und Längen nachweisen', 'Schlussfolgerung formulieren'],
      ['Parallelogramm, Rechteck, Raute', 'Mittelpunktkriterium der Diagonalen', 'entartete Figuren durch kollineare Punkte'],
      ['falsche Vektororientierung vergleichen', 'nur optisch argumentieren', 'notwendige mit hinreichenden Bedingungen verwechseln'],
      ['Seitenkriterium', 'Diagonalenkriterium', 'Mittelpunktvergleich'],
      ['Vektoren nennen', 'Kriterium vollständig erfüllen', 'Figur eindeutig folgern']
    ),
    G4: extension(
      ['Stützpunkt wählen', 'Richtungsvektor als Differenz bilden', 'Parameterbedeutung klären', 'bei Strecken Parameterintervall angeben'],
      ['verschiedene gültige Darstellungen derselben Geraden', 'Strecken und Strahlen', 'Bewegungsmodelle mit Zeitparameter'],
      ['zweiten Punkt direkt als Richtungsvektor', 'je Koordinate anderer Parameter', 'Parameterbereich bei Strecke vergessen'],
      ['Punkt-Punkt-Form', 'Stützpunktwechsel', 'Parameter als Zeit'],
      ['Richtung Ziel−Start', 'Punktprobe', 'Parameter im Kontext deuten']
    ),
    G5: extension(
      ['Richtungsvektoren auf Vielfachheit prüfen', 'bei Parallelität Stützpunktprobe', 'sonst Parameter-LGS lösen', 'dritte Koordinate kontrollieren'],
      ['identisch vs. echt parallel', 'windschief im Raum', 'Schnitt außerhalb eines Streckenintervalls'],
      ['nicht parallele Geraden automatisch als schneidend', 'dritte Gleichung nicht prüfen', 'Parameterwerte als Punktkoordinaten ausgeben'],
      ['Entscheidungsbaum', 'vollständiges LGS', 'geometrische Visualisierung'],
      ['Richtungsvergleich', 'LGS/Probe', 'Lagebezeichnung und ggf. Schnittpunkt']
    ),
    G6: extension(
      ['Variablen und Gleichungen sauber ordnen', 'Eliminationsstrategie wählen', 'Zeilen äquivalent umformen', 'Lösungssituation interpretieren und rückprüfen'],
      ['keine/eine/unendlich viele Lösungen', 'unterbestimmte Systeme', 'LGS aus räumlichen Geraden'],
      ['Widerspruchszeile übersehen', 'freie Variable als feste Zahl behandeln', 'Rückeinsetzen auslassen'],
      ['Einsetzungsverfahren', 'Additions-/Eliminationsverfahren', 'Gauß-Idee als tabellarische Erweiterung'],
      ['saubere Zeilen', 'Lösungssituation', 'Rückprobe in Originalgleichungen']
    )
  };

  const visualLabs = {
    A4: { type: 'transform', title: 'Transformations-Labor', subtitle: 'Verschiebe, strecke und spiegle eine Grundfunktion und beobachte markante Punkte.' },
    A5: { type: 'sine', title: 'Sinus-Parameter-Labor', subtitle: 'Amplitude, Periode, Phase und Mittellinie werden unmittelbar sichtbar.' },
    A6: { type: 'secant', title: 'Sekanten-Labor', subtitle: 'Zwei Punkte erzeugen die mittlere Änderungsrate.' },
    A7: { type: 'secant', title: 'Sekante wird Tangente', subtitle: 'Verkleinere h und beobachte den Grenzübergang.' },
    A8: { type: 'tangent', title: 'Tangente & Normale', subtitle: 'Berührpunkt, Steigung und negative Kehrwertbeziehung verbinden.' },
    A9: { type: 'derivative', title: 'Graphisch-ableiten-Labor', subtitle: 'Vergleiche f und f′ entlang derselben x-Position.' },
    A10: { type: 'derivative', title: 'Ableitungs-Familien-Labor', subtitle: 'Verändere Koeffizienten und vergleiche f, f′ und f″.' },
    A11: { type: 'derivative', title: 'Extrempunkt-Labor', subtitle: 'Nullstellen von f′ und Vorzeichenwechsel werden gekoppelt angezeigt.' },
    A12: { type: 'derivative', title: 'Krümmungs-Labor', subtitle: 'Verknüpfe Vorzeichen von f″ mit dem Krümmungswechsel.' },
    A13: { type: 'derivative', title: 'Kurvendiskussions-Labor', subtitle: 'Alle Untersuchungsschritte in einer gemeinsamen Ansicht.' },
    G1: { type: 'vector', title: 'Vektor-Pfeil-Labor', subtitle: 'Start, Ziel und Verbindungsvektor können direkt verändert werden.' },
    G2: { type: 'vector', title: 'Vektoroperations-Labor', subtitle: 'Addition, Skalierung und Länge werden geometrisch sichtbar.' },
    G4: { type: 'line3d', title: 'Parametergeraden-Labor', subtitle: 'Bewege einen Punkt mit dem Parameter entlang einer Raumgeraden.' },
    G5: { type: 'line3d', title: 'Lagebeziehungs-Labor', subtitle: 'Vergleiche Schnitt, Parallelität, Identität und Windschiefe.' }
  };

  const examBlueprints = {
    sprint: { title: '30-Minuten EF-Sprint', minutes: 30, generatorIds: ['simplify','linear','functionValue','roots','derivative','vectorSub'] },
    algebra: { title: 'Algebra-Reparaturklausur', minutes: 45, generatorIds: ['expandBrackets','fractionEquation','quadratic','parabolaVertex','lineEquation','polynomialDegree'] },
    functions: { title: 'Funktionen & Transformationen', minutes: 60, generatorIds: ['domainRange','functionValue','negativePower','polynomialDegree','transformComposition','sinePeriod','rootsStrategy'] },
    rates: { title: 'Änderungsraten & Tangenten', minutes: 60, generatorIds: ['averageRate','differenceQuotient','derivativeDefinition','secantTangent','tangentEquation','normalSlope','rateInterpretation'] },
    derivativeFocus: { title: 'Ableitungsregeln Intensiv', minutes: 60, generatorIds: ['derivative','negativeExponentDerivative','derivativeValue','graphDerivativeSign','tangentEquation','parameterExtrema'] },
    curveFocus: { title: 'Kurvendiskussion Intensiv', minutes: 90, generatorIds: ['endBehavior','rootsStrategy','symmetry','derivative','monotonicIntervals','extrema','curvatureIntervals','inflection','curveReasoning'] },
    modeling: { title: 'Modellierung & Sachkontexte', minutes: 75, generatorIds: ['lineModel','rateInterpretation','motionModel','modelParameter','modelValidity','vectorMotion'] },
    vectorBasics: { title: 'Vektoren Grundlagen', minutes: 60, generatorIds: ['vectorSub','vectorAdd','vectorScale','distancePoints','vectorLength','midpoint','collinear'] },
    lines: { title: 'Geraden im Raum Intensiv', minutes: 75, generatorIds: ['lineFromPoints','segmentParameter','pointOnLine','lineParallelTest','lineIntersection','linePosition','lgsClassification'] }
  };

  const examCards = [
    ['sprint','30 Minuten','EF-Sprint','Kurzer gemischter Leistungscheck für einen Lernabend.','6 Aufgaben'],
    ['basis','60 Minuten','Grundlagen-Check','Algebra, Funktionen, Steigung, erste Analysis und Vektorbasics.','10 Aufgaben'],
    ['algebra','45 Minuten','Algebra-Reparatur','Terme, Brüche, Gleichungen, Parabeln und Geraden.','6 Aufgaben'],
    ['functions','60 Minuten','Funktionen & Transformationen','Definitionsbereiche, Potenzen, Polynome, Transformation und Sinus.','7 Aufgaben'],
    ['rates','60 Minuten','Änderungsraten & Tangenten','Sekante, Grenzwertidee, Tangente, Normale und Interpretation.','7 Aufgaben'],
    ['derivativeFocus','60 Minuten','Ableitungsregeln Intensiv','Regeln, negative Exponenten, Werte und Graphenbezüge.','6 Aufgaben'],
    ['curveFocus','90 Minuten','Kurvendiskussion Intensiv','Nullstellen, Ableitungen, Extrema, Krümmung und Wende.','9 Aufgaben'],
    ['analysis','90 Minuten','Analysis-Klausur EF','Breite Analysis-Klausur mit Begründungen und Teilpunkten.','11 Aufgaben'],
    ['modeling','75 Minuten','Modellierung & Sachkontexte','Modelle aufstellen, Parameter deuten und Grenzen prüfen.','6 Aufgaben'],
    ['vectorBasics','60 Minuten','Vektoren Grundlagen','Operationen, Längen, Abstände, Mittelpunkte und Kollinearität.','7 Aufgaben'],
    ['lines','75 Minuten','Geraden im Raum Intensiv','Parameterformen, Punktproben, LGS und Lagebeziehungen.','7 Aufgaben'],
    ['geometry','90 Minuten','Vektorgeometrie-Klausur','Vektoroperationen, Figuren, Geraden und Lagebeziehungen.','9 Aufgaben'],
    ['full','120 Minuten','Große EF-NRW-Simulation','Gemischte Analysis und Vektorgeometrie mit Teilpunkten.','13 Aufgaben']
  ];

  Object.assign(window.MATHFORGE_V03_DATA.examBlueprints, examBlueprints);

  window.MATHFORGE_V05_DATA = {
    lessonExtensions,
    visualLabs,
    examCards,
    version: '0.5'
  };
})();
