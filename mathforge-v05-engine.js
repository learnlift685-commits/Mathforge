(() => {
  'use strict';

  const E = window.MATHFORGE_ENGINE;
  const oldGenerate = E.generate.bind(E);
  const rand = E.randInt;
  const pick = E.choice;
  const shuffle = E.shuffle;

  const id = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const nonZero = (min, max) => { let n = 0; while (!n) n = rand(min, max); return n; };
  const signed = n => n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`;
  const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n * 1000) / 1000).replace('.', ',');
  const vecLatex = v => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
  const task = spec => ({
    id: id('V5'), type: 'text', answerKind: 'numeric', accepted: [], options: [], tolerance: 1e-6,
    hints: [], solutionSteps: [], explanation: '', points: 3, difficulty: 3,
    masteryDimension: 'Transfer', skill: 'EF', ...spec
  });

  function expandBrackets() {
    const a = nonZero(-5,5), b = rand(-7,7), c = nonZero(-5,5), d = rand(-7,7);
    const A = a*c, B = a*d+b*c, C = b*d;
    const answer = `${A}x^2 ${signed(B)}x ${signed(C)}`;
    return task({lessonId:'F0',skill:'ALG-1',title:'Doppelte Klammer ausmultiplizieren',answerKind:'expression',answer,
      prompt:`Vereinfache vollständig: \\(${a===1?'':a===-1?'-':a}x ${signed(b)}\\)\\(${c===1?'':c===-1?'-':c}x ${signed(d)}\\).`,
      hints:['Multipliziere jeden Summanden der ersten Klammer mit jedem Summanden der zweiten.','Ordne nach Potenzen von x.','Fasse nur gleichartige Terme zusammen.'],
      solutionSteps:[`x²-Term: ${a}·${c}x²=${A}x²`,`x-Term: ${a}·${d}x+${b}·${c}x=${B}x`,`Konstante: ${b}·${d}=${C}`,`Ergebnis: \\(${answer}\\)`],
      explanation:'Die vier Teilprodukte werden gebildet und anschließend nach x², x und Konstanten zusammengefasst.',
      mistakes:[{kind:'text',value:`${A}x^2 ${signed(a*d)}x ${signed(C)}`,type:'Vollständigkeit',title:'Ein Kreuzprodukt fehlt',repair:'Bei zwei Binomen entstehen vier Teilprodukte.'}]});
  }

  function fractionEquation() {
    const den = pick([2,3,4,5]), x = rand(-6,8), b = rand(-5,5), c = (x+b)/den;
    const rhs = Number.isInteger(c) ? c : Math.round(c*100)/100;
    // Ensure exact convenient equation by deriving numerator from rhs.
    const numeratorConst = den*rhs-x;
    return task({lessonId:'F0',skill:'ALG-2',title:'Bruchgleichung lösen',answer:x,
      prompt:`Löse \\(\\frac{x ${signed(numeratorConst)}}{${den}}=${fmt(rhs)}\\).`,
      hints:[`Multipliziere beide Seiten mit ${den}.`,'Isoliere danach x.','Führe eine Einsetzprobe durch.'],
      solutionSteps:[`\\(x ${signed(numeratorConst)}=${fmt(den*rhs)}\\)`,`\\(x=${x}\\)`],
      explanation:`Durch Multiplikation mit ${den} verschwindet der Nenner; anschließend wird die Konstante auf die andere Seite gebracht.`});
  }

  function parabolaVertex() {
    const h=rand(-5,5), k=rand(-6,6), a=pick([-3,-2,-1,1,2,3]);
    return task({lessonId:'F2',skill:'F-PAR',title:'Scheitelpunkt ablesen',answerKind:'point',answer:[h,k],
      prompt:`Bestimme den Scheitelpunkt von \\(f(x)=${a}(x${h>=0?'-':'+'}${Math.abs(h)})^2 ${signed(k)}\\).`,
      hints:['Vergleiche mit a(x−h)²+k.','Das Vorzeichen in der Klammer wird beim Ablesen umgekehrt.'],
      solutionSteps:[`Normalform der Scheitelpunktform: \\(a(x-h)^2+k\\)`,`Hier gilt h=${h}, k=${k}.`,`\\(S(${h}|${k})\\)`],
      explanation:'In der Scheitelpunktform lassen sich die Koordinaten direkt ablesen; das Klammerzeichen ist entgegengesetzt zur x-Koordinate.'});
  }

  function lineEquation() {
    const m=nonZero(-5,5), x0=rand(-4,4), y0=rand(-7,7), b=y0-m*x0;
    return task({lessonId:'F3',skill:'F-LIN',title:'Geradengleichung aus Punkt und Steigung',answerKind:'expression',answer:`${m}x ${signed(b)}`,
      prompt:`Eine Gerade besitzt die Steigung \\(m=${m}\\) und geht durch \\(P(${x0}|${y0})\\). Bestimme \\(f(x)\\).`,
      hints:['Nutze y=mx+b.','Setze die Punktkoordinaten ein und löse nach b.'],
      solutionSteps:[`\\(${y0}=${m}·${x0}+b\\)`,`\\(b=${b}\\)`,`\\(f(x)=${m}x ${signed(b)}\\)`],
      explanation:'Der Punkt bestimmt zusammen mit der vorgegebenen Steigung den noch fehlenden y-Achsenabschnitt.'});
  }

  function domainRange() {
    const type=pick(['reciprocal','root','square']);
    if(type==='reciprocal'){
      const h=rand(-4,4); return task({lessonId:'F1',skill:'F-DOM',title:'Definitionsbereich erkennen',type:'choice',answerKind:'choice',
        prompt:`Welcher Definitionsbereich gehört zu \\(f(x)=\\frac{1}{x${h>=0?'-':'+'}${Math.abs(h)}}\\)?`,
        options:shuffle([`\\(\\mathbb R\\setminus\\{${h}\\}\\)`,`\\(\\mathbb R\\setminus\\{${-h}\\}\\)`,`\\([${h};\\infty[\\)`,`\\(\\mathbb R\\)`]),
        get answer(){return String.fromCharCode(65+this.options.indexOf(`\\(\\mathbb R\\setminus\\{${h}\\}\\)`));},
        hints:['Der Nenner darf nicht 0 werden.'],solutionSteps:[`\\(x-${h}=0\\Rightarrow x=${h}\\) ausschließen.`],explanation:`Alle reellen Zahlen außer ${h} sind zulässig.`});
    }
    if(type==='root'){
      const h=rand(-4,4); const correct=`\\([${h};\\infty[\\)`; const options=shuffle([correct,`\\(]-\\infty;${h}]\\)`,`\\(\\mathbb R\\setminus\\{${h}\\}\\)`,`\\(\\mathbb R\\)`]);
      return task({lessonId:'F1',skill:'F-DOM',title:'Definitionsbereich erkennen',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Welcher Definitionsbereich gehört zu \\(f(x)=\\sqrt{x${h>=0?'-':'+'}${Math.abs(h)}}\\)?`,hints:['Unter einer reellen Quadratwurzel muss der Radikand ≥0 sein.'],solutionSteps:[`\\(x-${h}\\ge0\\Rightarrow x\\ge${h}\\)`],explanation:`Zulässig sind alle x ab ${h}.`});
    }
    const k=rand(-5,5); const correct=`\\([${k};\\infty[\\)`; const options=shuffle([correct,`\\(]-\\infty;${k}]\\)`,`\\(\\mathbb R\\)`,`\\(\\mathbb R\\setminus\\{${k}\\}\\)`]);
    return task({lessonId:'F1',skill:'F-RANGE',title:'Wertebereich einer Parabel',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Bestimme den Wertebereich von \\(f(x)=(x-2)^2 ${signed(k)}\\).`,hints:['Ein Quadrat ist nie negativ.','Der Scheitel besitzt den kleinsten y-Wert.'],solutionSteps:[`\\((x-2)^2\\ge0\\)`,`\\(f(x)\\ge${k}\\)`],explanation:`Die nach oben geöffnete Parabel hat ihr Minimum bei y=${k}.`});
  }

  function negativePower() {
    const n=pick([1,2,3,4]), x=pick([-3,-2,-1,1,2,3]), val=1/(x**n);
    return task({lessonId:'A1',skill:'A-POT',title:'Negative Exponenten auswerten',answer:val,
      prompt:`Berechne \\(f(${x})\\) für \\(f(x)=x^{-${n}}\\).`,
      hints:[`Schreibe x^{-${n}} als 1/x^${n}.`,'Achte bei negativem x auf gerade oder ungerade Exponenten.'],
      solutionSteps:[`\\(${x}^{-${n}}=\\frac{1}{${x}^{${n}}}\\)`,`\\(=${fmt(val)}\\)`],
      explanation:'Ein negativer Exponent bedeutet Kehrwert, nicht negatives Vorzeichen.'});
  }

  function polynomialDegree() {
    const degree=pick([3,4,5,6]), lead=nonZero(-5,5), lower=degree-1, c=rand(-8,8);
    const signText = degree%2===0 ? (lead>0?'beidseitig +∞':'beidseitig −∞') : (lead>0?'links −∞, rechts +∞':'links +∞, rechts −∞');
    const options=shuffle([signText,'beidseitig +∞','beidseitig −∞','links 0, rechts 0']);
    return task({lessonId:'A2',skill:'A-END',title:'Grad und Endverhalten',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(signText)),
      prompt:`Welches Endverhalten besitzt \\(f(x)=${lead}x^{${degree}} ${signed(nonZero(-5,5))}x^{${lower}} ${signed(c)}\\)?`,
      hints:['Für |x|→∞ dominiert der Leitterm.','Prüfe Gradparität und Vorzeichen des Leitkoeffizienten.'],
      solutionSteps:[`Leitterm: \\(${lead}x^{${degree}}\\)`,`Grad ${degree} ist ${degree%2?'ungerade':'gerade'}.`,`Daher: ${signText}.`],
      explanation:'Niedrigere Potenzen verändern das globale Endverhalten nicht.'});
  }

  function rootsStrategy() {
    const form=pick(['factor','common','biquad']);
    let prompt, correct, explanation;
    if(form==='factor'){const r1=rand(-5,-1),r2=rand(1,5);prompt=`\\((x${r1>=0?'-':'+'}${Math.abs(r1)})(x${r2>=0?'-':'+'}${Math.abs(r2)})=0\\)`;correct='Nullproduktregel direkt anwenden';explanation='Die Gleichung liegt bereits als Produkt vor.';}
    else if(form==='common'){const a=nonZero(-5,5),b=nonZero(-6,6);prompt=`\\(${a}x^3 ${signed(b)}x^2=0\\)`;correct='x² ausklammern und Nullproduktregel anwenden';explanation='Ein gemeinsamer Faktor x² ist sichtbar.';}
    else {const p=pick([1,4,9]),q=pick([4,9,16]);prompt=`\\(x^4-${p+q}x^2+${p*q}=0\\)`;correct='z=x² substituieren';explanation='Nur gerade Potenzen treten auf; die Gleichung ist biquadratisch.';}
    const options=shuffle([correct,'sofort ableiten','durch x teilen','nur eine Wertetabelle zeichnen']);
    return task({lessonId:'A3',skill:'A-ROOT',title:'Nullstellenmethode auswählen',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Welche Methode ist am effizientesten für ${prompt}?`,hints:['Achte zuerst auf die sichtbare Termstruktur.'],solutionSteps:[explanation],explanation});
  }

  function transformComposition() {
    const a=pick([-3,-2,-1,2,3]), h=rand(-4,4), k=rand(-5,5);
    const correct=`${a<0?'Spiegelung an der x-Achse und ':''}${Math.abs(a)!==1?`vertikale Streckung mit Faktor ${Math.abs(a)}, `:''}Verschiebung um ${Math.abs(h)} nach ${h>=0?'rechts':'links'} und ${Math.abs(k)} nach ${k>=0?'oben':'unten'}`;
    const options=shuffle([correct,`Verschiebung um ${Math.abs(h)} nach ${h>=0?'links':'rechts'} und ${Math.abs(k)} nach ${k>=0?'unten':'oben'}`,'nur horizontale Streckung','keine Veränderung gegenüber x²']);
    return task({lessonId:'A4',skill:'A-TRANS',title:'Transformation vollständig beschreiben',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Beschreibe die Transformation von \\(g(x)=x^2\\) zu \\(f(x)=${a}(x${h>=0?'-':'+'}${Math.abs(h)})^2 ${signed(k)}\\).`,hints:['Außenparameter wirken vertikal.','Das Zeichen in der Klammer wird für die Verschiebung umgekehrt.'],solutionSteps:[`a=${a}: ${a<0?'Spiegelung; ':''}${Math.abs(a)!==1?`Faktor ${Math.abs(a)}`:'keine Streckung'}`,`h=${h}: horizontal`, `k=${k}: vertikal`],explanation:correct});
  }

  function sinePeriod() {
    const b=pick([0.5,1,2,3,4]), period=2*Math.PI/Math.abs(b);
    return task({lessonId:'A5',skill:'A-SIN',title:'Periode einer Sinusfunktion',answer:period,tolerance:0.01,
      prompt:`Bestimme die Periodenlänge von \\(f(x)=3\\sin(${b}x)-2\\). Gib einen Dezimalwert an.`,
      hints:['Für sin(bx) gilt T=2π/|b|.','Amplitude und Verschiebung verändern die Periode nicht.'],
      solutionSteps:[`\\(T=\\frac{2\\pi}{|${b}|}\\)`,`\\(T\\approx${fmt(period)}\\)`],
      explanation:'Nur der Faktor im Argument verändert die Periodenlänge.'});
  }

  function derivativeDefinition() {
    const x0=rand(-4,4), a=nonZero(-4,4), b=rand(-5,5), expected=2*a*x0+b;
    return task({lessonId:'A7',skill:'A-DIFFQ',title:'Ableitung über den Differenzenquotienten',answer:expected,
      prompt:`Bestimme mit der h-Methode die lokale Änderungsrate von \\(f(x)=${a}x^2 ${signed(b)}x\\) an \\(x_0=${x0}\\).`,
      hints:['Bilde [f(x₀+h)−f(x₀)]/h.','Multipliziere die Klammern vollständig aus.','Kürze h und bilde erst dann h→0.'],
      solutionSteps:[`\\(\\frac{f(${x0}+h)-f(${x0})}{h}\\) aufstellen`,`Nach Vereinfachung: \\(${2*a*x0+b}+${a}h\\)`,`\\(h\\to0\\Rightarrow ${expected}\\)`],
      explanation:'Die h-Terme verschwinden erst im Grenzwert; der verbleibende Wert ist die Tangentensteigung.'});
  }

  function tangentEquation() {
    const a=nonZero(-3,3), b=rand(-5,5), c=rand(-5,5), x0=rand(-3,3), y0=a*x0*x0+b*x0+c, m=2*a*x0+b, n=y0-m*x0;
    return task({lessonId:'A8',skill:'A-TAN',title:'Tangente als Funktionsterm',answerKind:'expression',answer:`${m}x ${signed(n)}`,
      prompt:`Bestimme die Tangente an \\(f(x)=${a}x^2 ${signed(b)}x ${signed(c)}\\) bei \\(x_0=${x0}\\).`,
      hints:['Berechne f(x₀) und f′(x₀).','Nutze y=m(x−x₀)+y₀ und vereinfache.'],
      solutionSteps:[`\\(f(${x0})=${y0}\\)`,`\\(f'(x)=${2*a}x ${signed(b)},\\;f'(${x0})=${m}\\)`,`\\(t(x)=${m}x ${signed(n)}\\)`],
      explanation:'Berührpunkt und lokale Steigung bestimmen die Tangente eindeutig.'});
  }

  function graphDerivativeSign() {
    const situation=pick([
      {text:'f steigt und wird dabei immer steiler',correct:'f′ ist positiv und nimmt zu'},
      {text:'f fällt und wird dabei immer flacher',correct:'f′ ist negativ und nähert sich 0'},
      {text:'f besitzt einen lokalen Hochpunkt',correct:'f′ wechselt von positiv zu negativ'},
      {text:'f besitzt einen lokalen Tiefpunkt',correct:'f′ wechselt von negativ zu positiv'}
    ]);
    const options=shuffle([situation.correct,'f′ ist überall 0','f′ besitzt dort zwingend eine Nullstelle von f','f′ hat immer dasselbe Vorzeichen wie f']);
    return task({lessonId:'A9',skill:'A-GRAPH',title:'f und f′ qualitativ verbinden',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(situation.correct)),prompt:`Welche Aussage über \\(f'\\) passt sicher, wenn ${situation.text}?`,hints:['f′ beschreibt Steigung, nicht Funktionshöhe.'],solutionSteps:[situation.correct],explanation:`${situation.correct}.`});
  }

  function negativeExponentDerivative() {
    const a=nonZero(-6,6), n=pick([1,2,3,4]), answer=`${-a*n}x^${-n-1}`;
    return task({lessonId:'A10',skill:'A-DER',title:'Negative Potenzen ableiten',answerKind:'expression',answer,
      prompt:`Leite \\(f(x)=${a}x^{-${n}}\\) ab.`,
      hints:['Die Potenzregel gilt auch für negative ganzzahlige Exponenten.','Multipliziere mit dem alten Exponenten und vermindere ihn um 1.'],
      solutionSteps:[`\\(f'(x)=${a}·(-${n})x^{-${n}-1}\\)`,`\\(f'(x)=${answer}\\)`],
      explanation:'Der neue Exponent ist noch negativer; das Minus des Exponenten beeinflusst den Koeffizienten.'});
  }

  function derivativeValue() {
    const a=nonZero(-4,4), b=nonZero(-5,5), c=rand(-5,5), x0=rand(-3,3), val=3*a*x0*x0+2*b*x0;
    return task({lessonId:'A10',skill:'A-DER',title:'Ableitungswert bestimmen',answer:val,
      prompt:`Berechne \\(f'(${x0})\\) für \\(f(x)=${a}x^3 ${signed(b)}x^2 ${signed(c)}\\).`,
      hints:['Bilde zuerst die Ableitungsfunktion.','Setze danach x₀ ein.'],
      solutionSteps:[`\\(f'(x)=${3*a}x^2 ${signed(2*b)}x\\)`,`\\(f'(${x0})=${val}\\)`],
      explanation:'Ableiten und Einsetzen sind zwei getrennte Schritte.'});
  }

  function monotonicIntervals() {
    const r=rand(1,4), a=pick([1,2,-1,-2]);
    const correct=a>0?`fallend auf ]-${r};${r}[`:`steigend auf ]-${r};${r}[`;
    const options=shuffle([correct,a>0?`steigend auf ]-${r};${r}[`:`fallend auf ]-${r};${r}[`,'überall steigend','überall fallend']);
    return task({lessonId:'A11',skill:'A-MONO',title:'Monotonie aus einer Ableitung',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Gegeben ist \\(f'(x)=${a}(x^2-${r*r})\\). Welche Aussage stimmt?`,hints:['Untersuche das Vorzeichen zwischen den Nullstellen −r und r.'],solutionSteps:[`Für |x|<${r} gilt x²−${r*r}<0.`,`Mit a=${a} folgt: ${correct}.`],explanation:correct});
  }

  function curvatureIntervals() {
    const h=rand(-4,4), a=pick([1,2,-1,-2]);
    const correct=a>0?`f ist für x>${h} linksgekrümmt und für x<${h} rechtsgekrümmt`:`f ist für x>${h} rechtsgekrümmt und für x<${h} linksgekrümmt`;
    const options=shuffle([correct,'f besitzt keine Krümmung','f ist überall linksgekrümmt','f ist überall rechtsgekrümmt']);
    return task({lessonId:'A12',skill:'A-CURV',title:'Krümmungsintervalle aus f″',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Gegeben ist \\(f''(x)=${a}(x-${h})\\). Welche Krümmungsaussage ist korrekt?`,hints:['Bestimme das Vorzeichen links und rechts von h.','f″>0 bedeutet linksgekrümmt.'],solutionSteps:[`Nullstelle von f″: x=${h}.`,`Vorzeichenwechsel an ${h}.`,correct],explanation:correct});
  }

  function rateInterpretation() {
    const rate=pick([-8,-5,-3,2,4,7]), unit=pick(['Liter pro Minute','Meter pro Sekunde','Euro pro Monat']);
    const correct=rate>0?`Die betrachtete Größe nimmt im Mittel um ${rate} ${unit} zu.`:`Die betrachtete Größe nimmt im Mittel um ${Math.abs(rate)} ${unit} ab.`;
    const options=shuffle([correct,`Die Größe beträgt insgesamt ${Math.abs(rate)} ${unit}.`,'Die Funktion besitzt dort zwingend eine Nullstelle.','Das Ergebnis beschreibt einen Flächeninhalt.']);
    return task({lessonId:'A14',skill:'A-MODEL',title:'Änderungsrate im Kontext deuten',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Eine mittlere Änderungsrate beträgt \\(${rate}\\) ${unit}. Welche Deutung ist korrekt?`,hints:['Achte auf das Vorzeichen und das Wort „pro“.'],solutionSteps:[correct],explanation:correct});
  }

  function lineModel() {
    const m=pick([2,3,4,5,6]), b=rand(5,30), x=rand(2,8), y=m*x+b;
    return task({lessonId:'A14',skill:'A-MODEL',title:'Lineares Modell anwenden',answer:y,
      prompt:`Ein Grundpreis beträgt ${b} € und jede Einheit kostet ${m} €. Wie hoch sind die Gesamtkosten für ${x} Einheiten?`,
      hints:['Modell: K(x)=m·x+b.','m beschreibt Kosten pro Einheit, b den Fixpreis.'],
      solutionSteps:[`\\(K(${x})=${m}·${x}+${b}\\)`,`\\(K(${x})=${y}\\)`],
      explanation:`Die Gesamtkosten betragen ${y} €.`});
  }

  function modelParameter() {
    const t=pick([2,3,4]), y=pick([20,30,40,50]), a=y/(t*t);
    return task({lessonId:'A14',skill:'A-MODEL',title:'Parameter aus einer Bedingung',answer:a,
      prompt:`Ein Modell lautet \\(s(t)=a t^2\\). Nach ${t} s gilt \\(s=${y}\\) m. Bestimme a.`,
      hints:['Setze t und s in das Modell ein.','Löse nach a.'],
      solutionSteps:[`\\(${y}=a·${t}^2\\)`,`\\(a=${fmt(a)}\\)`],
      explanation:'Der Parameter wird so bestimmt, dass das Modell die gegebene Bedingung erfüllt.'});
  }

  function modelValidity() {
    const correct='Das Modell ist nur in dem Bereich vertrauenswürdig, in dem Annahmen und Datenlage passen.';
    const options=shuffle([correct,'Ein Polynommodell ist für alle Zeiten exakt.','Ein gutes Modell benötigt keine Einheiten.','Extrapolation ist immer genauer als Interpolation.']);
    return task({lessonId:'A14',skill:'A-MODEL',title:'Modellgrenzen beurteilen',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:'Welche Aussage über mathematische Modelle ist fachlich korrekt?',hints:['Ein Modell ist eine vereinfachte Beschreibung, keine identische Kopie der Realität.'],solutionSteps:[correct],explanation:correct});
  }

  function vectorSub() {
    const a=[rand(-6,6),rand(-6,6),rand(-6,6)],b=[rand(-6,6),rand(-6,6),rand(-6,6)],ans=b.map((v,i)=>v-a[i]);
    return task({lessonId:'G1',skill:'G-VEC',title:'Verbindungsvektor bilden',answerKind:'vector',answer:ans,prompt:`Bestimme \\(\\overrightarrow{AB}\\) für \\(A(${a.join('|')})\\) und \\(B(${b.join('|')})\\).`,hints:['Ziel minus Start: B−A.','Rechne jede Komponente getrennt.'],solutionSteps:[`\\(\\overrightarrow{AB}=${vecLatex(b)}-${vecLatex(a)}\\)`,`\\(=${vecLatex(ans)}\\)`],explanation:'Der Verbindungsvektor zeigt vom Startpunkt A zum Zielpunkt B.'});
  }

  function distancePoints() {
    const a=[rand(-4,4),rand(-4,4),rand(-4,4)],d=[pick([-3,-2,-1,1,2,3]),pick([-3,-2,-1,1,2,3]),pick([-3,-2,-1,1,2,3])],b=a.map((v,i)=>v+d[i]),dist=Math.sqrt(d.reduce((s,v)=>s+v*v,0));
    return task({lessonId:'G2',skill:'G-DIST',title:'Abstand zweier Punkte',answer:dist,tolerance:0.01,prompt:`Berechne den Abstand von \\(A(${a.join('|')})\\) und \\(B(${b.join('|')})\\).`,hints:['Bilde zuerst den Verbindungsvektor.','Nutze dessen Länge.'],solutionSteps:[`\\(\\overrightarrow{AB}=${vecLatex(d)}\\)`,`\\(|AB|=\\sqrt{${d.map(v=>`${v}^2`).join('+')}}\\)`,`\\(|AB|\\approx${fmt(dist)}\\)`],explanation:'Der Abstand ist die Länge des Verbindungsvektors.'});
  }

  function lineFromPoints() {
    const a=[rand(-4,4),rand(-4,4),rand(-4,4)],u=[nonZero(-4,4),nonZero(-4,4),nonZero(-4,4)],b=a.map((v,i)=>v+u[i]);
    const correct=`Stützvektor ${a.join('|')}, Richtungsvektor ${u.join('|')}`;
    const options=shuffle([correct,`Stützvektor ${a.join('|')}, Richtungsvektor ${b.join('|')}`,`Stützvektor ${u.join('|')}, Richtungsvektor ${a.join('|')}`,'Die Punkte bestimmen keine Gerade']);
    return task({lessonId:'G4',skill:'G-LINE',title:'Gerade durch zwei Punkte',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Welche Parameterdarstellung beschreibt die Gerade durch \\(A(${a.join('|')})\\) und \\(B(${b.join('|')})\\)?`,hints:['Ein möglicher Stützvektor ist A.','Der Richtungsvektor ist B−A.'],solutionSteps:[`\\(\\overrightarrow{AB}=${vecLatex(u)}\\)`,correct],explanation:'Ein Punkt liefert den Stützvektor; die Differenz der Punkte liefert die Richtung.'});
  }

  function segmentParameter() {
    const a=[rand(-3,3),rand(-3,3),rand(-3,3)],u=[nonZero(-3,3),nonZero(-3,3),nonZero(-3,3)],r=pick([0,0.25,0.5,0.75,1]),p=a.map((v,i)=>v+r*u[i]);
    return task({lessonId:'G4',skill:'G-SEG',title:'Punkt auf einer Strecke',answerKind:'point',answer:p,prompt:`Die Strecke wird beschrieben durch \\(\\vec x=${vecLatex(a)}+r${vecLatex(u)},\\;0\\le r\\le1\\). Bestimme den Punkt für \\(r=${fmt(r)}\\).`,hints:['Multipliziere den Richtungsvektor mit r.','Addiere komponentenweise zum Stützvektor.'],solutionSteps:[`\\(r\\vec u=${vecLatex(u.map(v=>v*r))}\\)`,`\\(P(${p.join('|')})\\)`],explanation:'Der Parameter legt fest, wie weit man vom Startpunkt in Richtung des Endpunkts geht.'});
  }

  function lineParallelTest() {
    const u=[nonZero(-3,3),nonZero(-3,3),nonZero(-3,3)],k=pick([-3,-2,2,3]),v=u.map(x=>k*x);
    const correct='Die Richtungsvektoren sind Vielfache; die Geraden sind parallel oder identisch.';
    const options=shuffle([correct,'Die Geraden schneiden sich zwingend.','Die Geraden sind zwingend windschief.','Die Richtungsvektoren sind orthogonal.']);
    return task({lessonId:'G5',skill:'G-POS',title:'Parallelität vorprüfen',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Was folgt aus \\(\\vec u=${vecLatex(u)}\\) und \\(\\vec v=${vecLatex(v)}\\)?`,hints:['Suche einen gemeinsamen Skalar k.','Parallelität allein unterscheidet noch nicht identisch/echt parallel.'],solutionSteps:[`\\(\\vec v=${k}\\vec u\\)`,correct],explanation:correct});
  }

  function lgsClassification() {
    const kind=pick(['one','none','many']);
    let equations, correct, expl;
    if(kind==='one'){equations=['x+y=5','x−y=1'];correct='genau eine Lösung';expl='Die Gleichungen sind unabhängig und schneiden sich eindeutig.';}
    else if(kind==='none'){equations=['x+y=5','2x+2y=12'];correct='keine Lösung';expl='Die linken Seiten sind Vielfache, die rechten nicht: Widerspruch.';}
    else {equations=['x+y=5','2x+2y=10'];correct='unendlich viele Lösungen';expl='Die zweite Gleichung ist vollständig ein Vielfaches der ersten.';}
    const options=shuffle([correct,'genau zwei Lösungen','nur die Null-Lösung','nicht entscheidbar']);
    return task({lessonId:'G6',skill:'G-LGS',title:'Lösungssituation eines LGS',type:'choice',answerKind:'choice',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Wie viele Lösungen besitzt das LGS \\(${equations[0]},\\;${equations[1]}\\)?`,hints:['Vergleiche die Koeffizientenverhältnisse und die rechten Seiten.'],solutionSteps:[expl],explanation:expl});
  }

  const newGenerators = {
    expandBrackets, fractionEquation, parabolaVertex, lineEquation, domainRange, negativePower,
    polynomialDegree, rootsStrategy, transformComposition, sinePeriod, derivativeDefinition,
    tangentEquation, graphDerivativeSign, negativeExponentDerivative, derivativeValue,
    monotonicIntervals, curvatureIntervals, rateInterpretation, lineModel, modelParameter,
    modelValidity, vectorSub, distancePoints, lineFromPoints, segmentParameter,
    lineParallelTest, lgsClassification
  };

  const catalog = [
    ['expandBrackets','F0','Klammern ausmultiplizieren'],['fractionEquation','F0','Bruchgleichungen'],
    ['parabolaVertex','F2','Scheitelpunkte'],['lineEquation','F3','Geradengleichungen'],
    ['domainRange','F1','Definitions- und Wertebereiche'],['negativePower','A1','Negative Potenzen'],
    ['polynomialDegree','A2','Grad und Leitterm'],['rootsStrategy','A3','Nullstellenstrategie'],
    ['transformComposition','A4','Kombinierte Transformationen'],['sinePeriod','A5','Sinusperiode'],
    ['derivativeDefinition','A7','Ableitung aus Definition'],['tangentEquation','A8','Tangentengleichungen'],
    ['graphDerivativeSign','A9','Graphisch ableiten'],['negativeExponentDerivative','A10','Negative Potenzen ableiten'],
    ['derivativeValue','A10','Ableitungswerte'],['monotonicIntervals','A11','Monotonieintervalle'],
    ['curvatureIntervals','A12','Krümmungsintervalle'],['rateInterpretation','A14','Raten interpretieren'],
    ['lineModel','A14','Lineare Modelle'],['modelParameter','A14','Modellparameter'],['modelValidity','A14','Modellkritik'],
    ['vectorSub','G1','Verbindungsvektoren'],['distancePoints','G2','Punktabstände'],
    ['lineFromPoints','G4','Geraden aus Punkten'],['segmentParameter','G4','Streckenparameter'],
    ['lineParallelTest','G5','Parallelität prüfen'],['lgsClassification','G6','LGS-Lösungssituationen']
  ];

  E.generate = function(generatorId, difficulty=2) {
    const fn = newGenerators[generatorId];
    if (fn) {
      const generated = fn(difficulty);
      generated.difficulty = difficulty;
      return generated;
    }
    return oldGenerate(generatorId, difficulty);
  };

  for (const entry of catalog) {
    if (!E.generatorCatalog.some(item => item[0] === entry[0])) E.generatorCatalog.push(entry);
  }

  E.v5Generators = Object.keys(newGenerators);
})();
