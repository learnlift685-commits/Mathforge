(() => {
  'use strict';

  const E = window.MATHFORGE_ENGINE;
  const V3 = window.MATHFORGE_V03_DATA;
  if (!E || !V3) throw new Error('MATHFORGE V0.3 benötigt Basis-Engine und V0.3-Daten.');

  const originalGenerate = E.generate.bind(E);
  const originalCreateExam = E.createExam.bind(E);
  const { randInt, choice, shuffle, evaluateExpression, expressionEquivalent, parseNumber, parseTuple, parseSet } = E;
  const EPS = 1e-6;
  const near = (a, b, tolerance = EPS) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));
  const nonZero = (min = -5, max = 5) => { let n = 0; while (!n) n = randInt(min, max); return n; };
  const signed = n => n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`;
  const fmt = n => Number.isInteger(n) ? String(n) : Number(n.toFixed(4)).toString().replace('.', ',');
  const latexVector = v => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
  const id = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  function task(data) {
    return {
      id: id('V3'), type: 'numeric', answerKind: 'numeric', accepted: [], options: [], tolerance: 1e-6,
      hints: [], solutionSteps: [], explanation: '', points: 3, difficulty: 3, masteryDimension: 'Transfer',
      ...data
    };
  }

  function genCurveReasoning() {
    const a = choice([-2, -1, 1, 2]);
    const options = shuffle([
      'f ist dort steigend, weil f′ positiv ist',
      'f besitzt dort zwingend eine Nullstelle',
      'f ist dort rechtsgekrümmt, weil f′ positiv ist',
      'f′ ist dort null, weil f positiv ist'
    ]);
    return task({
      lessonId: 'A11', skill: 'A14', title: 'Graphenbeziehung begründen', type: 'choice', answerKind: 'choice',
      prompt: `An einer Stelle x₀ gilt f′(x₀)=${a > 0 ? a : Math.abs(a)} > 0. Welche Aussage ist sicher?`,
      options, answer: String.fromCharCode(65 + options.indexOf('f ist dort steigend, weil f′ positiv ist')),
      hints: ['f′ beschreibt die lokale Steigung.', 'Trenne Aussagen über f, f′ und f″.'],
      solutionSteps: ['Positives f′ bedeutet positive lokale Steigung.', 'Daher ist f in einer Umgebung von x₀ steigend.'],
      explanation: 'Das Vorzeichen von f′ entscheidet über lokale Monotonie; es sagt nicht automatisch etwas über Nullstellen oder Krümmung.',
      reasoningKeywords: ['ableitung', 'steigung', 'positiv', 'steigend']
    });
  }

  function genGeometryProof() {
    const A = [randInt(-3, 2), randInt(-3, 2), randInt(-3, 2)];
    const u = [nonZero(-3, 3), nonZero(-3, 3), nonZero(-3, 3)];
    const v = [nonZero(-3, 3), nonZero(-3, 3), nonZero(-3, 3)];
    const B = A.map((x, i) => x + u[i]);
    const D = A.map((x, i) => x + v[i]);
    const C = A.map((x, i) => x + u[i] + v[i]);
    const options = shuffle(['Parallelogramm', 'gleichseitiges Dreieck', 'windschiefes Viereck', 'Gerade']);
    return task({
      lessonId: 'G3', skill: 'G7', title: 'Figur vektoriell nachweisen', type: 'choice', answerKind: 'choice', points: 4,
      prompt: `Gegeben sind A(${A.join('|')}), B(${B.join('|')}), C(${C.join('|')}) und D(${D.join('|')}). Welche Figur ist durch \\(\\overrightarrow{AB}=\\overrightarrow{DC}\\) und \\(\\overrightarrow{AD}=\\overrightarrow{BC}\\) nachgewiesen?`,
      options, answer: String.fromCharCode(65 + options.indexOf('Parallelogramm')),
      hints: ['Vergleiche gegenüberliegende Seitenvektoren.', 'Gleiche gerichtete Seiten sind parallel und gleich lang.'],
      solutionSteps: [`\\(\\overrightarrow{AB}=(${u.join('|')})=\\overrightarrow{DC}\\)`, `\\(\\overrightarrow{AD}=(${v.join('|')})=\\overrightarrow{BC}\\)`, 'Damit sind beide Paare gegenüberliegender Seiten parallel und gleich lang.'],
      explanation: 'Die Vektorgleichheiten sind ein vollständiges Parallelogrammkriterium.',
      reasoningKeywords: ['gegenüberliegend', 'parallel', 'gleich lang', 'vektor']
    });
  }

  function genMotionModel() {
    const v0 = randInt(2, 8), a = choice([-2, -1, 1, 2]), t = randInt(2, 5);
    const s = x => v0 * x + a * x * x;
    const average = (s(t) - s(0)) / t;
    return task({
      lessonId: 'A14', skill: 'A19', title: 'Bewegungsmodell interpretieren', answer: average,
      prompt: `Der Ort eines Körpers wird für t≥0 durch \\(s(t)=${v0}t ${signed(a)}t^2\\) beschrieben. Bestimme die mittlere Geschwindigkeit im Intervall [0;${t}].`,
      hints: ['Nutze den Differenzenquotienten für s.', `Berechne s(${t}) und s(0).`],
      solutionSteps: [`\\(s(${t})=${s(t)}\\)`, `\\(\\bar v=\\frac{${s(t)}-0}{${t}-0}=${fmt(average)}\\)`],
      explanation: `Die mittlere Geschwindigkeit beträgt ${fmt(average)} Längeneinheiten pro Zeiteinheit.`,
      reasoningKeywords: ['differenzenquotient', 'änderung', 'zeit', 'einheit']
    });
  }

  function genParameterExtrema() {
    const k = nonZero(-4, 4);
    const expected = k > 0 ? 'Tiefpunkt' : 'Hochpunkt';
    const options = shuffle(['Tiefpunkt', 'Hochpunkt', 'Wendepunkt', 'keine besondere Stelle']);
    return task({
      lessonId: 'A11', skill: 'A15', title: 'Parameter und Extremtyp', type: 'choice', answerKind: 'choice',
      prompt: `Für \\(f_k(x)=${k}x^2\\) gilt f′(0)=0. Welcher Extremtyp liegt bei x=0 vor?`,
      options, answer: String.fromCharCode(65 + options.indexOf(expected)),
      hints: ['Betrachte das Vorzeichen von f″.', `f″(x)=${2 * k}.`],
      solutionSteps: [`\\(f''(0)=${2 * k}\\)`, `${2 * k > 0 ? 'positiv → Tiefpunkt' : 'negativ → Hochpunkt'}`],
      explanation: `Da f″(0)=${2 * k} ist, liegt ein ${expected.toLowerCase()} vor.`,
      reasoningKeywords: ['zweite ableitung', 'positiv', 'negativ', expected.toLowerCase()]
    });
  }

  function genVectorMotion() {
    const p = [randInt(-4, 4), randInt(-4, 4), randInt(-4, 4)];
    const v = [nonZero(-3, 3), nonZero(-3, 3), nonZero(-3, 3)];
    const time = randInt(2, 6);
    const q = p.map((x, i) => x + time * v[i]);
    return task({
      lessonId: 'G4', skill: 'G8', title: 'Bewegung mit Vektoren', type: 'text', answerKind: 'point', points: 3,
      prompt: `Ein Objekt startet in P(${p.join('|')}) und bewegt sich pro Zeiteinheit um \\(\\vec v=${latexVector(v)}\\). Wo befindet es sich nach ${time} Zeiteinheiten?`,
      answer: q, hints: ['Nutze P+t·v.', 'Berechne jede Koordinate getrennt.'],
      solutionSteps: [`\\(P+${time}\\vec v=(${q.join('|')})\\)`],
      explanation: `Nach ${time} Zeiteinheiten liegt das Objekt bei (${q.join('|')}).`,
      reasoningKeywords: ['stützpunkt', 'parameter', 'richtung', 'komponente']
    });
  }

  function genSecantTangent() {
    const x0 = randInt(-3, 3);
    const h = choice([1, 0.5, 0.25]);
    const quotient = 2 * x0 + h;
    return task({
      lessonId: 'A7', skill: 'A7', title: 'Sekante nähert Tangente', answer: quotient,
      prompt: `Für f(x)=x² und die Stelle x₀=${x0}: Berechne den Differenzenquotienten für h=${String(h).replace('.', ',')}.`,
      hints: ['Nutze (f(x₀+h)−f(x₀))/h.', 'Für x² vereinfacht sich der Quotient zu 2x₀+h.'],
      solutionSteps: [`\\(\\frac{(${x0}+${h})^2-${x0}^2}{${h}}=2\\cdot${x0}+${h}=${fmt(quotient)}\\)`],
      explanation: `Der Sekantenwert ${fmt(quotient)} liegt nahe an der Tangentensteigung 2x₀=${2 * x0}.`,
      reasoningKeywords: ['sekante', 'tangente', 'grenzwert', 'h']
    });
  }

  function genLineDecision() {
    const scene = createSpaceScene(choice(['intersect', 'parallel', 'identical', 'skew']));
    const options = ['schneidend', 'parallel', 'identisch', 'windschief'];
    return task({
      lessonId: 'G5', skill: 'G12', title: 'Lagebeziehung entscheiden', type: 'choice', answerKind: 'choice', points: 4,
      prompt: `Untersuche die Geraden \\(g:\\vec x=${latexVector(scene.g.a)}+r${latexVector(scene.g.u)}\\) und \\(h:\\vec x=${latexVector(scene.h.a)}+s${latexVector(scene.h.u)}\\).`,
      options, answer: String.fromCharCode(65 + options.indexOf(scene.classification)),
      hints: ['Vergleiche zuerst die Richtungsvektoren.', 'Sind sie nicht parallel, löse anschließend das Koordinaten-LGS.'],
      solutionSteps: scene.reasoning,
      explanation: scene.explanation,
      reasoningKeywords: ['richtungsvektor', 'parameter', 'gleichsetzen', scene.classification]
    });
  }

  const extras = {
    curveReasoning: genCurveReasoning,
    geometryProof: genGeometryProof,
    motionModel: genMotionModel,
    parameterExtrema: genParameterExtrema,
    vectorMotion: genVectorMotion,
    secantTangent: genSecantTangent,
    lineDecision: genLineDecision
  };

  E.generate = function generateV3(generatorId, difficulty = 2) {
    return extras[generatorId] ? extras[generatorId](difficulty) : originalGenerate(generatorId, difficulty);
  };

  const extraCatalog = [
    ['curveReasoning', 'A11', 'Graphenbeziehungen begründen'],
    ['motionModel', 'A14', 'Bewegungsmodelle'],
    ['parameterExtrema', 'A11', 'Parameter bei Extrema'],
    ['secantTangent', 'A7', 'Sekante-Tangente-Grenzübergang'],
    ['geometryProof', 'G3', 'Vektorielle Figurenbeweise'],
    ['vectorMotion', 'G4', 'Bewegung im Raum'],
    ['lineDecision', 'G5', 'Lageentscheidungen']
  ];
  for (const entry of extraCatalog) if (!E.generatorCatalog.some(item => item[0] === entry[0])) E.generatorCatalog.push(entry);

  function reasoningScore(text, keywords = [], maxPoints = 1) {
    const normalized = String(text || '').toLowerCase();
    if (!normalized.trim()) return { points: 0, hits: 0, message: 'Keine Begründung angegeben.' };
    const hits = keywords.filter(word => normalized.includes(word.toLowerCase())).length;
    const lengthFactor = normalized.trim().length >= 60 ? 1 : normalized.trim().length >= 30 ? 0.7 : 0.35;
    const keywordFactor = keywords.length ? Math.min(1, hits / Math.max(2, Math.ceil(keywords.length / 2))) : 1;
    const points = Math.min(maxPoints, Math.round(maxPoints * Math.min(lengthFactor, keywordFactor) * 2) / 2);
    return { points, hits, message: points === maxPoints ? 'Begründung fachlich tragfähig.' : hits ? 'Ansatz erkennbar, aber noch nicht vollständig begründet.' : 'Begründung enthält die entscheidenden mathematischen Begriffe noch nicht.' };
  }

  function expressionSimilarity(user, expected) {
    const xs = [-3, -1.5, -0.5, 0.75, 2, 3.5];
    let usable = 0, close = 0;
    try {
      for (const x of xs) {
        const u = evaluateExpression(user, x), e = evaluateExpression(expected, x);
        if (!Number.isFinite(u) || !Number.isFinite(e)) continue;
        usable++;
        const scale = Math.max(1, Math.abs(e));
        if (Math.abs(u - e) <= 0.2 * scale) close++;
      }
    } catch { return 0; }
    return usable ? close / usable : 0;
  }

  function componentPartial(taskDef, user, maxPoints) {
    const expected = Array.isArray(taskDef.answer) ? taskDef.answer : taskDef.answerKind === 'set' ? parseSet(taskDef.answer) : parseTuple(taskDef.answer);
    const actual = taskDef.answerKind === 'set' ? parseSet(user) : parseTuple(user);
    if (!expected.length || !actual.length) return 0;
    let matches = 0;
    if (taskDef.answerKind === 'set') {
      for (const value of expected) if (actual.some(v => near(v, value))) matches++;
    } else {
      for (let i = 0; i < Math.min(expected.length, actual.length); i++) if (near(expected[i], actual[i])) matches++;
    }
    return Math.floor(maxPoints * matches / expected.length * 2) / 2;
  }

  function scoreAnswerPartial(taskDef, user, maxPoints) {
    const result = E.checkAnswer(taskDef, user);
    if (result.correct) return { points: maxPoints, correct: true, result, note: 'Vollständig korrekt.' };
    const raw = String(user || '').trim();
    if (!raw) return { points: 0, correct: false, result, note: 'Keine Antwort.' };
    let points = 0;
    if (taskDef.answerKind === 'vector' || taskDef.answerKind === 'point' || taskDef.answerKind === 'set') {
      points = componentPartial(taskDef, user, maxPoints);
    } else if (taskDef.answerKind === 'expression') {
      const sim = expressionSimilarity(user, taskDef.answer);
      if (sim >= 0.8) points = Math.min(maxPoints - 0.5, Math.max(0.5, maxPoints * 0.65));
      else if (sim >= 0.45) points = Math.min(maxPoints - 1, Math.max(0.5, maxPoints * 0.35));
    } else if (taskDef.answerKind === 'numeric' || taskDef.type === 'numeric') {
      const actual = parseNumber(raw), expected = Number(taskDef.answer);
      if (Number.isFinite(actual) && Number.isFinite(expected)) {
        if (Math.sign(actual) === Math.sign(expected) && Math.abs(actual - expected) <= Math.max(1, Math.abs(expected) * 0.2)) points = Math.min(maxPoints - 0.5, Math.max(0.5, maxPoints / 2));
      }
    }
    points = Math.max(0, Math.min(maxPoints, Math.round(points * 2) / 2));
    return { points, correct: false, result, note: points ? 'Teilstruktur oder Teilkomponenten sind korrekt.' : 'Noch kein bewertbarer korrekter Anteil erkannt.' };
  }

  function scorePathwayStep(step, user, reasoning = '') {
    const reasoningPoints = Number(step.reasoningPoints ?? 1);
    const answerPoints = Math.max(0, Number(step.points || 2) - reasoningPoints);
    let answerResult;
    if (step.type === 'explain') {
      const r = reasoningScore(user, step.keywords || step.reasoningKeywords || [], step.points || 2);
      return { points: r.points, maxPoints: step.points || 2, correct: r.points >= (step.points || 2), answerPoints: r.points, reasoningPoints: 0, feedback: r.message };
    }
    answerResult = scoreAnswerPartial(step, user, answerPoints);
    const r = reasoningScore(reasoning, step.reasoningKeywords || [], reasoningPoints);
    const total = Math.min(step.points || 2, answerResult.points + r.points);
    return {
      points: total, maxPoints: step.points || 2, correct: answerResult.correct && r.points >= reasoningPoints * 0.5,
      answerPoints: answerResult.points, reasoningPoints: r.points,
      feedback: `${answerResult.note} ${r.message}`.trim(), result: answerResult.result,
      diagnosis: answerResult.correct ? null : E.classifyError(step, user)
    };
  }

  function makePathStep(data) {
    return task({ points: 3, reasoningPoints: 1, reasoningKeywords: [], ...data });
  }

  function createLinearPathway() {
    const x = nonZero(-8, 8), a = nonZero(-6, 6), b = randInt(-7, 7), c = randInt(-10, 10);
    const rhs = a * (x + b) + c;
    return {
      id: id('PATH-LIN'), type: 'linear', title: 'Gleichung lückenlos lösen', lessonId: 'F0',
      context: `Löse \\(${a}(x ${signed(b)}) ${signed(c)}=${rhs}\\) und begründe jeden Umformungsschritt.`,
      steps: [
        makePathStep({ id: 'strategy', title: '1 · Struktur und Strategie', type: 'choice', answerKind: 'choice', points: 2, reasoningPoints: 0, options: ['Klammer auflösen, Konstanten ordnen, durch Koeffizienten teilen', 'direkt durch x teilen', 'beide Seiten quadrieren', 'nur die rechte Seite vereinfachen'], answer: 'A', prompt: 'Welche Reihenfolge ist äquivalent und effizient?', explanation: 'Zuerst wird die Klammer beseitigt, danach wird x isoliert.' }),
        makePathStep({ id: 'expand', title: '2 · Klammer korrekt auflösen', type: 'text', answerKind: 'expression', answer: `${a}x${a*b+c>=0?'+':''}${a*b+c}`, prompt: 'Gib die vollständig ausmultiplizierte linke Seite an.', reasoningKeywords: ['distributiv', 'klammer', 'faktor'], explanation: `Ausmultipliziert entsteht ${a}x ${signed(a*b+c)}.` }),
        makePathStep({ id: 'isolate', title: '3 · Variablenterm isolieren', type: 'numeric', answerKind: 'numeric', answer: a*x, prompt: `Welcher Wert steht nach dem Entfernen der Konstanten auf der rechten Seite von \\(${a}x=…\\)?`, reasoningKeywords: ['gegenoperation', 'beide seiten', 'konstante'], explanation: `${rhs}−(${a*b+c})=${a*x}.` }),
        makePathStep({ id: 'solution', title: '4 · Lösung bestimmen', type: 'numeric', answerKind: 'numeric', answer: x, prompt: 'Bestimme x.', reasoningKeywords: ['teilen', 'koeffizient', 'äquivalent'], explanation: `Durch Division durch ${a} folgt x=${x}.` }),
        makePathStep({ id: 'probe', title: '5 · Probe und Bedeutung', type: 'explain', points: 3, keywords: ['einsetzen', 'linke', 'rechte', 'gleich'], prompt: 'Beschreibe die Probe in einem vollständigen Satz und erkläre, was sie bestätigt.', explanation: `Setzt man x=${x} ein, besitzen beide Seiten den Wert ${rhs}; damit ist die Lösung kontrolliert.` })
      ]
    };
  }

  function createQuadraticPathway() {
    const r1 = randInt(-6, -1), r2 = randInt(1, 6), p = -(r1 + r2), q = r1 * r2;
    const factor = `(x${r1>=0?'-':'+'}${Math.abs(r1)})(x${r2>=0?'-':'+'}${Math.abs(r2)})`;
    return { id:id('PATH-QUAD'), type:'quadratic', title:'Quadratische Gleichung vollständig', lessonId:'F2', context:`Löse \\(x^2 ${signed(p)}x ${signed(q)}=0\\).`, steps:[
      makePathStep({id:'method',title:'1 · Methode begründen',type:'choice',answerKind:'choice',points:2,reasoningPoints:0,options:['Faktorisieren und Nullproduktregel','durch x teilen','Ableitung bilden','nur Wurzel ziehen'],answer:'A',prompt:'Welche Methode passt zur konstruierten Struktur?',explanation:'Zwei ganzzahlige Nullstellen ermöglichen direktes Faktorisieren.'}),
      makePathStep({id:'factor',title:'2 · Produktform herstellen',type:'text',answerKind:'expression',answer:factor,prompt:'Faktorisiere die linke Seite.',reasoningKeywords:['produkt','summe','faktoren'],explanation:`Die Zahlen ${-r1} und ${-r2} erzeugen die passenden Linearfaktoren.`}),
      makePathStep({id:'roots',title:'3 · Nullproduktregel',type:'text',answerKind:'set',answer:[r1,r2],prompt:'Gib die vollständige Lösungsmenge an.',reasoningKeywords:['jeder faktor','gleich null','nullprodukt'],explanation:`L={${r1};${r2}}.`}),
      makePathStep({id:'verify',title:'4 · Vollständigkeit kontrollieren',type:'explain',points:3,keywords:['faktor','null','einsetzen','beide'],prompt:'Erkläre, warum keine weitere reelle Lösung fehlt.',explanation:'Ein Produkt aus zwei linearen Faktoren ist genau dann null, wenn mindestens einer dieser Faktoren null ist.'})
    ]};
  }

  function createDerivativePathway() {
    const a = nonZero(-4, 4), b = nonZero(-6, 6), c = nonZero(-8, 8), n = randInt(3, 5);
    const f = `${a}x^${n} ${signed(b)}x^2 ${signed(c)}`;
    const fp = `${a*n}x^${n-1} ${signed(2*b)}x`;
    const x0 = randInt(-2, 3), value = evaluateExpression(fp, x0);
    return { id:id('PATH-DER'), type:'derivative', title:'Ableitung mit Regelbegründung', lessonId:'A10', context:`Gegeben ist \\(f(x)=${f}\\).`, steps:[
      makePathStep({id:'rules',title:'1 · Struktur erkennen',type:'choice',answerKind:'choice',points:2,reasoningPoints:0,options:['Summen-, Faktor- und Potenzregel','Produktregel mit zwei Funktionen','Nullproduktregel','nur Kettenregel'],answer:'A',prompt:'Welche Regeln werden benötigt?',explanation:'Das Polynom wird summandenweise mit konstanten Faktoren abgeleitet.'}),
      makePathStep({id:'derivative',title:'2 · Ableitungsfunktion',type:'text',answerKind:'expression',answer:fp,prompt:'Bestimme f′(x).',reasoningKeywords:['exponent', 'faktor', 'summand'],explanation:`\\(f'(x)=${fp}\\).`}),
      makePathStep({id:'value',title:'3 · Lokale Änderungsrate',type:'numeric',answerKind:'numeric',answer:value,prompt:`Berechne f′(${x0}).`,reasoningKeywords:['einsetzen','lokale','steigung'],explanation:`f′(${x0})=${fmt(value)}.`}),
      makePathStep({id:'constant',title:'4 · Warum verschwindet c?',type:'explain',points:3,keywords:['konstant','ändert','null','steigung'],prompt:'Erkläre ohne bloße Regelwiedergabe, weshalb der konstante Summand verschwindet.',explanation:'Eine Konstante ändert sich nicht; ihr Differenzenquotient und ihre Ableitung sind 0.'})
    ]};
  }

  function createRatePathway() {
    const a=nonZero(-3,3),b=randInt(-5,5),c=randInt(-4,4),x1=randInt(-3,1),x2=x1+randInt(2,4);
    const f=x=>a*x*x+b*x+c,y1=f(x1),y2=f(x2),dy=y2-y1,dx=x2-x1,rate=dy/dx;
    return {id:id('PATH-RATE'),type:'rate',title:'Änderungsrate mit Interpretation',lessonId:'A6',context:`Für \\(f(x)=${a}x^2 ${signed(b)}x ${signed(c)}\\) wird das Intervall [${x1};${x2}] untersucht.`,steps:[
      makePathStep({id:'values',title:'1 · Funktionswerte',type:'text',answerKind:'point',answer:[y1,y2],prompt:`Gib das Paar \\((f(${x1})|f(${x2}))\\) an.`,reasoningKeywords:['einsetzen','funktionswert'],explanation:`Die Werte sind ${y1} und ${y2}.`}),
      makePathStep({id:'dy',title:'2 · Änderung Δy',type:'numeric',answerKind:'numeric',answer:dy,prompt:'Berechne Δy.',reasoningKeywords:['endwert','anfangswert','reihenfolge'],explanation:`Δy=${y2}−(${y1})=${dy}.`}),
      makePathStep({id:'rate',title:'3 · Quotient',type:'numeric',answerKind:'numeric',answer:rate,prompt:'Berechne die mittlere Änderungsrate.',reasoningKeywords:['delta y','delta x','teilen'],explanation:`m=${dy}/${dx}=${fmt(rate)}.`}),
      makePathStep({id:'meaning',title:'4 · Geometrische Bedeutung',type:'explain',points:3,keywords:['sekante','steigung','intervall','mittlere'],prompt:'Deute das Ergebnis geometrisch und – falls passend – als Rate.',explanation:'Der Wert ist die Steigung der Sekante durch die beiden Graphenpunkte und beschreibt die mittlere Änderung pro x-Einheit.'})
    ]};
  }

  function createExtremaPathway() {
    const a=choice([-2,-1,1,2]),r=randInt(1,3),d=randInt(-3,3);
    const f=`${a}x^3 ${signed(-3*a*r*r)}x ${signed(d)}`;
    const fp=`${3*a}x^2 ${signed(-3*a*r*r)}`;
    const fpp=`${6*a}x`;
    const xs=[-r,r], ys=xs.map(x=>evaluateExpression(f,x));
    const typeLeft=a>0?'Hochpunkt':'Tiefpunkt',typeRight=a>0?'Tiefpunkt':'Hochpunkt';
    return {id:id('PATH-EXT'),type:'extrema',title:'Extrempunkte nachweisen',lessonId:'A11',context:`Untersuche \\(f(x)=${f}\\) auf Extrempunkte.`,steps:[
      makePathStep({id:'fp',title:'1 · Erste Ableitung',type:'text',answerKind:'expression',answer:fp,prompt:'Bestimme f′(x).',reasoningKeywords:['potenzregel','summenregel'],explanation:`f′(x)=${fp}.`}),
      makePathStep({id:'critical',title:'2 · Kritische Stellen',type:'text',answerKind:'set',answer:xs,prompt:'Löse f′(x)=0.',reasoningKeywords:['gleich null','faktorisieren','wurzel'],explanation:`Die kritischen Stellen sind x=−${r} und x=${r}.`}),
      makePathStep({id:'fpp',title:'3 · Zweite Ableitung',type:'text',answerKind:'expression',answer:fpp,prompt:'Bestimme f″(x).',reasoningKeywords:['erneut ableiten'],explanation:`f″(x)=${fpp}.`}),
      makePathStep({id:'classify',title:'4 · Klassifikation',type:'choice',answerKind:'choice',points:3,reasoningPoints:1,options:[`links ${typeLeft}, rechts ${typeRight}`,`links ${typeRight}, rechts ${typeLeft}`,'beide Wendepunkte','keine Extrempunkte'],answer:'A',prompt:'Klassifiziere die beiden kritischen Stellen.',reasoningKeywords:['zweite ableitung','positiv','negativ'],explanation:`Bei x=−${r} liegt ein ${typeLeft}, bei x=${r} ein ${typeRight}.`}),
      makePathStep({id:'points',title:'5 · Punktkoordinaten',type:'text',answerKind:'point',answer:[ys[0],ys[1]],prompt:`Gib das Wertepaar \\((f(-${r})|f(${r}))\\) an.`,reasoningKeywords:['in f einsetzen','y-wert'],explanation:`Die Funktionswerte sind ${ys[0]} und ${ys[1]}.`})
    ]};
  }

  function createInflectionPathway() {
    const a=choice([-2,-1,1,2]),b=nonZero(-4,4),d=randInt(-4,4);
    const f=`${a}x^3 ${signed(b)}x ${signed(d)}`,fp=`${3*a}x^2 ${signed(b)}`,fpp=`${6*a}x`,y=d;
    return {id:id('PATH-WEND'),type:'inflection',title:'Wendepunkt vollständig nachweisen',lessonId:'A12',context:`Untersuche \\(f(x)=${f}\\) auf einen Wendepunkt.`,steps:[
      makePathStep({id:'derivatives',title:'1 · Ableitungen',type:'text',answerKind:'expression',answer:fpp,prompt:'Bestimme f″(x).',reasoningKeywords:['zweimal','ableiten'],explanation:`f′(x)=${fp}, f″(x)=${fpp}.`}),
      makePathStep({id:'candidate',title:'2 · Wendestellen-Kandidat',type:'numeric',answerKind:'numeric',answer:0,prompt:'Löse f″(x)=0.',reasoningKeywords:['notwendige bedingung'],explanation:'Der Kandidat ist x=0.'}),
      makePathStep({id:'point',title:'3 · Wendepunkt',type:'text',answerKind:'point',answer:[0,y],prompt:'Gib den Wendepunkt an.',reasoningKeywords:['in f einsetzen'],explanation:`W(0|${y}).`}),
      makePathStep({id:'proof',title:'4 · Hinreichender Nachweis',type:'explain',points:4,keywords:['vorzeichenwechsel','krümmung','zweite ableitung','links','rechts'],prompt:'Erkläre einen vollständigen Nachweis, dass wirklich ein Wendepunkt vorliegt.',explanation:'f″ wechselt an 0 sein Vorzeichen; damit wechselt die Krümmungsrichtung und W ist ein Wendepunkt.'})
    ]};
  }

  function createCurveInvestigation() {
    const a=choice([-2,-1,1,2]),r=randInt(1,3),d=choice([0,randInt(-3,3)]);
    const b=-3*a*r*r;
    const f=`${a}x^3 ${signed(b)}x ${signed(d)}`;
    const fp=`${3*a}x^2 ${signed(b)}`;
    const fpp=`${6*a}x`;
    const extremaX=[-r,r], extremaY=extremaX.map(x=>evaluateExpression(f,x));
    const inflection=[0,d], tangentSlope=b, tangent=`${tangentSlope}x${d>=0?'+':''}${d}`;
    const monotonic = a>0 ? `steigend auf ]−∞;−${r}[ und ]${r};∞[, fallend auf ]−${r};${r}[` : `fallend auf ]−∞;−${r}[ und ]${r};∞[, steigend auf ]−${r};${r}[`;
    const curvature = a>0 ? 'f″<0 für x<0 und f″>0 für x>0' : 'f″>0 für x<0 und f″<0 für x>0';
    const mission = {
      id:id('CURVE'), title:'Kurvendiskussions-Simulator', lessonId:'A13', coefficients:{a, b, c:0, d},
      functionText:f, derivativeText:fp, secondText:fpp, extremaX, extremaY, inflection, tangent, monotonic, curvature,
      steps:[
        makePathStep({id:'end',title:'1 · Globales Verhalten',type:'choice',answerKind:'choice',points:2,reasoningPoints:0,options:a>0?['links −∞, rechts +∞','links +∞, rechts −∞','beidseitig +∞','beidseitig −∞']:['links +∞, rechts −∞','links −∞, rechts +∞','beidseitig +∞','beidseitig −∞'],answer:'A',prompt:'Bestimme das Endverhalten aus dem Leitterm.',explanation:'Ungerader Grad: Das Vorzeichen des Leitkoeffizienten entscheidet die Richtung.'}),
        makePathStep({id:'fp',title:'2 · Erste Ableitung',type:'text',answerKind:'expression',answer:fp,prompt:'Bestimme f′(x).',reasoningKeywords:['potenzregel','summenregel'],explanation:`f′(x)=${fp}.`}),
        makePathStep({id:'crit',title:'3 · Kritische Stellen',type:'text',answerKind:'set',answer:extremaX,prompt:'Löse f′(x)=0.',reasoningKeywords:['gleich null','wurzel'],explanation:`x=−${r} und x=${r}.`}),
        makePathStep({id:'fpp',title:'4 · Zweite Ableitung',type:'text',answerKind:'expression',answer:fpp,prompt:'Bestimme f″(x).',reasoningKeywords:['erneut ableiten'],explanation:`f″(x)=${fpp}.`}),
        makePathStep({id:'wend',title:'5 · Wendepunkt',type:'text',answerKind:'point',answer:inflection,prompt:'Gib den Wendepunkt an.',reasoningKeywords:['f zweite gleich null','in f einsetzen','vorzeichenwechsel'],explanation:`W(${inflection.join('|')}).`}),
        makePathStep({id:'tangent',title:'6 · Wendetangente',type:'text',answerKind:'expression',answer:tangent,prompt:'Bestimme die Tangente im Wendepunkt als Term in x.',reasoningKeywords:['steigung','punkt','geradengleichung'],explanation:`t(x)=${tangent}.`}),
        makePathStep({id:'consistency',title:'7 · Gesamtbild erklären',type:'explain',points:5,keywords:['monoton','extrem','krümm','wend','ableitung'],prompt:'Erkläre, wie f′, f″, Extrempunkte und Wendepunkt ein konsistentes Gesamtbild ergeben.',explanation:`Monotonie: ${monotonic}. Krümmung: ${curvature}.`})
      ]
    };
    return mission;
  }

  function createLinePathway() {
    const scene=createSpaceScene('intersect'),P=scene.intersection;
    return {id:id('PATH-LINE'),type:'line',title:'Geradenschnitt mit vollständigem LGS',lessonId:'G5',context:`Bestimme den Schnittpunkt von \\(g:\\vec x=${latexVector(scene.g.a)}+r${latexVector(scene.g.u)}\\) und \\(h:\\vec x=${latexVector(scene.h.a)}+s${latexVector(scene.h.u)}\\).`,scene,steps:[
      makePathStep({id:'strategy',title:'1 · Strategie',type:'choice',answerKind:'choice',points:2,reasoningPoints:0,options:['Koordinaten gleichsetzen und Parameter-LGS lösen','Richtungsvektoren addieren','nur Längen vergleichen','Geraden ableiten'],answer:'A',prompt:'Wie wird ein Schnittpunkt mathematisch beschrieben?',explanation:'Am Schnittpunkt sind die beiden Ortsvektoren gleich.'}),
      makePathStep({id:'r',title:'2 · Parameter r',type:'numeric',answerKind:'numeric',answer:scene.parameters.r,prompt:'Bestimme r.',reasoningKeywords:['koordinaten','eliminieren','gleichsetzen'],explanation:`r=${scene.parameters.r}.`}),
      makePathStep({id:'s',title:'3 · Parameter s',type:'numeric',answerKind:'numeric',answer:scene.parameters.s,prompt:'Bestimme s.',reasoningKeywords:['einsetzen','parameter'],explanation:`s=${scene.parameters.s}.`}),
      makePathStep({id:'point',title:'4 · Schnittpunkt',type:'text',answerKind:'point',answer:P,prompt:'Gib den Schnittpunkt an.',reasoningKeywords:['in gerade einsetzen','komponenten'],explanation:`S(${P.join('|')}).`}),
      makePathStep({id:'check',title:'5 · Dritte Gleichung kontrollieren',type:'explain',points:3,keywords:['dritte','koordinate','beide','parameter','übereinstimmen'],prompt:'Erkläre die notwendige Konsistenzkontrolle.',explanation:'Die gefundenen Parameter müssen auch die dritte Koordinatengleichung erfüllen; erst dann liegt ein räumlicher Schnittpunkt vor.'})
    ]};
  }

  function createPathway(type='derivative') {
    return ({linear:createLinearPathway,quadratic:createQuadraticPathway,derivative:createDerivativePathway,rate:createRatePathway,extrema:createExtremaPathway,inflection:createInflectionPathway,curve:createCurveInvestigation,line:createLinePathway}[type] || createDerivativePathway)();
  }

  function vecAdd(a,b){return a.map((x,i)=>x+b[i]);}
  function vecScale(k,a){return a.map(x=>k*x);}
  function createSpaceScene(type='intersect') {
    if (type === 'random') type = choice(['intersect','parallel','identical','skew']);
    let g,h,classification,intersection=null,parameters=null,reasoning=[],explanation='';
    if (type === 'intersect') {
      const P=[randInt(-3,3),randInt(-3,3),randInt(-3,3)],u=[1,2,-1],v=[2,-1,1],r=randInt(-2,3),s=randInt(-2,3);
      g={a:vecAdd(P,vecScale(-r,u)),u};h={a:vecAdd(P,vecScale(-s,v)),u:v};classification='schneidend';intersection=P;parameters={r,s};
      reasoning=['Richtungsvektoren sind keine Vielfachen.','Das Koordinaten-LGS besitzt eine gemeinsame Lösung.',`r=${r}, s=${s} liefern S(${P.join('|')}).`];
      explanation=`Die Geraden schneiden sich in S(${P.join('|')}).`;
    } else if (type === 'parallel') {
      const a=[randInt(-3,3),randInt(-3,3),randInt(-3,3)],u=[1,2,-1],k=choice([-3,-2,2,3]),offset=[0,1,0];
      g={a,u};h={a:vecAdd(a,offset),u:vecScale(k,u)};classification='parallel';
      reasoning=['Die Richtungsvektoren sind Vielfache.','Der Stützpunkt von h liegt nicht auf g.','Daher sind die Geraden echt parallel.'];explanation='Parallele Richtungen ohne gemeinsamen Punkt ergeben echt parallele Geraden.';
    } else if (type === 'identical') {
      const a=[randInt(-3,3),randInt(-3,3),randInt(-3,3)],u=[1,-2,2],t=randInt(-3,3),k=choice([-2,2,3]);
      g={a,u};h={a:vecAdd(a,vecScale(t,u)),u:vecScale(k,u)};classification='identisch';
      reasoning=['Die Richtungsvektoren sind Vielfache.','Der Stützpunkt von h entsteht aus dem Stützpunkt von g durch ein Vielfaches des Richtungsvektors.','Beide beschreiben dieselbe Punktmenge.'];explanation='Parallele Richtungen und ein gemeinsamer Punkt bedeuten Identität.';
    } else {
      const shift=[randInt(-2,2),randInt(-2,2),randInt(-2,2)],a=shift,u=[1,0,0],b=vecAdd(shift,[0,1,1]),v=[0,1,0];
      g={a,u};h={a:b,u:v};classification='windschief';
      reasoning=['Die Richtungsvektoren sind keine Vielfachen.','Die z-Koordinate von g bleibt 0 relativ zur Verschiebung, die von h bleibt 1.','Das LGS ist widersprüchlich; die Geraden sind windschief.'];explanation='Nicht parallele Geraden ohne gemeinsamen Punkt sind im Raum windschief.';
    }
    return {id:id('SPACE'),type,g,h,classification,intersection,parameters,reasoning,explanation};
  }

  function inferReasoningKeywords(taskDef) {
    if (taskDef.reasoningKeywords?.length) return taskDef.reasoningKeywords;
    const text=`${taskDef.title||''} ${taskDef.prompt||''}`.toLowerCase();
    if (text.includes('ableit')) return ['potenzregel','summenregel','ableitung','exponent'];
    if (text.includes('nullstell')||text.includes('gleichung')) return ['gleich null','faktor','lösung','probe'];
    if (text.includes('änderungsrate')||text.includes('sekante')) return ['differenzenquotient','delta','intervall','steigung'];
    if (text.includes('extrem')) return ['erste ableitung','gleich null','zweite ableitung','klassifizieren'];
    if (text.includes('wend')) return ['zweite ableitung','vorzeichenwechsel','krümmung'];
    if (text.includes('vektor')||text.includes('gerade')) return ['komponente','parameter','richtungsvektor','einsetzen'];
    return ['regel','rechenweg','kontrolle'];
  }

  function enhanceExamTask(t, index) {
    const total = Math.max(3, Number(t.points || 2) + 1);
    return {
      ...t, id:`${t.id}-E${index}`, examNumber:index+1, points:total,
      answerPoints:Math.max(2,total-1), reasoningPoints:1,
      reasoningKeywords:inferReasoningKeywords(t),
      rubric:[
        {label:'Ergebnis / mathematisches Objekt',points:Math.max(2,total-1)},
        {label:'Rechenweg oder Begründung',points:1}
      ]
    };
  }

  function createExamV3(level='full') {
    const blueprint=V3.examBlueprints[level]||V3.examBlueprints.full;
    const tasks=blueprint.generatorIds.map((generatorId,i)=>enhanceExamTask(E.generate(generatorId, i%3+2),i));
    return {id:id('EXAM-V3'),title:blueprint.title,level,tasks,totalPoints:tasks.reduce((s,t)=>s+t.points,0),minutes:blueprint.minutes,created:Date.now(),version:3};
  }

  function scoreExamTask(taskDef, user, work='') {
    const answerMax=taskDef.answerPoints ?? Math.max(1,(taskDef.points||2)-1);
    const reasoningMax=taskDef.reasoningPoints ?? Math.min(1,taskDef.points||2);
    const a=scoreAnswerPartial(taskDef,user,answerMax);
    const r=reasoningScore(work,taskDef.reasoningKeywords||inferReasoningKeywords(taskDef),reasoningMax);
    const points=Math.min(taskDef.points||2,Math.round((a.points+r.points)*2)/2);
    return {correct:a.correct,points,maxPoints:taskDef.points||2,answerPoints:a.points,reasoningPoints:r.points,answerNote:a.note,reasoningNote:r.message,result:a.result,diagnosis:a.correct?null:E.classifyError(taskDef,user)};
  }

  function createWeeklyPlan(lessonStats=[], dueLessonIds=[], errorLessonIds=[]) {
    const sorted=[...lessonStats].sort((a,b)=>a.mastery-b.mastery);
    const weakest=sorted.slice(0,6);
    const days=[];
    const labels=['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag'];
    for(let i=0;i<7;i++){
      const primary=weakest[i%Math.max(1,weakest.length)]||{id:'A10',title:'Ableitungen',mastery:0};
      const due=dueLessonIds[i%dueLessonIds.length];
      const error=errorLessonIds[i%errorLessonIds.length];
      const blocks=[
        {id:id('BLOCK'),kind:'Abruf',minutes:8,lessonId:due||primary.id,title:due?'Fälligen Stoff ohne Theorie abrufen':`${primary.title}: Vorwissen aktivieren`},
        {id:id('BLOCK'),kind:'Mastery',minutes:i===5?30:22,lessonId:primary.id,title:`${primary.title}: ${primary.mastery<35?'Konzept + geführt':primary.mastery<65?'Verfahren + Transfer':'gemischter Langzeitabruf'}`},
        {id:id('BLOCK'),kind:'Kontrolle',minutes:10,lessonId:error||primary.id,title:error?'Offenen Fehler mit Parallelaufgabe reparieren':'Exit-Ticket und Fehlerkontrolle'}
      ];
      if(i===2||i===6)blocks.push({id:id('BLOCK'),kind:'Mix',minutes:15,lessonId:null,title:'Interleaved Mix ohne Themenüberschrift'});
      days.push({day:i,label:labels[i],blocks,completed:false});
    }
    return {id:id('PLAN'),created:Date.now(),days,principles:['Abruf vor erneutem Lesen','Schwächen häufiger, aber nicht ausschließlich trainieren','Verfahren mit Transfer mischen','Fehler zeitversetzt erneut prüfen']};
  }

  E.createPathway=createPathway;
  E.scorePathwayStep=scorePathwayStep;
  E.createCurveInvestigation=createCurveInvestigation;
  E.createSpaceScene=createSpaceScene;
  E.createExamV3=createExamV3;
  E.scoreExamTask=scoreExamTask;
  E.createWeeklyPlan=createWeeklyPlan;
  E.reasoningScore=reasoningScore;
  E.scoreAnswerPartial=scoreAnswerPartial;
  E.createExamLegacy=originalCreateExam;
})();
