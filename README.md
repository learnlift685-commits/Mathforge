# MATHFORGE NRW V0.2 — DEEP LEARNING BUILD

MATHFORGE NRW ist eine lokale, direkt auf GitHub Pages lauffähige Mathematik-Lernplattform für die Einführungsphase der gymnasialen Oberstufe in NRW.

## Direkt starten

Alle Dateien liegen flach nebeneinander. Es gibt kein npm, keinen Build-Schritt, keine Anmeldung und kein Backend.

1. Alle Dateien dieses Ordners in die oberste Ebene eines GitHub-Repositorys hochladen.
2. In GitHub `Settings → Pages` öffnen.
3. `Deploy from a branch`, Branch `main`, Ordner `/ (root)` auswählen.
4. Speichern und die von GitHub angezeigte Pages-Adresse öffnen.

## V0.2: Vom Antwort-Quiz zum tiefen Lernsystem

V0.2 trennt Lernen in acht Phasen:

1. Orientieren: Ziele, Voraussetzungen und Vorwissen.
2. Konzept verstehen: Bedeutung, Darstellungen und Zusammenhänge.
3. Beispiele zerlegen: Entscheidungen eines vollständigen Lösungswegs nachvollziehen.
4. Geführt anwenden: mit gestuften Hinweisen selbst rechnen.
5. Selbst erklären: Warum-Fragen beantworten und Wissen sprachlich ordnen.
6. Selbstständig lösen: ohne Hilfe und mit gemischten Aufgabentypen.
7. Transfer leisten: unbekannte Darstellungen und Sachkontexte bearbeiten.
8. Langfristig sichern: zeitversetzt abrufen und Fehler reparieren.

## Enthalten

- 24 große Lernmodule
- 96 feste, vollständig erklärte Aufgaben
- 12 Diagnoseaufgaben
- 31 verknüpfte NRW-EF-Kompetenzen
- 27 prozedurale Aufgabengeneratoren
- 4 getrennte Mastery-Dimensionen: Verständnis, Verfahren, Transfer, Langzeitabruf
- Masterclasses mit Lernzielen, Voraussetzungen, Konzeptkern, Algorithmus, Mikrofertigkeiten und Exit-Tickets
- Infinite Forge für immer neue Aufgabenvarianten
- fünf Step-Coach-Missionen für Ableitungen, Nullstellen, Änderungsraten, Kurvendiskussionen und Geradenschnitte
- gestufte Hinweise statt sofortiger Komplettlösung
- vollständige Lösungswege
- Selbst-Erklärungen und Reflexionsfragen
- Sicherheitsbewertung vor der Auswertung
- mathematische Äquivalenzprüfung bei Termen
- Zahl-, Term-, Lösungsmenge-, Punkt-, Vektor- und Multiple-Choice-Auswertung
- Fehlerklassifikation mit Reparaturhinweisen
- automatisch erzeugte ähnliche Reparaturaufgaben
- adaptives Wiederholungssystem
- Eingangsdiagnose mit priorisierter Reparaturroute
- Smart Practice mit gemischten Themen
- zwei dynamisch erzeugte Klausurformate mit Zeit, Punkten und Notennäherung
- Graphen-Labor mit Funktion und Ableitung
- Formelwerk mit 36 Einträgen, Bedeutungen und Einsatzhinweisen
- Lernanalyse und Fehler-DNA
- Dark/Light Mode und iPad-Navigation
- ausschließlich lokale Speicherung im Browser

## Generatorfamilien

Algebra, Termvereinfachung, quadratische Gleichungen, Geradensteigung, Funktionswerte, Potenzfunktionen, Endverhalten, Nullstellen, Transformationen, Sinusparameter, mittlere Änderungsrate, Differenzenquotient, Ableitungen, Tangenten, Normalen, Monotonie, Extrema, Wendepunkte, Symmetrie, Vektoraddition, Skalarmultiplikation, Vektorlänge, Kollinearität, Mittelpunkte, Punktproben, Geradenschnitte und Lagebeziehungen.

## Dateien

- `index.html` — Einstieg und flache GitHub-Verknüpfung
- `styles.css` — vollständiges responsives Design
- `mathforge-data.js` — Lehrplan, Masterclasses, Theorie, Formeln und feste Aufgaben
- `mathforge-engine.js` — Generatoren, Parser, Äquivalenz-, Antwort- und Fehlerlogik
- `app.js` — Navigation, Lernzustand, Lernmodi, Klausuren, Graphen und UI
- `GITHUB_UPLOAD.txt` — kurze Upload-Anleitung
- `BUILD_REPORT.txt` — Prüfbericht
- `CHANGELOG_V0.2.txt` — Änderungen gegenüber V0.1

## Speicherung

Der Lernstand liegt unter `mathforge_nrw_v02` im Local Storage des Browsers. Ein vorhandener V0.1-Lernstand wird beim ersten Öffnen übernommen. Browserdaten zu löschen entfernt auch den lokalen Lernstand.

## Hinweis zur Formeldarstellung

Mathematische Formeln werden über MathJax dargestellt. Dadurch erscheinen Brüche, Potenzen, Ableitungen, Vektoren, Grenzwerte und Gleichungssysteme als echte mathematische Notation statt als sichtbare HTML-Tags.
