# MATHFORGE NRW V0.3 — INTELLIGENCE & SIMULATION

MATHFORGE NRW ist eine lokale, direkt auf GitHub Pages nutzbare Lern-App für Mathematik in der Einführungsphase der gymnasialen Oberstufe in Nordrhein-Westfalen.

V0.3 baut auf dem Deep-Learning-System aus V0.2 auf und erweitert es um Rechenweg-Intelligenz, automatisierte Teilpunkte, vollständige Warum-Erklärungen, Kurvendiskussions-Simulationen, einen drehbaren 3D-Vektorraum und einen adaptiven Wochenplan.

## Direkt auf GitHub hochladen

Alle Dateien dieses Ordners gehören direkt in die oberste Ebene des Repositorys. Es gibt keinen `src`-, `dist`- oder `assets`-Ordner und keinen Build-Schritt.

Danach in GitHub:

1. **Settings** öffnen.
2. **Pages** auswählen.
3. **Deploy from a branch** einstellen.
4. Branch **main** und Ordner **/ (root)** auswählen.
5. Speichern.

## Zentrale Neuerungen in V0.3

### Rechenweg-Engine

Acht mehrstufige Missionen prüfen nicht nur das Endergebnis:

- lineare Gleichungen
- quadratische Gleichungen
- Ableitungen
- mittlere Änderungsraten
- Extrempunkte
- Wendepunkte
- vollständige Kurvendiskussion
- Geradenschnitt im Raum

Jeder Schritt besitzt eine Rubrik für mathematische Antwort und Begründung. Die App kann richtige Teilstrukturen erkennen, Teilpunkte vergeben und den ersten abweichenden Gedanken als Reparaturpunkt markieren.

### Warum-Labor für alle 24 Module

Jede Masterclass enthält jetzt zusätzlich:

- mentalen Anker
- mehrere ausführliche Warum-Fragen
- anschauliche Analogie
- Beweisidee oder Herleitung
- Fehler-Landkarte
- Teach-back-Fragen

Damit wird eine Regel nicht nur angewendet, sondern begründet, abgegrenzt und mit anderen Darstellungen verbunden.

### Kurvendiskussions-Simulator

Der Simulator führt über sieben verknüpfte Untersuchungsphasen:

1. Endverhalten
2. erste Ableitung
3. kritische Stellen
4. zweite Ableitung
5. Wendepunkt
6. Wendetangente
7. konsistentes Gesamtbild

Die Graphen von `f`, `f′` und `f″` können einzeln eingeblendet und gemeinsam verglichen werden.

### 3D-Vektorraum

Der Raum kann gedreht, geneigt und gezoomt werden. Er erzeugt Szenen mit:

- sich schneidenden Geraden
- parallelen Geraden
- identischen Geraden
- windschiefen Geraden

Die visuelle Vermutung wird anschließend durch Richtungsvergleich, Punktprobe oder Parameter-LGS abgesichert.

### Klausurzentrum 3.0

Vier Simulationen stehen bereit:

- 60-Minuten-Grundlagencheck
- 90-Minuten-Analysis-Klausur
- 90-Minuten-Vektorgeometrie-Klausur
- 120-Minuten-Gesamtsimulation

Die Auswertung trennt Ergebnis-Punkte und Begründungs-Punkte, zeigt einen Erwartungshorizont und erstellt eine priorisierte Reparaturroute. Die automatisierte Noten- und Teilpunkteauswertung ist ausdrücklich eine Lern-Näherung und ersetzt keine Lehrkraftbewertung.

### Adaptiver Wochenplan

Der Plan kombiniert:

- fälligen Langzeitabruf
- schwächste Mastery-Werte
- offene Fehler
- Masterclass-Blöcke
- gemischtes Training
- Exit-Tickets

## Gesamtumfang

- 24 vollständige Masterclasses
- 72 Theorieblöcke
- 45 ausführliche Beispiele
- 96 feste Lernaufgaben
- 12 Diagnoseaufgaben
- 34 Generatorfamilien
- 8 Rechenweg-Missionen
- 24 vollständige Warum-Labore
- 4 Klausurformate
- 4 Arten räumlicher Geradenszenen
- 36 Formeln mit Bedeutung und Einsatzhinweisen
- 31 verknüpfte NRW-EF-Kompetenzen

## Speicherung

Der Lernstand liegt ausschließlich im lokalen Browser-Speicher. Es gibt keine Anmeldung, kein Konto, keine Cloud und kein Backend. V0.2-Lernstände werden beim ersten Start automatisch in V0.3 übernommen.

## Dateien

- `index.html` — Einstiegspunkt
- `styles.css` — vollständiges Design
- `mathforge-data.js` — Grundcurriculum und Lerninhalte
- `mathforge-v03-data.js` — Warum-Labore, Rubriken und V0.3-Struktur
- `mathforge-engine.js` — Basis-Aufgaben- und Mathematik-Engine
- `mathforge-v03-engine.js` — Rechenweg-, Teilpunkte-, Klausur- und Simulationslogik
- `app.js` — Benutzeroberfläche und lokaler Lernzustand
- `BUILD_REPORT.txt` — Qualitäts- und Testbericht
- `CHANGELOG_V0.3.txt` — Änderungen gegenüber V0.2
- `GITHUB_UPLOAD.txt` — kurze Upload-Anleitung
