(() => {
  'use strict';

  const deepDives = {
    F0: {
      anchor: 'Eine algebraische Umformung ist nur dann erlaubt, wenn sie den Wert eines Terms oder die Lösungsmenge einer Gleichung erhält.',
      why: [
        ['Warum auf beiden Seiten dasselbe?', 'Eine Gleichung behauptet, dass zwei Ausdrücke denselben Wert besitzen. Verändert man nur eine Seite, wird eine neue Behauptung erzeugt. Dieselbe zulässige Operation auf beiden Seiten erhält dagegen die Gleichheit.'],
        ['Warum nur gleichartige Terme zusammenfassen?', 'Ein Term wie 3x beschreibt drei Einheiten derselben Größe x. 5x beschreibt fünf weitere Einheiten derselben Größe. x und x² sind jedoch unterschiedliche Größenarten und lassen sich deshalb nicht direkt addieren.'],
        ['Warum ist die Probe wichtig?', 'Die Probe kontrolliert den gesamten Rechenweg unabhängig vom eigenen Zwischenergebnis. Sie erkennt Vorzeichenfehler, unzulässiges Teilen und verlorene Lösungen.']
      ],
      analogy: 'Äquivalenzumformungen funktionieren wie eine Waage: Was auf einer Seite geschieht, muss auf der anderen Seite ebenfalls geschehen.',
      proofSketch: 'Aus a=b folgt für jede zulässige Zahl c sowohl a+c=b+c als auch ac=bc. Beim Dividieren muss c≠0 gelten; genau deshalb sind Definitionsbedingungen wichtig.',
      mistakeMap: [
        ['Minusklammer', 'Das Minus wirkt auf jeden Summanden in der Klammer.'],
        ['Potenzgesetz auf Summe', 'a²+a³ ist keine Multiplikation gleicher Basen.'],
        ['Durch Variable teilen', 'Die Variable könnte 0 sein; dadurch können Lösungen verloren gehen.']
      ],
      explainBack: ['Erkläre den Unterschied zwischen einem Term und einer Gleichung.', 'Begründe, weshalb 2x+3x zusammengefasst werden darf, 2x+3x² aber nicht.', 'Formuliere eine Regel, mit der du Minusklammern sicher kontrollierst.']
    },
    F1: {
      anchor: 'Eine Funktion ordnet jedem zulässigen Eingang genau einen Ausgang zu; Term, Tabelle, Graph und Sachtext sind verschiedene Darstellungen derselben Zuordnung.',
      why: [
        ['Warum ist der Definitionsbereich Teil der Funktion?', 'Ohne Definitionsbereich ist nicht geklärt, welche Eingaben erlaubt sind. Bei Wurzeln, Brüchen und Sachkontexten kann sich dadurch die mathematische Aussage vollständig ändern.'],
        ['Warum reicht ein Graph allein nicht?', 'Ein Graph vermittelt Verlauf und Eigenschaften, aber exakte Werte oder Beweise sind daraus oft nicht sicher ablesbar. Algebraische und grafische Darstellung ergänzen sich.'],
        ['Warum ist die Punktprobe logisch?', 'Ein Punkt liegt genau dann auf dem Graphen, wenn sein y-Wert der Funktionswert an seiner x-Koordinate ist.']
      ],
      analogy: 'Eine Funktion ist wie eine präzise Maschine: Ein zulässiger Eingang wird nach einer festen Regel in genau einen Ausgang verwandelt.',
      proofSketch: 'Für einen Punkt P(x₀|y₀) gilt P∈G_f genau dann, wenn y₀=f(x₀). Das ist keine Merkregel, sondern die Definition des Funktionsgraphen.',
      mistakeMap: [['x- und y-Wert vertauscht', 'x wird eingesetzt; y ist das Ergebnis.'], ['Graph nur optisch lesen', 'Exakte Aussagen mit Term oder Rechnung absichern.'], ['Sachbereich ignoriert', 'Negative Zeit oder Länge kann mathematisch möglich, sachlich aber unzulässig sein.']],
      explainBack: ['Was bedeutet „eindeutige Zuordnung“?', 'Wie hängen Nullstelle und Schnittpunkt mit der x-Achse zusammen?', 'Nenne ein Beispiel, bei dem der Sachkontext den Definitionsbereich einschränkt.']
    },
    A3: {
      anchor: 'Nullstellen sind gleichzeitig Lösungen von f(x)=0, x-Koordinaten der Achsenschnittpunkte und – bei Polynomen – Hinweise auf lineare Faktoren.',
      why: [
        ['Warum setzt man f(x)=0?', 'Auf der x-Achse ist die y-Koordinate 0. Da der Graph y=f(x) erfüllt, müssen Achsenschnittpunkte die Gleichung f(x)=0 erfüllen.'],
        ['Warum funktioniert Ausklammern?', 'Durch das Distributivgesetz wird eine Summe in ein Produkt umgeschrieben. Erst in Produktform kann die Nullproduktregel direkt angewendet werden.'],
        ['Warum darf man nicht einfach durch x teilen?', 'x=0 könnte selbst eine Lösung sein. Durch Division durch x würde genau diese Lösung ausgeschlossen.']
      ],
      analogy: 'Faktorisieren ist wie das Zerlegen eines Schlosses in einzelne Riegel: Jeder Faktor zeigt eine eigene Möglichkeit, wie das gesamte Produkt null werden kann.',
      proofSketch: 'Für reelle Zahlen gilt ab=0 genau dann, wenn a=0 oder b=0. Zusammen mit f(r)=0 ⇔ (x−r) ist Faktor von f entsteht die Verbindung zwischen Nullstelle und Faktor.',
      mistakeMap: [['Lösung x=0 verlieren', 'Zuerst ausklammern, nicht durch x teilen.'], ['Vorzeichen im Faktor', '(x−r)=0 besitzt die Lösung x=r.'], ['Nur eine Lösung angeben', 'Jeden Faktor einzeln gleich null setzen.']],
      explainBack: ['Erkläre Nullstelle in drei Darstellungen.', 'Warum ist eine faktorisierte Form besonders nützlich?', 'Wie kontrollierst du, ob alle Nullstellen gefunden wurden?']
    },
    A6: {
      anchor: 'Eine Änderungsrate vergleicht eine Änderung der abhängigen Größe mit der dazugehörigen Änderung der unabhängigen Größe.',
      why: [
        ['Warum teilt man durch Δx?', 'Die reine Änderung Δy sagt nicht, über welche Intervalllänge sie stattgefunden hat. Erst der Quotient macht Veränderungen auf unterschiedlich langen Intervallen vergleichbar.'],
        ['Warum ist der Differenzenquotient eine Sekantensteigung?', 'Zähler und Nenner sind genau die Koordinatendifferenzen zweier Graphenpunkte; deren Quotient definiert die Steigung der Verbindungsgeraden.'],
        ['Warum braucht eine Rate eine Einheit?', 'Die Einheit zeigt, welche Größe pro welcher anderen Größe verändert wird, zum Beispiel Kilometer pro Stunde.']
      ],
      analogy: 'Nicht die gesamte zurückgelegte Strecke beschreibt das Tempo, sondern Strecke pro Zeit.',
      proofSketch: 'Für P(x₁|f(x₁)) und Q(x₂|f(x₂)) ist m_PQ=(f(x₂)−f(x₁))/(x₂−x₁). Das ist gleichzeitig die mittlere Änderungsrate von f auf [x₁;x₂].',
      mistakeMap: [['Zähler vertauscht', 'Reihenfolge oben und unten muss übereinstimmen.'], ['Nur Δy berechnet', 'Eine Änderung ist noch keine Änderungsrate.'], ['Einheit fehlt', 'Ergebnis immer im Kontext aussprechen.']],
      explainBack: ['Unterscheide Änderung und Änderungsrate.', 'Warum bleibt der Quotient bei vertauschter Reihenfolge gleich?', 'Beschreibe die geometrische Bedeutung.']
    },
    A7: {
      anchor: 'Die lokale Änderungsrate entsteht als Grenzwert mittlerer Änderungsraten, wenn das betrachtete Intervall auf einen Punkt zusammenschrumpft.',
      why: [
        ['Warum kann man nicht direkt x₂=x₁ setzen?', 'Dann wären Zähler und Nenner zunächst 0. Der Grenzwert untersucht deshalb Werte in der Nähe, ohne h sofort gleich 0 zu setzen.'],
        ['Warum ist der Grenzwert mehr als „h wird klein“?', 'Entscheidend ist, ob sich die Quotienten einem eindeutigen Wert annähern – unabhängig davon, von welcher Seite h gegen 0 läuft.'],
        ['Warum entspricht der Grenzwert der Tangentensteigung?', 'Sekanten durch zwei nahe Punkte nähern sich einer eindeutigen Grenzlage. Diese Grenzgerade ist die Tangente.']
      ],
      analogy: 'Wie bei einem immer stärkeren Zoom wird aus einem gekrümmten Graphen lokal eine nahezu gerade Linie.',
      proofSketch: 'f′(x₀)=lim_{h→0}(f(x₀+h)−f(x₀))/h. Für f(x)=x² wird der Quotient zu 2x₀+h und der Grenzwert zu 2x₀.',
      mistakeMap: [['h=0 einsetzen', 'Erst vereinfachen, dann Grenzwert bilden.'], ['f(x+h) falsch ausmultipliziert', 'Klammern vollständig behandeln.'], ['Grenzwert nur behauptet', 'Quotient algebraisch auf eine auswertbare Form bringen.']],
      explainBack: ['Warum ist 0/0 hier kein Ergebnis?', 'Erkläre den Übergang von Sekante zu Tangente.', 'Leite x² an einer allgemeinen Stelle über den Grenzwert ab.']
    },
    A10: {
      anchor: 'Ableitungsregeln sind verdichtete Grenzwertargumente; sie beschreiben, wie sich die Änderungsraten einzelner Termbausteine zusammensetzen.',
      why: [
        ['Warum wird aus xⁿ der Faktor n·xⁿ⁻¹?', 'Der Binomische Lehrsatz im Differenzenquotienten erzeugt als dominierenden Term n·xⁿ⁻¹; alle übrigen Terme enthalten nach dem Kürzen noch h und verschwinden im Grenzwert.'],
        ['Warum verschwindet eine Konstante?', 'Ihr Funktionswert ändert sich nicht. Im Differenzenquotienten steht c−c=0.'],
        ['Warum darf man Summanden getrennt ableiten?', 'Der Differenzenquotient einer Summe zerfällt algebraisch in die Summe der einzelnen Differenzenquotienten.']
      ],
      analogy: 'Beim Ableiten wird jeder Termbaustein nach seiner eigenen Änderungsregel verarbeitet und anschließend wieder zusammengesetzt.',
      proofSketch: 'Für (f+g) gilt ((f+g)(x+h)−(f+g)(x))/h = (f(x+h)−f(x))/h + (g(x+h)−g(x))/h.',
      mistakeMap: [['Exponent nicht vermindert', 'n wird Faktor und der Exponent wird n−1.'], ['Konstante stehen gelassen', 'Konstante Änderungsrate ist 0.'], ['Vorzeichen verloren', 'Koeffizient einschließlich Vorzeichen übernehmen.']],
      explainBack: ['Begründe die Ableitung einer Konstante.', 'Leite die Potenzregel sprachlich als Zweischritt-Regel an.', 'Warum ist die Ableitung von 3x² nicht 6x²?']
    },
    A11: {
      anchor: 'Extrempunkte entstehen durch einen Wechsel der Monotonie; f′(x)=0 liefert nur Kandidaten, der Vorzeichenwechsel oder f″ klassifiziert sie.',
      why: [
        ['Warum ist f′(x)=0 nicht hinreichend?', 'Auch an einem Terrassenpunkt kann die Tangente waagerecht sein, ohne dass die Funktion von Steigen zu Fallen oder umgekehrt wechselt.'],
        ['Warum zeigt das Vorzeichen von f′ die Monotonie?', 'f′ misst lokale Steigung. Positive Werte bedeuten lokal steigende, negative Werte lokal fallende Funktionswerte.'],
        ['Warum muss der y-Wert berechnet werden?', 'Die Lösung von f′(x)=0 ist zunächst nur eine Stelle. Ein Extrempunkt benötigt beide Koordinaten.']
      ],
      analogy: 'f′ ist ein Steigungssensor: positiv bedeutet bergauf, negativ bergab, null allein bedeutet nur waagerecht.',
      proofSketch: 'Wechselt f′ an x₀ von + nach −, ist f links steigend und rechts fallend; damit besitzt f dort ein lokales Maximum. Umgekehrt liefert − nach + ein Minimum.',
      mistakeMap: [['Nur f′=0', 'Mit Vorzeichenwechsel oder f″ klassifizieren.'], ['Stelle als Punkt ausgegeben', 'x in f einsetzen.'], ['Monotonieintervalle ohne Rand', 'Kritische Stellen ordnen und Intervalle korrekt angeben.']],
      explainBack: ['Nenne notwendige und hinreichende Kriterien.', 'Erkläre einen Hochpunkt über das Verhalten von f′.', 'Wie unterscheidet sich eine Extremstelle von einem Extrempunkt?']
    },
    A12: {
      anchor: 'Die zweite Ableitung misst die Veränderung der Steigung; ein Wendepunkt ist ein echter Wechsel der Krümmungsrichtung.',
      why: [
        ['Warum beschreibt f″ die Krümmung?', 'f″ zeigt, ob die Steigungen f′ zunehmen oder abnehmen. Zunehmende Steigungen erzeugen Links-, abnehmende Steigungen Rechtskrümmung.'],
        ['Warum reicht f″(x)=0 nicht?', 'Die zweite Ableitung kann die Null berühren, ohne ihr Vorzeichen zu wechseln. Dann ändert sich die Krümmung nicht.'],
        ['Warum ist ein Wendepunkt für Modellierung wichtig?', 'Dort ändert sich die Art der Steigungsentwicklung; bei Wachstumsprozessen liegt häufig die größte Wachstumsrate vor.']
      ],
      analogy: 'f′ ist der Tacho der Steigung, f″ beschreibt, ob dieser Tacho gerade zunimmt oder abnimmt.',
      proofSketch: 'Ein Vorzeichenwechsel von f″ an x_W zeigt, dass f′ dort von zunehmend zu abnehmend oder umgekehrt wechselt. Genau das bedeutet Krümmungswechsel.',
      mistakeMap: [['f″=0 als Beweis', 'Vorzeichenwechsel oder geeignetes weiteres Kriterium prüfen.'], ['Wendestelle statt Punkt', 'x_W in f einsetzen.'], ['Krümmungsnamen verwechselt', 'Vorzeichen von f″ mit einer festen Konvention verbinden.']],
      explainBack: ['Erkläre f″ ohne das Wort „zweite Ableitung“.', 'Warum kann x⁴ bei x=0 keinen Wendepunkt haben?', 'Was passiert mit f′ an einem Wendepunkt?']
    },
    A13: {
      anchor: 'Eine Kurvendiskussion ist kein loses Rezept, sondern eine logisch geordnete Untersuchung, bei der jede Ableitung eine andere Frage an die Funktion beantwortet.',
      why: [
        ['Warum beginnt man mit Definitionsbereich und Struktur?', 'Alle späteren Aussagen gelten nur für zulässige x-Werte; Symmetrie, Faktorisierung oder besondere Form können den gesamten Rechenweg vereinfachen.'],
        ['Warum werden Ergebnisse miteinander verknüpft?', 'Nullstellen, Monotonie, Extrema, Krümmung und Wendepunkte müssen einen konsistenten Graphen ergeben. Widersprüche weisen auf Rechenfehler hin.'],
        ['Warum ist eine Skizze eine Kontrolle?', 'Eine qualitative Skizze zwingt dazu, Endverhalten, Achsenschnittpunkte und lokale Eigenschaften gleichzeitig zu berücksichtigen.']
      ],
      analogy: 'Wie eine medizinische Untersuchung betrachtet die Kurvendiskussion dasselbe Objekt aus mehreren Perspektiven und führt alle Befunde zu einem Gesamtbild zusammen.',
      proofSketch: 'f beantwortet Lagefragen, f′ Steigungs- und Monotoniefragen, f″ Krümmungsfragen. Kritische Stellen werden durch Einsetzen in die jeweils passende Funktion zu Punkten.',
      mistakeMap: [['Schema ohne Zusammenhang', 'Nach jedem Ergebnis seine grafische Bedeutung notieren.'], ['Kandidaten nicht prüfen', 'Notwendige Bedingungen sind nur Filter.'], ['Graph widerspricht Endverhalten', 'Leitterm zuerst als globalen Rahmen nutzen.']],
      explainBack: ['Ordne f, f′ und f″ jeweils eine Leitfrage zu.', 'Wie kontrollieren sich Extrempunkte und Monotonie gegenseitig?', 'Entwirf eine sinnvolle Reihenfolge für eine vollständige Untersuchung.']
    },
    G1: {
      anchor: 'Ein Punkt bezeichnet einen Ort; ein Vektor beschreibt eine gerichtete Verschiebung. Derselbe Vektor kann an verschiedenen Orten dargestellt werden.',
      why: [
        ['Warum ist ein Ortsvektor vom Punkt zu unterscheiden?', 'Der Ortsvektor beginnt speziell im Ursprung und endet im Punkt. Ein allgemeiner Vektor beschreibt dagegen nur Richtung und Länge.'],
        ['Warum berechnet man B−A?', 'Die komponentenweise Differenz gibt an, welche Verschiebung nötig ist, um von A nach B zu gelangen.'],
        ['Warum sind Vektoren translationsunabhängig?', 'Ihre Bedeutung hängt nur von Komponenten, Richtung und Länge ab, nicht vom gezeichneten Startpunkt.']
      ],
      analogy: 'Ein Punkt ist eine Adresse; ein Vektor ist eine Wegbeschreibung.',
      proofSketch: 'Für A und B gilt \u2192AB=\u2192OB−\u2192OA. Dann ist \u2192OA+\u2192AB=\u2192OB, also führt die Verschiebung tatsächlich von A nach B.',
      mistakeMap: [['A−B statt B−A', 'Ziel minus Start.'], ['Punkt und Vektor gleichgesetzt', 'Schreibweise und Bedeutung trennen.'], ['Komponenten unsauber', 'Jede Koordinate einzeln subtrahieren.']],
      explainBack: ['Erkläre Punkt, Ortsvektor und Verbindungsvektor.', 'Warum kehrt BA die Richtung von AB um?', 'Wie erkennt man eine Verschiebung im Sachkontext?']
    },
    G5: {
      anchor: 'Die Lage zweier Geraden wird durch Richtungen und gemeinsame Punkte entschieden: erst Richtungsbeziehung, dann – falls nötig – Schnittgleichung.',
      why: [
        ['Warum zuerst Richtungsvektoren vergleichen?', 'Sind sie Vielfache, können die Geraden nur parallel oder identisch sein. Dadurch wird eine unnötige vollständige LGS-Rechnung vermieden.'],
        ['Warum müssen alle drei Koordinatengleichungen gelten?', 'Ein räumlicher Schnittpunkt ist ein gemeinsamer Punkt in allen Dimensionen. Zwei passende Koordinaten allein reichen nicht.'],
        ['Warum sind windschiefe Geraden nur im Raum möglich?', 'In einer Ebene müssen zwei nicht parallele unendliche Geraden schneiden. Im Raum können sie aneinander vorbeilaufen, ohne parallel zu sein.']
      ],
      analogy: 'Zwei Flugrouten können dieselbe Richtung, denselben Ort oder nur scheinbar eine Kreuzung in der Projektion besitzen.',
      proofSketch: 'Ein Schnittpunkt erfüllt a+r·u=b+s·v in jeder Komponente. Keine Lösung bei nicht parallelen Richtungen bedeutet windschief; parallele Richtungen erfordern zusätzlich eine Punktprobe.',
      mistakeMap: [['Nur zwei Gleichungen geprüft', 'Dritte Koordinate als Konsistenztest verwenden.'], ['Parallel sofort identisch', 'Stützpunkt der einen Geraden in der anderen prüfen.'], ['Parameter verwechselt', 'Für jede Gerade einen eigenen Parameter führen.']],
      explainBack: ['Entwickle einen Entscheidungsbaum für Lagebeziehungen.', 'Warum kann ein widersprüchliches LGS windschief bedeuten?', 'Wie beweist du Identität zweier Geraden?']
    },
    A1: {
      anchor: 'Potenzfunktionen werden durch Exponent, Vorzeichen und Definitionsbereich geprägt; diese drei Informationen erklären fast den gesamten Graphenverlauf.',
      why: [
        ['Warum unterscheiden sich gerade und ungerade Exponenten?', 'Bei geraden Exponenten liefern x und −x denselben Wert; bei ungeraden Exponenten wechseln die Werte ihr Vorzeichen. Daraus entstehen Achsen- beziehungsweise Punktsymmetrie.'],
        ['Warum erzeugen negative Exponenten Definitionslücken?', 'x⁻ⁿ bedeutet 1/xⁿ. Für x=0 wäre eine Division durch null nötig, deshalb gehört 0 nicht zum Definitionsbereich.'],
        ['Warum nähert sich x⁻ⁿ für große |x| der Null?', 'Der Nenner wächst unbegrenzt, während der Zähler 1 bleibt. Der Quotient wird daher beliebig klein.']
      ],
      analogy: 'Der Exponent ist der Bauplan des Graphen: Er bestimmt Symmetrie, Wachstum und Verhalten nahe der Null.',
      proofSketch: 'Für n gerade gilt (−x)ⁿ=xⁿ, für n ungerade (−x)ⁿ=−xⁿ. Bei n<0 wird xⁿ als Kehrwert einer positiven Potenz gelesen.',
      mistakeMap: [['Negativer Exponent als negatives Ergebnis', 'x⁻² bedeutet 1/x², nicht −x².'], ['0 eingesetzt', 'Bei negativem Exponenten ist x=0 ausgeschlossen.'], ['Symmetrie geraten', 'f(−x) algebraisch mit f(x) vergleichen.']],
      explainBack: ['Wie liest du Symmetrie am Exponenten ab?', 'Erkläre den Unterschied zwischen x⁻² und −x².', 'Warum besitzt 1/x eine senkrechte Asymptote?']
    },
    A2: {
      anchor: 'Bei ganzrationalen Funktionen bestimmt der Leitterm das globale Verhalten, während die übrigen Summanden den lokalen Verlauf formen.',
      why: [
        ['Warum dominiert der Leitterm?', 'Für große |x| wächst die höchste Potenz viel schneller als alle niedrigeren Potenzen. Deren Verhältnis zum Leitterm nähert sich null.'],
        ['Warum entscheidet der Grad über die Endrichtungen?', 'Gerade Grade liefern an beiden Enden dasselbe Vorzeichen, ungerade Grade entgegengesetzte Richtungen. Der Leitkoeffizient kann das Gesamtbild spiegeln.'],
        ['Warum ist Endverhalten keine vollständige Graphbeschreibung?', 'Es beschreibt nur die äußeren Bereiche. Nullstellen, Extrema und Wendepunkte bestimmen den lokalen Verlauf dazwischen.']
      ],
      analogy: 'Der Leitterm ist die Fernsicht des Graphen; niedrigere Terme verändern die Landschaft in der Nähe.',
      proofSketch: 'Teilt man f(x) durch aₙxⁿ, bleiben 1 plus Terme mit negativen x-Potenzen. Diese Zusatzterme gehen für |x|→∞ gegen 0.',
      mistakeMap: [['Konstanten für Endverhalten genutzt', 'Nur höchste Potenz und ihr Koeffizient sind entscheidend.'], ['Grad mit Anzahl der Terme verwechselt', 'Grad ist der höchste vorkommende Exponent.'], ['Nur rechte Seite betrachtet', 'x→+∞ und x→−∞ getrennt prüfen.']],
      explainBack: ['Warum kann ein kubischer Graph trotz vieler Terme nur zwei Endrichtungen besitzen?', 'Wie verändert ein negatives aₙ den Verlauf?', 'Welche Information liefert das Endverhalten nicht?']
    },
    A4: {
      anchor: 'Transformationen verändern entweder Ausgänge außerhalb der Funktion oder Eingänge innerhalb der Funktion; innere Verschiebungen wirken mit umgekehrtem Vorzeichen.',
      why: [
        ['Warum verschiebt f(x−c) nach rechts?', 'Damit der alte Funktionswert f(0) erscheint, muss nun x−c=0 und damit x=c gelten. Jeder charakteristische Punkt wandert deshalb um c nach rechts.'],
        ['Warum streckt a·f(x) vertikal?', 'Jeder y-Wert wird mit a multipliziert, während die x-Koordinate unverändert bleibt.'],
        ['Warum bewirkt f(bx) eine horizontale Skalierung?', 'Für denselben alten Eingang u muss bx=u gelten, also x=u/b. Die x-Abstände werden daher durch |b| geteilt.']
      ],
      analogy: 'Äußere Operationen verändern das Ergebnis der Maschine, innere Operationen verändern, welcher Eingang die Maschine erreicht.',
      proofSketch: 'Ist (u|f(u)) ein Punkt des Ausgangsgraphen, dann liegt bei g(x)=f(x−c) der entsprechende Punkt bei x=u+c, also (u+c|f(u)).',
      mistakeMap: [['Vorzeichen innen falsch', 'f(x−c) verschiebt nach rechts.'], ['Horizontal und vertikal verwechselt', 'Außen y, innen x.'], ['Spiegelung übersehen', 'Negative Faktoren ändern zusätzlich die Orientierung.']],
      explainBack: ['Begründe die umgekehrte Richtung innerer Verschiebungen.', 'Unterscheide a·f(x) und f(ax).', 'Wie wandert ein bekannter Punkt unter einer Transformation?']
    },
    A5: {
      anchor: 'Bei a·sin(b(x−c))+d steuern die Parameter getrennt Amplitude, Periode, Phasenverschiebung und Mittellinie.',
      why: [
        ['Warum ist die Amplitude |a|?', 'sin nimmt Werte zwischen −1 und 1 an. Multiplikation mit a skaliert diesen Abstand zur Mittellinie auf |a|.'],
        ['Warum lautet die Periode 2π/|b|?', 'Der Sinus wiederholt sich nach einer inneren Änderung von 2π. Für bx muss daher b·T=2π gelten.'],
        ['Warum verschiebt d die Mittellinie?', 'd wird zu jedem Funktionswert addiert; Maximum und Minimum steigen oder fallen um denselben Betrag.']
      ],
      analogy: 'Die Sinuskurve ist eine Welle: a regelt die Höhe, b die Wellenlänge, c den Startpunkt und d den Meeresspiegel.',
      proofSketch: 'g(x+T)=g(x) gilt, wenn b(x+T−c)=b(x−c)+2π. Daraus folgt T=2π/b beziehungsweise als positive Länge 2π/|b|.',
      mistakeMap: [['Periode mit b multipliziert', 'Großes |b| bedeutet kürzere Periode.'], ['Amplitude als a statt |a|', 'Amplitude ist ein nicht negativer Abstand.'], ['c ohne Vorzeichen gelesen', 'x−c verschiebt nach rechts.']],
      explainBack: ['Leite die Periodenformel her.', 'Wie liest du Maximum und Minimum aus a und d ab?', 'Was verändert ein negatives a zusätzlich?']
    },
    A8: {
      anchor: 'Tangente und Normale teilen denselben Berührpunkt; ihre Steigungen sind bei nicht waagerechter Tangente negative Kehrwerte.',
      why: [
        ['Warum nutzt die Tangente f′(x₀)?', 'f′(x₀) ist die lokale Graphensteigung. Eine Tangente soll genau diese Richtung im Berührpunkt besitzen.'],
        ['Warum braucht man f(x₀)?', 'Die Steigung allein bestimmt nur eine Schar paralleler Geraden. Der Funktionswert liefert den konkreten Berührpunkt.'],
        ['Warum gilt m_N=−1/m_T?', 'Für senkrechte Richtungen ist das Produkt ihrer endlichen Steigungen −1.']
      ],
      analogy: 'Die Tangente folgt der momentanen Fahrtrichtung des Graphen; die Normale steht wie eine Querachse senkrecht darauf.',
      proofSketch: 'Aus der Punkt-Steigungs-Form y−y₀=m(x−x₀) entsteht mit m=f′(x₀) die Tangente. Für orthogonale Geraden gilt m₁m₂=−1.',
      mistakeMap: [['f(x₀) und f′(x₀) vertauscht', 'f liefert Punkt, f′ liefert Steigung.'], ['Normale mit 1/m', 'Negativen Kehrwert verwenden.'], ['Steigungswinkel ohne Einheit', 'tan α=m und passenden Winkelbereich beachten.']],
      explainBack: ['Welche zwei Informationen bestimmen die Tangente eindeutig?', 'Warum ist die Normale bei m_T=0 senkrecht?', 'Erkläre die Punkt-Steigungs-Form.']
    },
    A9: {
      anchor: 'Graphisches Ableiten bedeutet, den Steigungsverlauf von f als neuen Funktionsgraphen f′ zu zeichnen.',
      why: [
        ['Warum werden Extremstellen von f zu Nullstellen von f′?', 'An glatten lokalen Extrema ist die Tangente waagerecht, also besitzt sie Steigung 0.'],
        ['Warum werden Wendestellen oft zu Extrema von f′?', 'Am Wendepunkt wechselt die Entwicklung der Steigung; f′ erreicht dort häufig ein lokales Maximum oder Minimum.'],
        ['Warum reicht das Vorzeichen allein nicht für die genaue Höhe?', 'Positiv oder negativ zeigt nur Steigen oder Fallen. Die Stärke der Steigung entscheidet über den Abstand von f′ zur x-Achse.']
      ],
      analogy: 'f′ ist ein Protokoll darüber, wie steil f an jeder Stelle verläuft.',
      proofSketch: 'Jedem x wird nicht der y-Wert von f, sondern die Tangentensteigung von f an dieser Stelle zugeordnet. Genau diese Zuordnung ist f′.',
      mistakeMap: [['f einfach kopiert', 'Bei f′ werden Steigungen, nicht Höhen übertragen.'], ['Extrempunkt von f als Extrempunkt von f′', 'Zunächst Nullstelle von f′.'], ['Steilheit nicht berücksichtigt', 'Je steiler f, desto größer |f′|.']],
      explainBack: ['Wie rekonstruierst du f′ aus einem Graphen?', 'Was bedeutet f′<0 grafisch?', 'Warum kann f′ trotz positivem f negativ sein?']
    },
    A14: {
      anchor: 'Modellieren übersetzt eine reale Situation in Mathematik, bearbeitet das Modell und prüft anschließend kritisch die Rückübersetzung.',
      why: [
        ['Warum ist die Modellannahme entscheidend?', 'Ein Term kann rechnerisch korrekt sein und dennoch die Realität schlecht beschreiben, wenn wichtige Bedingungen ignoriert wurden.'],
        ['Warum muss der Definitionsbereich sachlich eingeschränkt werden?', 'Zeit, Länge, Anzahl oder Konzentration besitzen oft natürliche Grenzen, die der reine Funktionsterm nicht automatisch kennt.'],
        ['Warum gehört Validierung zum Rechenweg?', 'Das Ergebnis muss mit Einheiten, Größenordnung, Daten und Realität verglichen werden. Erst dann ist die Modellantwort belastbar.']
      ],
      analogy: 'Ein mathematisches Modell ist eine Landkarte: nützlich, aber nicht identisch mit der Landschaft.',
      proofSketch: 'Der Modellierungskreislauf lautet Situation → mathematisches Modell → mathematische Lösung → Interpretation → Validierung und gegebenenfalls Modellrevision.',
      mistakeMap: [['Einheit vergessen', 'Jede Größe mit Bedeutung und Einheit führen.'], ['Mathematische Lösung ungefiltert übernommen', 'Sachbereich und Plausibilität prüfen.'], ['Parameter nicht gedeutet', 'Jeder Parameter muss eine Wirkung im Kontext besitzen.']],
      explainBack: ['Beschreibe den Modellierungskreislauf.', 'Wann muss eine mathematische Lösung verworfen werden?', 'Wie prüfst du ein Modell an Daten?']
    },
    G2: {
      anchor: 'Vektoroperationen kombinieren gerichtete Verschiebungen komponentenweise; Länge und Kollinearität beantworten andere geometrische Fragen.',
      why: [
        ['Warum addiert man komponentenweise?', 'Jede Komponente beschreibt die Verschiebung entlang einer unabhängigen Koordinatenachse. Gesamtverschiebungen addieren sich daher achsenweise.'],
        ['Warum ist die Länge eine Wurzel aus Quadratsummen?', 'Der Satz des Pythagoras wird nacheinander auf zwei beziehungsweise drei senkrechte Koordinatenrichtungen angewendet.'],
        ['Warum beweist ein gemeinsamer Faktor Kollinearität?', 'Ein skalares Vielfaches verändert nur Länge und möglicherweise Richtung, aber nicht die zugrunde liegende Gerade.']
      ],
      analogy: 'Vektorkomponenten sind getrennte Bewegungsanteile nach rechts, oben und in die Tiefe.',
      proofSketch: 'Für v=(v₁,v₂,v₃) gilt |v|²=v₁²+v₂²+v₃². u und v sind kollinear genau dann, wenn u=λv für ein gemeinsames λ.',
      mistakeMap: [['Komponenten gekreuzt', 'Immer dieselben Positionen miteinander verrechnen.'], ['Länge ohne Wurzel', 'Quadratsumme ist |v|², nicht |v|.'], ['Für jede Komponente anderes λ', 'Ein einziger Faktor muss für alle gelten.']],
      explainBack: ['Leite die Längenformel geometrisch her.', 'Was verändert λ an einem Vektor?', 'Wie prüfst du Kollinearität robust?']
    },
    G3: {
      anchor: 'Geometrische Figuren werden durch Beziehungen ihrer Seiten- und Diagonalvektoren bewiesen, nicht allein durch eine Zeichnung.',
      why: [
        ['Warum beweisen gleiche Seitenvektoren Parallelität und Länge?', 'Vektorgleichheit bedeutet gleiche Komponenten, damit gleiche Richtung und gleichen Betrag.'],
        ['Warum ist ein Mittelpunktvergleich nützlich?', 'Teilen sich Diagonalen denselben Mittelpunkt, halbieren sie einander – ein zentrales Parallelogrammkriterium.'],
        ['Warum reicht eine optische Skizze nicht?', 'Eine Projektion kann Längen und Winkel verzerren. Der Vektorbeweis bleibt koordinatenunabhängig überprüfbar.']
      ],
      analogy: 'Vektoren sind die messbaren Baupläne einer Figur; die Zeichnung ist nur ihre Ansicht.',
      proofSketch: 'AB=DC und AD=BC zeigen zwei Paare gleicher gegenüberliegender Seiten. Alternativ folgt aus M_AC=M_BD, dass sich die Diagonalen halbieren.',
      mistakeMap: [['Richtung eines Seitenvektors vertauscht', 'Vergleichsvektoren in passender Umlaufrichtung bilden.'], ['Nur eine Eigenschaft geprüft', 'Zum gewünschten Figurtyp vollständiges Kriterium nutzen.'], ['Koordinaten ohne Schluss', 'Aus der Rechnung explizit die geometrische Aussage folgern.']],
      explainBack: ['Beweise ein Parallelogramm auf zwei Arten.', 'Warum ist AB=CD meist die falsche Orientierung?', 'Welche Zusatzbedingung macht aus einem Parallelogramm ein Rechteck?']
    },
    G4: {
      anchor: 'Eine Gerade in Parameterform besteht aus einem bekannten Punkt und allen skalaren Vielfachen einer Richtung.',
      why: [
        ['Warum beschreibt ein Parameter unendlich viele Punkte?', 'Jeder reelle Parameterwert erzeugt einen neuen Ortsvektor auf derselben Richtungslinie.'],
        ['Warum darf der Richtungsvektor skaliert werden?', 'Ein von null verschiedener Faktor ändert die Schrittweite und eventuell Orientierung, aber nicht die Punktmenge der Geraden.'],
        ['Warum ist die Punktprobe ein gemeinsames-Parameter-Problem?', 'Alle Koordinaten müssen mit demselben Parameterwert entstehen; getrennte Parameter pro Koordinate würden keine gemeinsame Position beschreiben.']
      ],
      analogy: 'Der Stützvektor ist ein Bahnhof, der Richtungsvektor das Gleis und der Parameter die gefahrene Strecke in Gleiseinheiten.',
      proofSketch: 'Die Menge {a+r·u | r∈R} enthält a bei r=0 und alle Punkte, deren Verbindungsvektor zu a ein Vielfaches von u ist.',
      mistakeMap: [['Zwei Punkte direkt als Stütz und Richtung', 'Richtung ist B−A.'], ['Je Koordinate anderer Parameter', 'Ein Punkt benötigt denselben r-Wert in allen Komponenten.'], ['Strecke und Gerade verwechselt', 'Für Strecken Parameterintervall einschränken.']],
      explainBack: ['Was bedeuten Stützvektor, Richtungsvektor und Parameter?', 'Warum beschreiben u und 2u dieselbe Richtung?', 'Wie wird aus einer Geraden eine Strecke?']
    },
    F2: {
      anchor: 'Quadratische Gleichungen können über Produktform, quadratische Ergänzung oder Lösungsformel gelöst werden; die Struktur entscheidet über die effizienteste Methode.',
      why: [
        ['Warum liefert Produktform direkte Nullstellen?', 'Die Nullproduktregel zerlegt die Gleichung in zwei lineare Teilgleichungen.'],
        ['Warum funktioniert die quadratische Ergänzung?', 'Sie formt den Ausdruck in ein vollständiges Binom um, sodass anschließend eine Wurzelgleichung entsteht.'],
        ['Warum kann es keine reelle Lösung geben?', 'Ein Quadrat ist reell nie negativ. Führt die Ergänzung auf (x−d)²<0, existiert keine reelle Lösung.']
      ],
      analogy: 'Verschiedene Lösungsverfahren sind unterschiedliche Wege zum selben Ziel; die Termstruktur zeigt den kürzesten Weg.',
      proofSketch: 'Die pq-Formel entsteht durch quadratische Ergänzung von x²+px+q=0 zu (x+p/2)²=(p/2)²−q.',
      mistakeMap: [['± vergessen', 'Beim Wurzelziehen entstehen meist zwei Möglichkeiten.'], ['Vorzeichen in pq-Formel', 'p und q einschließlich Vorzeichen einsetzen.'], ['Unnötig kompliziert', 'Zuerst Ausklammern oder Faktorisieren prüfen.']],
      explainBack: ['Leite die pq-Formel durch Ergänzung her.', 'Wann ist Faktorisieren am schnellsten?', 'Wie erkennst du die Anzahl reeller Lösungen?']
    },
    F3: {
      anchor: 'Die Steigung einer Geraden ist die konstante Änderung von y pro Änderung von x; Achsenabschnitt und Steigung erfüllen unterschiedliche Rollen.',
      why: [
        ['Warum ist m=Δy/Δx?', 'Steigung vergleicht vertikale mit horizontaler Änderung und macht Richtungen unabhängig von der gewählten Schrittweite vergleichbar.'],
        ['Warum besitzt jede lineare Funktion konstante Steigung?', 'Für f(x)=mx+b ergibt jeder Differenzenquotient denselben Wert m, weil b beim Subtrahieren verschwindet.'],
        ['Warum ist eine senkrechte Gerade keine Funktion x↦y?', 'Zu derselben x-Koordinate gehören unendlich viele y-Werte; die eindeutige Zuordnung ist verletzt.']
      ],
      analogy: 'm ist die Steilheit einer Rampe, b ihre Höhe an der y-Achse.',
      proofSketch: '(f(x₂)−f(x₁))/(x₂−x₁)=[m(x₂−x₁)]/(x₂−x₁)=m für x₂≠x₁.',
      mistakeMap: [['Δx/Δy gerechnet', 'Vertikale Änderung durch horizontale Änderung.'], ['Punkt nicht eingesetzt', 'Mit y=mx+b den Achsenabschnitt bestimmen.'], ['Vorzeichen ignoriert', 'Fallende Geraden besitzen m<0.']],
      explainBack: ['Warum bleibt die Steigung einer Geraden konstant?', 'Wie bestimmst du eine Gerade aus Punkt und Steigung?', 'Was bedeutet m im Sachkontext?']
    },
    G6: {
      anchor: 'Ein lineares Gleichungssystem bündelt mehrere Bedingungen, die gleichzeitig erfüllt sein müssen; Anzahl und Art der Lösungen besitzen geometrische Bedeutung.',
      why: [
        ['Warum müssen Gleichungen gleichzeitig gelten?', 'Jede Gleichung beschreibt eine Bedingung. Eine Lösung ist nur dann gültig, wenn sie alle Bedingungen zur selben Zeit erfüllt.'],
        ['Warum kann ein LGS keine, eine oder unendlich viele Lösungen haben?', 'Bedingungen können sich widersprechen, sich eindeutig schneiden oder teilweise dieselbe Information ausdrücken.'],
        ['Warum ist Rückeinsetzen mehr als Formalität?', 'Es kontrolliert, ob die ermittelten Parameter tatsächlich alle ursprünglichen Koordinatengleichungen erfüllen.']
      ],
      analogy: 'Jede Gleichung ist ein Filter; die Lösung besteht aus den Werten, die durch alle Filter gleichzeitig hindurchpassen.',
      proofSketch: 'Äquivalente Zeilenumformungen erhalten die Lösungsmenge. Eine Widerspruchszeile 0=c≠0 zeigt keine Lösung, eine Nullzeile kann auf freie Parameter hinweisen.',
      mistakeMap: [['Nur zwei Raumgleichungen genutzt', 'Dritte Gleichung als Konsistenzbedingung prüfen.'], ['Parameter vertauscht', 'Variablenbezeichnungen konsequent beibehalten.'], ['Widerspruch übersehen', 'Jede Endzeile inhaltlich interpretieren.']],
      explainBack: ['Deute die drei möglichen Lösungssituationen.', 'Warum erhalten Zeilenumformungen die Lösungsmenge?', 'Wie dient ein LGS zur Geradenschnittprüfung?']
    }
  };

  const genericDeepDive = {
    anchor: 'Verstehe zuerst, welche mathematische Frage das Thema beantwortet, bevor du ein Verfahren auswählst.',
    why: [
      ['Warum braucht man mehrere Darstellungen?', 'Term, Graph, Tabelle und Sprache zeigen unterschiedliche Eigenschaften. Tiefes Verständnis entsteht, wenn du zwischen ihnen übersetzen kannst.'],
      ['Warum reicht Auswendiglernen nicht?', 'Neue Aufgaben verändern Oberfläche und Zahlen. Nur ein verstandenes Konzept hilft, das passende Verfahren selbst zu erkennen.'],
      ['Warum müssen Ergebnisse kontrolliert werden?', 'Plausibilität, Einheiten, Vorzeichen und eine zweite Darstellung können Fehler entdecken, die im Rechenweg unbemerkt bleiben.']
    ],
    analogy: 'Ein Verfahren ist ein Werkzeug. Wer nur den Handgriff kennt, weiß noch nicht, wann das Werkzeug passt.',
    proofSketch: 'Jede Formel beruht auf Definitionen und bereits bewiesenen Zusammenhängen. Prüfe Voraussetzungen, wende die Regel an und deute das Resultat zurück in die Ausgangsfrage.',
    mistakeMap: [['Formel zu früh gewählt', 'Erst gegebene und gesuchte Größen identifizieren.'], ['Zwischenschritte ausgelassen', 'Jede Regeländerung in einer eigenen Zeile zeigen.'], ['Ergebnis nicht gedeutet', 'Antwortsatz, Einheit oder geometrische Bedeutung ergänzen.']],
    explainBack: ['Welche Leitfrage beantwortet dieses Thema?', 'Welche Voraussetzungen benötigt das wichtigste Verfahren?', 'Wie kannst du dein Ergebnis unabhängig kontrollieren?']
  };

  const pathwayCatalog = [
    ['linear', 'Gleichung vollständig lösen', 'Algebra', 'F0'],
    ['quadratic', 'Quadratische Gleichung', 'Algebra', 'F2'],
    ['derivative', 'Ableitung mit Begründung', 'Analysis', 'A10'],
    ['rate', 'Mittlere Änderungsrate', 'Analysis', 'A6'],
    ['extrema', 'Extrempunkte untersuchen', 'Analysis', 'A11'],
    ['inflection', 'Wendepunkt nachweisen', 'Analysis', 'A12'],
    ['curve', 'Kurvendiskussion', 'Analysis', 'A13'],
    ['line', 'Geradenschnitt im Raum', 'Geometrie', 'G5']
  ];

  const examBlueprints = {
    basis: { title: 'EF Grundlagen-Check', minutes: 60, generatorIds: ['linear','quadratic','slope','functionValue','power','roots','averageRate','derivative','vectorAdd','midpoint'] },
    analysis: { title: 'Analysis-Klausur EF', minutes: 90, generatorIds: ['functionValue','power','endBehavior','roots','transform','averageRate','derivative','tangent','extrema','inflection','curveReasoning'] },
    geometry: { title: 'Vektorgeometrie-Klausur EF', minutes: 90, generatorIds: ['vectorAdd','vectorScale','vectorLength','collinear','midpoint','pointOnLine','lineIntersection','linePosition','geometryProof'] },
    full: { title: 'Große EF-NRW-Simulation', minutes: 120, generatorIds: ['quadratic','endBehavior','roots','transform','averageRate','derivative','tangent','extrema','inflection','vectorAdd','pointOnLine','lineIntersection','linePosition'] }
  };

  const diagnosisPaths = {
    Konzept: ['Erkläre die zentrale Idee ohne Formel.', 'Ordne Beispiel und Gegenbeispiel zu.', 'Löse danach eine einfache Transferfrage.'],
    Verfahren: ['Markiere den ersten falschen Rechenschritt.', 'Benenne die dort benötigte Regel.', 'Löse eine parallele Aufgabe mit sichtbaren Zwischenschritten.'],
    Algebra: ['Isoliere die algebraische Teiloperation.', 'Wiederhole die passende Grundregel.', 'Setze den reparierten Schritt in die Hauptaufgabe zurück.'],
    Vorzeichen: ['Kreise jedes negative Vorzeichen ein.', 'Schreibe Minusklammern vollständig aus.', 'Führe eine Einsetzprobe durch.'],
    Vollständigkeit: ['Liste alle Kandidaten auf.', 'Prüfe jeden Kandidaten einzeln.', 'Formuliere, warum keine weitere Lösung existiert.'],
    Koordinaten: ['Arbeite komponentenweise.', 'Halte Parameter und Koordinaten getrennt.', 'Prüfe das Ergebnis in jeder Koordinate.'],
    Interpretation: ['Nenne Größe und Einheit.', 'Übersetze das Ergebnis in einen vollständigen Satz.', 'Prüfe, ob das Vorzeichen im Kontext sinnvoll ist.'],
    Flüchtigkeit: ['Verlangsame auf einen Schritt pro Zeile.', 'Führe eine unabhängige Kontrolle aus.', 'Bearbeite eine ähnliche Aufgabe mit Selbstkontrolle.']
  };

  window.MATHFORGE_V03_DATA = {
    deepDives,
    genericDeepDive,
    pathwayCatalog,
    examBlueprints,
    diagnosisPaths,
    version: '0.3'
  };
})();
