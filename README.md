# MATHFORGE NRW V1.0 FINAL

MATHFORGE NRW ist eine lokal laufende Lern-App für die Mathematik-Einführungsphase in Nordrhein-Westfalen. Sie verbindet ausführliche Masterclasses, adaptive Übungen, Rechenwegdiagnose, Visualisierungen, Wiederholungsplanung und klausurähnliches Training.

## Direkt starten

1. Alle Dateien dieses Pakets gemeinsam in ein GitHub-Repository hochladen.
2. Die Dateien müssen direkt in der obersten Ebene des Repositorys liegen.
3. GitHub öffnen: **Settings → Pages**.
4. **Deploy from a branch**, Branch **main**, Ordner **/ (root)** auswählen.
5. Nach der Veröffentlichung die angezeigte GitHub-Pages-Adresse öffnen.

Es sind weder npm noch ein Build-Befehl, ein Konto oder ein Backend erforderlich.

## Umfang

- 24 vollständige Masterclasses
- alle 31 abgebildeten EF-Kompetenzen in Analysis und Vektorgeometrie
- 91 variable Aufgabengeneratoren
- 96 feste Aufgaben
- 45 geführte Beispiele
- 12 Diagnoseaufgaben
- 21 Klausurformate
- 8 mehrteilige Transfer- und Modellierungsmissionen
- 14 interaktive Visual-Labore
- 36 Formeln mit Bedeutung und Einsatzhinweisen
- Rechenweg-Rubrik mit Teilpunkten
- Fehlerdiagnose und Reparaturpfade
- langfristige Wiederholungsplanung
- lokaler Lernstand ohne Anmeldung

## Hauptbereiche

- **Heute:** nächster sinnvoller Lernschritt, Wiederholungen und Fehlerfokus
- **Lernen:** Grundlagen, Analysis und Vektorgeometrie als geführte Masterclasses
- **Üben:** geführtes Training, freie Aufgaben und Fehlerfokus
- **Klausuren:** Zeitmodus, Teilpunkte, Erwartungshorizonte und Reparaturrouten
- **Fortschritt:** Mastery, Kompetenzatlas, Fehlerprofil und Lernverlauf

Spezialwerkzeuge wie Kurvendiskussions-Simulator, Graphen-Labor, Vektorraum, Formelwerk und Diagnose bleiben untergeordnet erreichbar, damit die Hauptoberfläche übersichtlich bleibt.

## Speicherung und Übernahme älterer Versionen

Der Lernstand wird ausschließlich im Browser auf dem jeweiligen Gerät gespeichert. V1.0 versucht vorhandene Daten aus V0.6, V0.5, V0.4, V0.3 und V0.2 automatisch zu übernehmen.

Wer Browserdaten löscht oder einen anderen Browser beziehungsweise ein anderes Gerät verwendet, beginnt dort mit einem neuen lokalen Lernstand.

## Offline-Nutzung

MathJax für die Formeldarstellung ist lokal enthalten. Nach dem ersten Laden über GitHub Pages speichert der Service Worker die App-Dateien für die Offline-Nutzung. Die Installation als Home-Bildschirm-App hängt vom verwendeten Browser und Betriebssystem ab.

## Mathematische Eingaben

Die Antwortprüfung unterstützt unter anderem:

- ganze Zahlen, Dezimalzahlen und Brüche
- deutsches Dezimalkomma
- Eingaben wie `x = 3`
- Lösungsmengen wie `x₁ = -2, x₂ = 5`
- Punkte und Vektoren
- leere Menge `∅`
- mathematisch äquivalente Terme in den vorgesehenen Aufgabentypen
- Einheiten bei numerischen Antworten

## Ehrliche Grenze

V1.0 deckt den definierten EF-Lernumfang der App vollständig ab und wurde intensiv geprüft. Eine rein lokale Regel-Engine kann dennoch nicht jeden denkbaren freien Beweis, jede ungewöhnliche Formulierung oder jeden alternativen Lösungsweg semantisch verstehen. Bei offenen Begründungen bleibt mathematisches Urteilsvermögen wichtig.

## Dateien

Alle Dateien liegen flach nebeneinander. Die Versionsdateinamen `mathforge-v03-*`, `mathforge-v05-*` und `mathforge-v06-*` sind interne, aufeinander aufbauende Module und dürfen nicht entfernt oder umbenannt werden.

Weitere Details stehen in `BUILD_REPORT.txt`, `CHANGELOG_V1.0.txt` und `GITHUB_UPLOAD.txt`.
