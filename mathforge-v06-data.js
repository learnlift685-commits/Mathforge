(() => {
  'use strict';

  const operatorGuide = {
    berechnen: {
      label: 'Berechnen',
      meaning: 'Führe ein nachvollziehbares Rechenverfahren aus und gib das Ergebnis an.',
      checklist: ['passende Formel oder Gleichung', 'sichtbare Zwischenschritte', 'Endergebnis mit Einheit, falls nötig']
    },
    bestimmen: {
      label: 'Bestimmen',
      meaning: 'Ermittle das verlangte mathematische Objekt mit einem geeigneten Verfahren.',
      checklist: ['Methode auswählen', 'Objekt vollständig angeben', 'bei Punkten alle Koordinaten nennen']
    },
    begründen: {
      label: 'Begründen',
      meaning: 'Verknüpfe eine Aussage mit einer mathematischen Regel, Bedingung oder Folgerung.',
      checklist: ['Behauptung nennen', 'passende Bedingung oder Regel', 'logische Folgerung formulieren']
    },
    erläutern: {
      label: 'Erläutern',
      meaning: 'Erkläre einen Zusammenhang verständlich und stütze ihn durch Mathematik.',
      checklist: ['Zusammenhang beschreiben', 'mathematische Größe einbeziehen', 'Bedeutung in Worten nennen']
    },
    interpretieren: {
      label: 'Interpretieren',
      meaning: 'Übersetze ein mathematisches Ergebnis zurück in den gegebenen Sachzusammenhang.',
      checklist: ['Größe benennen', 'Einheit nennen', 'Bedeutung und ggf. Gültigkeitsbereich erklären']
    },
    beurteilen: {
      label: 'Beurteilen',
      meaning: 'Triff anhand nachvollziehbarer Kriterien ein begründetes Urteil.',
      checklist: ['Kriterium nennen', 'Ergebnis damit vergleichen', 'Urteil samt Einschränkung formulieren']
    },
    nachweisen: {
      label: 'Nachweisen',
      meaning: 'Zeige vollständig, dass eine geforderte Eigenschaft aus überprüfbaren Bedingungen folgt.',
      checklist: ['Kriterium nennen', 'alle nötigen Bedingungen prüfen', 'Schlussfolgerung eindeutig formulieren']
    }
  };

  const errorTaxonomy = {
    Konzept: {
      signal: 'Die Bedeutung einer Größe, Definition oder Bedingung wurde verwechselt.',
      repair: ['Begriff ohne Rechnung erklären', 'Gegenbeispiel untersuchen', 'erst danach ein einfaches Verfahren anwenden']
    },
    Methodenwahl: {
      signal: 'Ein grundsätzlich unpassendes oder unnötig kompliziertes Verfahren wurde gewählt.',
      repair: ['Strukturmerkmale markieren', 'Entscheidungsbaum nutzen', 'zwei Verfahren vergleichen']
    },
    Algebra: {
      signal: 'Das mathematische Konzept stimmt, aber eine Umformung ist nicht äquivalent.',
      repair: ['ersten abweichenden Schritt finden', 'Umformungsregel benennen', 'Parallelaufgabe mit Probe lösen']
    },
    Vorzeichen: {
      signal: 'Minuszeichen, Faktor oder Richtung wurde beim Umformen verloren oder vertauscht.',
      repair: ['Vorzeichen farblich markieren', 'Zwischenschritt einzeln schreiben', 'durch Einsetzen kontrollieren']
    },
    Darstellung: {
      signal: 'Ein Ergebnis ist inhaltlich fast richtig, aber unvollständig oder im falschen mathematischen Format.',
      repair: ['gefragtes Objekt bestimmen', 'Notation vergleichen', 'Punkt, Menge, Vektor oder Term vollständig notieren']
    },
    Begründung: {
      signal: 'Das Ergebnis wird behauptet, aber die mathematische Verbindung fehlt.',
      repair: ['Behauptung-Regel-Folgerung schreiben', 'Operator-Checkliste nutzen', 'Begründung an einem Gegenbeispiel testen']
    },
    Interpretation: {
      signal: 'Das Ergebnis wurde nicht oder falsch in den Sachkontext zurückübersetzt.',
      repair: ['Größe und Einheit nennen', 'Vorzeichen deuten', 'Gültigkeitsbereich des Modells prüfen']
    },
    Kontrolle: {
      signal: 'Ein plausibilisierender Test, eine Probe oder eine notwendige Zusatzprüfung fehlt.',
      repair: ['Rückeinsetzen', 'Graph und Algebra vergleichen', 'dritte Koordinate oder Randbedingungen prüfen']
    },
    Flüchtigkeit: {
      signal: 'Der Lösungsweg ist grundsätzlich verstanden, aber ein vermeidbarer Einzelversatz kostet Punkte.',
      repair: ['Abgabecheck verwenden', 'kritische Zeile neu rechnen', '60-Sekunden-Kontrolle trainieren']
    }
  };

  const examBlueprints = {
    noTools45: {
      title: 'Hilfsmittelfreier EF-Check', minutes: 45,
      sections: [{ title: 'Teil A · ohne Hilfsmittel', aid: 'Keine digitalen Hilfsmittel', generatorIds: ['fractionEquation','quadratic','rootsStrategy','derivativeDefinition','tangentParallel','vectorLinearCombination','linePointAtParameter'] }]
    },
    parameters75: {
      title: 'Parameter & Bedingungen', minutes: 75,
      sections: [
        { title: 'Teil A · Struktur', aid: 'ohne Hilfsmittel', generatorIds: ['discriminantParameter','quadraticParameterRoot','polynomialCoefficientFromPoint','tangentParallel'] },
        { title: 'Teil B · Transfer', aid: 'Taschenrechner/Graphenansicht erlaubt', generatorIds: ['parameterExtremaV6','polynomialFromConditions','modelOptimization','lgsParameterConsistency'] }
      ]
    },
    transfer90: {
      title: 'EF-Transferklausur', minutes: 90,
      sections: [
        { title: 'Teil A · Basistechniken', aid: 'ohne Hilfsmittel', generatorIds: ['transformationRecover','averageRateMissingValue','derivativeRuleSelection','stationaryPointClassify'] },
        { title: 'Teil B · Vernetzung', aid: 'Hilfsmittel erlaubt', generatorIds: ['reconstructCubic','curveConsistencyChoice','compareModels','motionCollisionTime','lineSegmentIntersection'] }
      ]
    },
    modeling90: {
      title: 'Modellierung, Deutung & Kritik', minutes: 90,
      sections: [
        { title: 'Teil A · Modell verstehen', aid: 'ohne Hilfsmittel', generatorIds: ['modelUnits','compareModels','lineModel','rateInterpretation'] },
        { title: 'Teil B · Modell bearbeiten', aid: 'Hilfsmittel erlaubt', generatorIds: ['modelOptimization','polynomialCoefficientFromPoint','modelParameter','modelValidity','sinusPhaseShift'] }
      ]
    },
    geometryTransfer90: {
      title: 'Raumgeometrie Transfer', minutes: 90,
      sections: [
        { title: 'Teil A · Vektoren', aid: 'ohne Hilfsmittel', generatorIds: ['vectorLinearCombination','parallelogramFourthPoint','geometryProof','linePointAtParameter'] },
        { title: 'Teil B · Geraden & Bewegung', aid: 'Hilfsmittel erlaubt', generatorIds: ['motionCollisionTime','lineSegmentIntersection','linePosition','lgsParameterConsistency','vectorMotion'] }
      ]
    },
    preExam120: {
      title: 'Große V1.0-Generalprobe', minutes: 120,
      sections: [
        { title: 'Teil A · hilfsmittelfrei', aid: 'Keine digitalen Hilfsmittel', generatorIds: ['fractionEquation','discriminantParameter','negativePower','derivativeDefinition','normalEquationV6','vectorLinearCombination','linePointAtParameter'] },
        { title: 'Teil B · Analysis', aid: 'Hilfsmittel erlaubt', generatorIds: ['polynomialFromConditions','parameterExtremaV6','inflectionTangent','reconstructCubic','modelOptimization','curveConsistencyChoice'] },
        { title: 'Teil C · Vektorgeometrie', aid: 'Hilfsmittel erlaubt', generatorIds: ['parallelogramFourthPoint','motionCollisionTime','lineSegmentIntersection','lgsParameterConsistency'] }
      ]
    },
    oral30: {
      title: 'Mündlicher Mathe-Check', minutes: 30,
      sections: [{ title: 'Erklären · Begründen · Entscheiden', aid: 'ohne Hilfsmittel', generatorIds: ['reciprocalDomainReasoning','derivativeGraphFeature','derivativeRuleSelection','curveConsistencyChoice','compareModels','lgsParameterConsistency'] }]
    },
    challenge100: {
      title: 'EF Challenge – schwere Mischung', minutes: 100,
      sections: [
        { title: 'Teil A · sichere Basis', aid: 'ohne Hilfsmittel', generatorIds: ['quadraticParameterRoot','transformationRecover','tangentParallel','terracePoint'] },
        { title: 'Teil B · schwere Vernetzung', aid: 'Hilfsmittel erlaubt', generatorIds: ['polynomialFromConditions','parameterExtremaV6','reconstructCubic','modelOptimization','motionCollisionTime','lineSegmentIntersection'] }
      ]
    }
  };

  const examCards = [
    ['noTools45','45 Minuten','Hilfsmittelfreier EF-Check','Kurze, saubere Basistechniken ohne digitale Unterstützung.','7 Aufgaben'],
    ['parameters75','75 Minuten','Parameter & Bedingungen','Parameter aus Nullstellen, Punkten, Extrema und LGS-Bedingungen bestimmen.','8 Aufgaben'],
    ['transfer90','90 Minuten','EF-Transferklausur','Methodenwahl, Vernetzung und neue Darstellungen statt bloßer Routine.','9 Aufgaben'],
    ['modeling90','90 Minuten','Modellierung & Kritik','Modelle aufstellen, optimieren, interpretieren und begründet begrenzen.','9 Aufgaben'],
    ['geometryTransfer90','90 Minuten','Raumgeometrie Transfer','Figuren, Bewegung, Strecken und Geraden in mehrteiligen Zusammenhängen.','9 Aufgaben'],
    ['preExam120','120 Minuten','Große V1.0-Generalprobe','Drei Teile: hilfsmittelfrei, Analysis und Vektorgeometrie.','17 Aufgaben'],
    ['oral30','30 Minuten','Mündlicher Mathe-Check','Begründen, erklären, interpretieren und Methoden vergleichen.','6 Aufgaben'],
    ['challenge100','100 Minuten','EF Challenge','Schwere Parameter-, Rekonstruktions- und Transferaufgaben.','10 Aufgaben']
  ];

  const caseCards = [
    ['ramp','Skatepark-Rampe','Kurvendiskussion, Extrema, Wende und Modellgrenzen in einem zusammenhängenden Entwurf.','Analysis · 6 Teilaufgaben'],
    ['solar','Solarleistung','Parabelmodell, Nullstellen, Maximum, Änderungsrate und Sachinterpretation.','Funktionen · 5 Teilaufgaben'],
    ['temperature','Tages-Temperatur','Sinusparameter, Periode, Phasenlage und Modellkritik.','Sinus · 5 Teilaufgaben'],
    ['drone','Drohnen-Routen','Parametergeraden, Kollisionszeit, Schnittpunkt und Sicherheitsentscheidung.','Vektoren · 5 Teilaufgaben'],
    ['park','Geometrischer Stadtpark','Vektoren, Parallelogramm, Längen und Nachweise.','Vektoren · 5 Teilaufgaben'],
    ['traffic','Verkehrsmodelle','Zwei Modelle vergleichen, Schnittpunkt deuten und Gültigkeit beurteilen.','Modellierung · 5 Teilaufgaben'],
    ['tank','Wasserbehälter','Änderungsraten, Tangente, Extremum und Interpretation eines kubischen Modells.','Analysis · 6 Teilaufgaben'],
    ['robot','Roboter im Lager','Bewegungsvektoren, Streckenparameter und Begegnungsprüfung.','Geometrie · 5 Teilaufgaben']
  ];

  const completionCriteria = [
    ['curriculum','Lehrplanabdeckung','Alle 31 verbindlichen EF-Kompetenzen sind mindestens einer Masterclass zugeordnet.'],
    ['concept','Konzepttiefe','Definition, Bedeutung, Herleitung, Beispiel und typische Fehlvorstellung.'],
    ['method','Verfahren','Entscheidungsweg, geführtes Beispiel, freie Aufgabe und Rechenwegkontrolle.'],
    ['transfer','Transfer','Mischaufgaben, Sachkontexte, Parameter oder neue Darstellungen.'],
    ['assessment','Prüfung','Klausuraufgaben, Operatoren, Teilpunkte und Erwartungshorizont.'],
    ['retention','Langzeitlernen','Abrufplanung, Fehlerreparatur und zeitversetzte Wiederholung.'],
    ['visual','Visualisierung','Passendes Labor, Graph oder räumliche Darstellung, wo es fachlich hilft.']
  ];

  window.MATHFORGE_V06_DATA = {
    version: '1.0',
    operatorGuide,
    errorTaxonomy,
    examBlueprints,
    examCards,
    caseCards,
    completionCriteria
  };
})();
