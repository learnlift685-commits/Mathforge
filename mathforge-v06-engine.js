(() => {
  'use strict';

  const E = window.MATHFORGE_ENGINE;
  const D6 = window.MATHFORGE_V06_DATA;
  const oldGenerate = E.generate.bind(E);
  const oldCheckAnswer = E.checkAnswer.bind(E);
  const oldScoreExamTask = E.scoreExamTask?.bind(E);
  const rand = E.randInt;
  const pick = E.choice;
  const shuffle = E.shuffle;
  const id = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const nonZero = (min=-6,max=6) => { let n=0; while(!n) n=rand(min,max); return n; };
  const signed = n => n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`;
  const fmt = n => Number.isInteger(n) ? String(n) : String(Math.round(n*1000)/1000).replace('.', ',');
  const vec = v => `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;
  const task = spec => ({
    id:id('V6'), type:'text', answerKind:'numeric', accepted:[], options:[], tolerance:1e-6,
    hints:[], solutionSteps:[], explanation:'', points:4, difficulty:3,
    masteryDimension:'Transfer', operator:'bestimmen', skill:'EF-V6', ...spec
  });
  const valueAt = (expr,x) => E.evaluateExpression(expr,x);

  function reciprocalDomainReasoning(){
    const n=pick([-4,-3,-2,-1]);
    const correct='x=0 ist ausgeschlossen, weil dort durch 0 geteilt würde';
    const options=shuffle([correct,'x=0 ist die einzige Nullstelle','alle reellen Zahlen sind erlaubt','nur negative x-Werte sind erlaubt']);
    return task({lessonId:'A1',skill:'A-POT-DEF',title:'Definitionslücke begründen',type:'choice',answerKind:'choice',operator:'begründen',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Warum gehört \\(x=0\\) nicht zum Definitionsbereich von \\(f(x)=x^{${n}}\\)?`,hints:['Schreibe den negativen Exponenten als Bruch.'],solutionSteps:[`\\(x^{${n}}=\\frac{1}{x^{${Math.abs(n)}}}\\)`,'Ein Nenner darf nicht 0 sein.'],explanation:'Negative ganzzahlige Exponenten erzeugen einen Bruch mit einer Potenz von x im Nenner.'});
  }

  function powerCompare(){
    const even=pick([2,4,6]), odd=pick([1,3,5]);
    const correct='Die gerade Potenz ist achsensymmetrisch, die ungerade punktsymmetrisch zum Ursprung.';
    const options=shuffle([correct,'Beide sind immer achsensymmetrisch.','Beide sind immer punktsymmetrisch.','Die Symmetrie hängt nur vom Vorzeichen von x ab.']);
    return task({lessonId:'A1',skill:'A-POT-SYM',title:'Potenzfamilien vergleichen',type:'choice',answerKind:'choice',operator:'erläutern',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Vergleiche die Symmetrie von \\(x^{${even}}\\) und \\(x^{${odd}}\\).`,hints:['Prüfe f(−x).'],solutionSteps:[`\\((-x)^{${even}}=x^{${even}}\\)`,`\\((-x)^{${odd}}=-x^{${odd}}\\)`],explanation:'Gerade Exponenten erfüllen f(−x)=f(x), ungerade Exponenten f(−x)=−f(x).'});
  }

  function polynomialFromRoots(){
    const r1=rand(-5,-1),r2=rand(1,5),a=pick([-2,-1,1,2]);
    const b=-a*(r1+r2),c=a*r1*r2;
    const answer=`${a}x^2 ${signed(b)}x ${signed(c)}`;
    return task({lessonId:'A2',skill:'A-POL-REK',title:'Polynom aus Nullstellen aufbauen',answerKind:'expression',operator:'bestimmen',answer,prompt:`Eine quadratische Funktion besitzt die Nullstellen \\(x_1=${r1}\\), \\(x_2=${r2}\\) und den Leitkoeffizienten \\(a=${a}\\). Bestimme den Funktionsterm in Normalform.`,hints:['Nutze a(x−x₁)(x−x₂).','Multipliziere danach vollständig aus.'],solutionSteps:[`\\(f(x)=${a}(x-${r1})(x-${r2})\\)`,`\\(f(x)=${answer}\\)`],explanation:'Nullstellen liefern die Linearfaktoren; der Leitkoeffizient skaliert das Produkt.'});
  }

  function polynomialCoefficientFromPoint(){
    const r1=rand(-4,-1),r2=rand(1,5),a=pick([-3,-2,-1,1,2,3]);
    let x0=rand(-3,3); while(x0===r1||x0===r2)x0=rand(-3,3);
    const y0=a*(x0-r1)*(x0-r2);
    return task({lessonId:'A14',skill:'A-MOD-PAR',title:'Leitfaktor aus Punktbedingung',operator:'bestimmen',answer:a,prompt:`Es gilt \\(f(x)=a(x-${r1})(x-${r2})\\) und \\(P(${x0}|${y0})\\) liegt auf dem Graphen. Bestimme \\(a\\).`,hints:['Setze die Punktkoordinaten ein.','Löse die entstehende lineare Gleichung nach a.'],solutionSteps:[`\\(${y0}=a(${x0-r1})(${x0-r2})\\)`,`\\(a=${a}\\)`],explanation:'Eine zusätzliche Punktbedingung bestimmt den noch freien Skalierungsparameter.'});
  }

  function discriminantParameter(){
    const p=rand(-6,6),boundary=Math.round((p*p/4)*100)/100;
    const correct=`q < ${fmt(boundary)}`;
    const options=shuffle([correct,`q > ${fmt(boundary)}`,`q = ${fmt(boundary)}`,'für jedes q']);
    return task({lessonId:'F2',skill:'Q-PAR-ANZ',title:'Parameter und Anzahl der Nullstellen',type:'choice',answerKind:'choice',operator:'begründen',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Für welche Bedingung an \\(q\\) besitzt \\(x^2 ${signed(p)}x+q=0\\) zwei verschiedene reelle Lösungen?`,hints:['Nutze bei der pq-Formel den Ausdruck unter der Wurzel.'],solutionSteps:[`\\(D=(\\frac{${p}}2)^2-q\\)`,`Zwei Lösungen genau für \\(D>0\\).`,`Also \\(q<${fmt(boundary)}\\).`],explanation:'Die Anzahl reeller Lösungen wird durch das Vorzeichen des Diskriminantenausdrucks bestimmt.'});
  }

  function quadraticParameterRoot(){
    const root=rand(-5,5),other=rand(-5,5),p=-(root+other),q=root*other;
    return task({lessonId:'F2',skill:'Q-PAR-WERT',title:'Parameter aus gegebener Nullstelle',operator:'bestimmen',answer:q,prompt:`Die Gleichung \\(x^2 ${signed(p)}x+k=0\\) besitzt die Nullstelle \\(x=${root}\\). Bestimme \\(k\\).`,hints:['Setze die bekannte Nullstelle in die Gleichung ein.'],solutionSteps:[`\\(${root}^2 ${signed(p)}·${root}+k=0\\)`,`\\(k=${q}\\)`],explanation:'Eine Nullstelle erfüllt die Gleichung; dadurch entsteht eine lineare Gleichung für den Parameter.'});
  }

  function transformationRecover(){
    const h=rand(-5,5),k=rand(-5,5),a=pick([-3,-2,-1,2,3]);
    const answer=`${a}(x${h>=0?'-':'+'}${Math.abs(h)})^2 ${signed(k)}`;
    return task({lessonId:'A4',skill:'A-TRA-INV',title:'Transformation rückwärts rekonstruieren',answerKind:'expression',operator:'bestimmen',answer,prompt:`Die Normalparabel wird in y-Richtung mit Faktor \\(${a}\\) skaliert, um ${h} nach rechts und um ${k} nach oben verschoben. Gib den Funktionsterm an. Negative Angaben bedeuten die entgegengesetzte Richtung.`,hints:['Nutze a(x−h)²+k.'],solutionSteps:[`\\(f(x)=a(x-h)^2+k\\)`,`\\(f(x)=${answer}\\)`],explanation:'Horizontale Verschiebungen stehen mit umgekehrtem Vorzeichen in der Klammer.'});
  }

  function sinusPhaseShift(){
    const A=pick([2,3,4]),b=pick([1,2]),c=pick([-Math.PI/2,Math.PI/2,Math.PI]),d=rand(-2,2);
    const period=2*Math.PI/Math.abs(b),shift=-c/b;
    const correct=`Amplitude ${A}, Periode ${fmt(period)}, Verschiebung ${fmt(shift)}, Mittellinie ${d}`;
    const options=shuffle([correct,`Amplitude ${b}, Periode ${fmt(2*Math.PI/A)}, Verschiebung ${fmt(c)}, Mittellinie 0`,`Amplitude ${A+d}, Periode ${fmt(period)}, Verschiebung 0, Mittellinie ${c}`,'Die Parameter lassen sich nicht ablesen.']);
    return task({lessonId:'A5',skill:'A-SIN-PHASE',title:'Sinusparameter vollständig deuten',type:'choice',answerKind:'choice',operator:'interpretieren',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Deute \\(f(x)=${A}\\sin(${b}x ${c<0?'-':'+'} ${fmt(Math.abs(c))}) ${signed(d)}\\).`,hints:['Bei sin(bx+c) ist die horizontale Verschiebung −c/b.'],solutionSteps:[`Amplitude \\(|A|=${A}\\)`,`Periode \\(2\\pi/|b|=${fmt(period)}\\)`,`Verschiebung \\(-c/b=${fmt(shift)}\\)`,`Mittellinie \\(y=${d}\\)`],explanation:'Jeder Parameter verändert eine andere geometrische Eigenschaft der Sinuskurve.'});
  }

  function averageRateMissingValue(){
    const x1=rand(-4,1),x2=x1+pick([2,3,4]),y1=rand(-8,8),m=pick([-4,-3,-2,2,3,4]),y2=y1+m*(x2-x1);
    return task({lessonId:'A6',skill:'A-RATE-INV',title:'Fehlenden Funktionswert aus Rate bestimmen',operator:'berechnen',answer:y2,prompt:`Auf \\([${x1};${x2}]\\) beträgt die mittlere Änderungsrate \\(${m}\\). Außerdem ist \\(f(${x1})=${y1}\\). Bestimme \\(f(${x2})\\).`,hints:['m=(f(x₂)−f(x₁))/(x₂−x₁).','Löse nach f(x₂) auf.'],solutionSteps:[`\\(${m}=\\frac{f(${x2})-${y1}}{${x2-x1}}\\)`,`\\(f(${x2})=${y2}\\)`],explanation:'Die Änderungsrate multipliziert mit der Intervallbreite ergibt die Änderung des Funktionswertes.'});
  }

  function derivativeAtPointFromDefinition(){
    const a=pick([-3,-2,-1,1,2,3]),b=rand(-5,5),x0=rand(-3,3),answer=2*a*x0+b;
    return task({lessonId:'A7',skill:'A-DIFF-DEF',title:'Ableitungswert über Differenzenquotient',operator:'berechnen',answer,prompt:`Für \\(f(x)=${a}x^2 ${signed(b)}x\\) soll \\(f'(${x0})\\) mithilfe des Differenzenquotienten bestimmt werden. Gib den Grenzwert an.`,hints:['Setze f(x₀+h) und f(x₀) ein.','Kürze h vor dem Grenzübergang.'],solutionSteps:[`\\(\\frac{f(${x0}+h)-f(${x0})}{h}\\)`,`Nach Ausmultiplizieren und Kürzen bleibt \\(${answer}+${a}h\\).`,`Für \\(h\\to0\\) folgt \\(f'(${x0})=${answer}\\).`],explanation:'Der Differenzenquotient misst Sekantensteigungen, deren zweiter Punkt gegen den ersten wandert.'});
  }

  function tangentParallel(){
    const a=pick([-3,-2,-1,1,2,3]),b=rand(-5,5),m=rand(-8,8),x=(m-b)/(2*a);
    const valid=Number.isInteger(x);
    if(!valid) return tangentParallel();
    return task({lessonId:'A8',skill:'A-TAN-PAR',title:'Tangente parallel zu einer Geraden',operator:'bestimmen',answer:x,prompt:`Gegeben ist \\(f(x)=${a}x^2 ${signed(b)}x\\). An welcher Stelle ist die Tangente parallel zu einer Geraden mit Steigung \\(m=${m}\\)?`,hints:['Parallele Geraden besitzen dieselbe Steigung.','Setze f′(x)=m.'],solutionSteps:[`\\(f'(x)=${2*a}x ${signed(b)}\\)`,`\\(${2*a}x ${signed(b)}=${m}\\)`,`\\(x=${x}\\)`],explanation:'Die Steigung der Tangente an der Stelle x ist f′(x).'});
  }

  function normalEquationV6(){
    const a=pick([-2,-1,1,2]),x0=pick([-2,-1,1,2]),b=rand(-3,3),y0=a*x0*x0+b,mT=2*a*x0,mN=-1/mT;
    const intercept=y0-mN*x0;
    return task({lessonId:'A8',skill:'A-NOR-EQ',title:'Normalengleichung bestimmen',answerKind:'expression',operator:'bestimmen',answer:`${fmt(mN)}x ${signed(intercept)}`,prompt:`Bestimme die Normale an \\(f(x)=${a}x^2 ${signed(b)}\\) im Punkt mit \\(x_0=${x0}\\). Gib sie als Term in x an.`,hints:['Berechne zuerst f(x₀) und f′(x₀).','Die Normalensteigung ist der negative Kehrwert.','Nutze y=m_Nx+b_N.'],solutionSteps:[`\\(P(${x0}|${y0})\\)`,`\\(m_T=f'(${x0})=${mT}\\)`,`\\(m_N=-1/${mT}=${fmt(mN)}\\)`,`\\(n(x)=${fmt(mN)}x ${signed(intercept)}\\)`],explanation:'Tangente und Normale stehen senkrecht, daher gilt m_T·m_N=−1.'});
  }

  function derivativeGraphFeature(){
    const correct=pick(['f besitzt dort einen Hochpunkt','f besitzt dort einen Tiefpunkt']);
    const change=correct.includes('Hoch')?'von positiv zu negativ':'von negativ zu positiv';
    const options=shuffle([correct,'f besitzt dort zwingend einen Wendepunkt','f hat dort keine besondere Stelle','f ist dort nicht definiert']);
    return task({lessonId:'A9',skill:'A-GRAPH-FP',title:'Vorzeichenwechsel von f′ deuten',type:'choice',answerKind:'choice',operator:'interpretieren',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Der Graph von \\(f'\\) schneidet die x-Achse ${change}. Was folgt für \\(f\\)?`,hints:['Das Vorzeichen von f′ beschreibt Steigen oder Fallen.'],solutionSteps:[`f′ wechselt ${change}.`,correct],explanation:'Ein Vorzeichenwechsel von f′ verbindet Monotonieintervalle mit der Art eines Extrempunkts.'});
  }

  function derivativeRuleSelection(){
    const form=pick(['3x^5-2x^2+7','-4x^3+6x','2x^6-5']);
    const correct='Summenregel, Faktorregel und Potenzregel';
    const options=shuffle([correct,'nur Produktregel','Quotientenregel und Kettenregel','Nullproduktregel']);
    return task({lessonId:'A10',skill:'A-DER-METHOD',title:'Ableitungsregeln auswählen',type:'choice',answerKind:'choice',operator:'begründen',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Welche Regeln reichen aus, um \\(f(x)=${form}\\) abzuleiten?`,hints:['Betrachte jeden Summanden einzeln.'],solutionSteps:['Polynome werden summandenweise abgeleitet.','Konstante Faktoren bleiben erhalten; x-Potenzen folgen der Potenzregel.'],explanation:'Die Struktur besteht aus einer Summe konstanter Vielfacher von Potenzen.'});
  }

  function stationaryPointClassify(){
    const kind=pick(['hoch','tief','terrasse']);
    let second,change,correct;
    if(kind==='hoch'){second=-pick([2,4,6]);change='positiv zu negativ';correct='Hochpunkt';}
    else if(kind==='tief'){second=pick([2,4,6]);change='negativ zu positiv';correct='Tiefpunkt';}
    else {second=0;change='kein Vorzeichenwechsel von f′';correct='kein Extrempunkt; weitere Untersuchung nötig';}
    const options=shuffle([correct,'immer Wendepunkt','keine stationäre Stelle','Nullstelle von f']);
    return task({lessonId:'A11',skill:'A-EXT-CLASS',title:'Stationäre Stelle sauber klassifizieren',type:'choice',answerKind:'choice',operator:'begründen',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Es gilt \\(f'(x_0)=0\\), \\(f''(x_0)=${second}\\) und ${change}. Welche Aussage ist korrekt?`,hints:['Nutze bei f″≠0 das Vorzeichen; bei f″=0 reicht das Kriterium nicht.'],solutionSteps:[`f′(x₀)=0 liefert einen Kandidaten.`,`f″(x₀)=${second}.`,correct],explanation:'Notwendige und hinreichende Kriterien müssen auseinandergehalten werden.'});
  }

  function parameterExtremaV6(){
    const x0=pick([-3,-2,-1,1,2,3]),a=pick([-2,-1,1,2]),k=-3*a*x0*x0;
    return task({lessonId:'A11',skill:'A-EXT-PAR',title:'Parameter für stationäre Stelle',operator:'bestimmen',answer:k,prompt:`Für \\(f_k(x)=${a}x^3+kx\\) soll bei \\(x=${x0}\\) eine stationäre Stelle liegen. Bestimme \\(k\\).`,hints:['Stationär bedeutet f′(x₀)=0.'],solutionSteps:[`\\(f'_k(x)=${3*a}x^2+k\\)`,`\\(0=${3*a}·${x0}^2+k\\)`,`\\(k=${k}\\)`],explanation:'Die Bedingung an eine stationäre Stelle wird zu einer Gleichung für den Parameter.'});
  }

  function inflectionTangent(){
    const a=pick([-3,-2,-1,1,2,3]),b=rand(-5,5),d=rand(-4,4),m=b;
    return task({lessonId:'A12',skill:'A-WEND-TAN',title:'Wendetangente eines kubischen Modells',answerKind:'expression',operator:'bestimmen',answer:`${m}x ${signed(d)}`,prompt:`Bestimme die Wendetangente von \\(f(x)=${a}x^3 ${signed(b)}x ${signed(d)}\\).`,hints:['Bei dieser Form liegt die Wendestelle bei x=0.','Bestimme f(0) und f′(0).'],solutionSteps:[`\\(f''(x)=${6*a}x\\Rightarrow x_W=0\\)`,`\\(W(0|${d})\\)`,`\\(m_W=f'(0)=${m}\\)`,`\\(t(x)=${m}x ${signed(d)}\\)`],explanation:'Die Wendetangente verbindet den Wendepunkt mit der lokalen Steigung an dieser Stelle.'});
  }

  function terracePoint(){
    const a=pick([-3,-2,-1,1,2,3]),h=rand(-3,3),k=rand(-4,4);
    const answer=[h,k];
    return task({lessonId:'A12',skill:'A-TERR',title:'Terrassenpunkt erkennen',answerKind:'point',operator:'nachweisen',answer,prompt:`Bestimme den Terrassenpunkt von \\(f(x)=${a}(x${h>=0?'-':'+'}${Math.abs(h)})^3 ${signed(k)}\\).`,hints:['Ein Terrassenpunkt ist ein Wendepunkt mit waagerechter Tangente.'],solutionSteps:[`\\(f'(x)=${3*a}(x-${h})^2\\Rightarrow f'(${h})=0\\)`,`\\(f''(x)=${6*a}(x-${h})\\) wechselt bei ${h} das Vorzeichen.`,`\\(T(${h}|${k})\\)`],explanation:'Die Stelle ist stationär und zugleich Wendestelle; daher liegt ein Terrassenpunkt vor.'});
  }

  function polynomialFromConditions(){
    const r=pick([1,2,3]),a=pick([-2,-1,1,2]),d=rand(-4,4);
    const b=-3*a*r*r;
    const answer=`${a}x^3 ${signed(b)}x ${signed(d)}`;
    return task({lessonId:'A13',skill:'A-REK-CUB',title:'Kubische Funktion aus Extremstellen rekonstruieren',answerKind:'expression',operator:'bestimmen',answer,prompt:`Gesucht ist \\(f(x)=ax^3+bx+d\\) mit Leitkoeffizient \\(a=${a}\\), stationären Stellen bei \\(x=\\pm${r}\\) und \\(f(0)=${d}\\). Bestimme den Term.`,hints:['f′(x)=3ax²+b.','Setze x=r in f′(x)=0 ein.'],solutionSteps:[`\\(0=3·${a}·${r}^2+b\\Rightarrow b=${b}\\)`,`\\(d=f(0)=${d}\\)`,`\\(f(x)=${answer}\\)`],explanation:'Bedingungen an Ableitungen und Funktionswerte bestimmen die Koeffizienten.'});
  }

  function reconstructCubic(){
    const r=pick([1,2,3]),a=pick([-2,-1,1,2]),d=rand(-4,4),b=-3*a*r*r;
    const extremaType=a>0?'links Hochpunkt, rechts Tiefpunkt':'links Tiefpunkt, rechts Hochpunkt';
    const correct=`Wendepunkt bei (0|${d}); ${extremaType}`;
    const options=shuffle([correct,`Wendepunkt bei (${r}|${d}); beide Extrempunkte sind Hochpunkte`,'kein Wendepunkt; nur eine Extremstelle','Wendepunkt bei (0|0); Art unabhängig von a']);
    return task({lessonId:'A13',skill:'A-CURVE-LINK',title:'Kurvendaten vernetzen',type:'choice',answerKind:'choice',operator:'erläutern',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Für \\(f(x)=${a}x^3 ${signed(b)}x ${signed(d)}\\): Welche qualitative Aussage ist korrekt?`,hints:['f″(x)=6ax; die Extremstellen liegen bei ±r.'],solutionSteps:[`\\(f''(x)=${6*a}x\\Rightarrow W(0|${d})\\)`,`Das Vorzeichen von f″ an ±${r} klassifiziert die Extrempunkte.`],explanation:'Eine vollständige Kurvendiskussion verknüpft Ableitungen, Punktkoordinaten und Vorzeichen.'});
  }

  function curveConsistencyChoice(){
    const correct='Nullstelle von f′ mit Vorzeichenwechsel und passende Klassifikation durch f″';
    const options=shuffle([correct,'jede Nullstelle von f ist automatisch Extrempunkt','f″=0 beweist allein immer einen Wendepunkt','aus f′>0 folgt, dass f negativ ist']);
    return task({lessonId:'A13',skill:'A-CURVE-CHECK',title:'Konsistenz einer Kurvendiskussion prüfen',type:'choice',answerKind:'choice',operator:'beurteilen',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:'Welche Kombination liefert einen tragfähigen Extrempunktnachweis?',hints:['Trenne Funktionswert, Steigung und Krümmung.'],solutionSteps:['f′=0 ist notwendig.','Ein Vorzeichenwechsel von f′ oder ein von 0 verschiedener Wert von f″ klassifiziert.'],explanation:'Mehrere unabhängige Informationen sollten sich gegenseitig bestätigen.'});
  }

  function modelOptimization(){
    const h=rand(2,8),k=rand(10,30),a=-pick([1,2,3]);
    return task({lessonId:'A14',skill:'A-MOD-OPT',title:'Maximum eines Sachmodells',answerKind:'point',operator:'interpretieren',answer:[h,k],prompt:`Die Leistung eines Systems wird durch \\(P(t)=${a}(t-${h})^2+${k}\\) modelliert. Bestimme Zeitpunkt und Höhe des Maximums als Punkt \\((t|P)\\).`,hints:['Die Scheitelpunktform zeigt das Maximum direkt.'],solutionSteps:[`Da \\(a=${a}<0\\), ist der Scheitel ein Maximum.`,`\\(M(${h}|${k})\\)`],explanation:'Bei einer nach unten geöffneten Parabel ist der Scheitelpunkt das globale Maximum.'});
  }

  function compareModels(){
    const m=pick([2,3,4]),b=rand(1,5),a=pick([1,2]),x=pick([2,3,4]),c=(m*x+b)-a*x*x;
    const y=m*x+b;
    const correct=`Beide Modelle liefern bei x=${x} den Wert ${y}; außerhalb des betrachteten Bereichs können sie stark auseinanderlaufen.`;
    const options=shuffle([correct,'Beide Modelle sind deshalb für alle x identisch.','Das quadratische Modell ist immer genauer.','Ein Schnittpunkt beweist, dass beide dieselbe Änderungsrate besitzen.']);
    return task({lessonId:'A14',skill:'A-MOD-COMP',title:'Modelle vergleichen und begrenzen',type:'choice',answerKind:'choice',operator:'beurteilen',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Vergleiche \\(L(x)=${m}x+${b}\\) und \\(Q(x)=${a}x^2 ${signed(c)}\\), die sich bei \\(x=${x}\\) schneiden. Welche Aussage ist fachlich korrekt?`,hints:['Ein gemeinsamer Funktionswert bedeutet nicht identische Modelle.'],solutionSteps:[`\\(L(${x})=Q(${x})=${y}\\)`,'Ein einzelner Schnittpunkt sagt nichts über das globale Verhalten oder gleiche Steigungen aus.'],explanation:'Modellvergleich benötigt neben Übereinstimmung auch Gültigkeitsbereich und Struktur.'});
  }

  function modelUnits(){
    const correct='Die Ableitung besitzt die Einheit Bestandsmenge pro Zeiteinheit.';
    const options=shuffle([correct,'Die Ableitung besitzt immer dieselbe Einheit wie f.','Die Einheit verschwindet beim Ableiten.','Die Ableitung besitzt die Einheit Zeit pro Bestandsmenge.']);
    return task({lessonId:'A14',skill:'A-MOD-UNIT',title:'Einheit einer Änderungsrate',type:'choice',answerKind:'choice',operator:'interpretieren',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:'Wenn f(t) eine Wassermenge in Litern und t die Zeit in Minuten beschreibt: Welche Einheit besitzt f′(t)?',hints:['Eine Änderungsrate ist Δy/Δx.'],solutionSteps:['Zähler: Liter.','Nenner: Minuten.','Also Liter pro Minute.'],explanation:'Ableitungen tragen die Einheit der abhängigen Größe geteilt durch die Einheit der unabhängigen Größe.'});
  }

  function vectorLinearCombination(){
    const u=[rand(-4,4),rand(-4,4),rand(-4,4)],v=[rand(-4,4),rand(-4,4),rand(-4,4)],a=pick([-3,-2,2,3]),b=pick([-2,-1,1,2]);
    const ans=u.map((n,i)=>a*n+b*v[i]);
    return task({lessonId:'G2',skill:'G-VEC-LIN',title:'Linearkombination von Vektoren',answerKind:'vector',operator:'berechnen',answer:ans,prompt:`Berechne \\(${a}${vec(u)} ${b<0?'-':'+'} ${Math.abs(b)}${vec(v)}\\).`,hints:['Skaliere beide Vektoren zuerst getrennt.','Addiere danach komponentenweise.'],solutionSteps:[`\\(${a}${vec(u)}=${vec(u.map(n=>a*n))}\\)`,`\\(${b}${vec(v)}=${vec(v.map(n=>b*n))}\\)`,`Ergebnis: ${vec(ans)}`],explanation:'Vektoraddition und Skalarmultiplikation werden in jeder Komponente ausgeführt.'});
  }

  function parallelogramFourthPoint(){
    const A=[rand(-4,4),rand(-4,4),rand(-4,4)],B=[rand(-4,4),rand(-4,4),rand(-4,4)],D=[rand(-4,4),rand(-4,4),rand(-4,4)];
    const C=A.map((n,i)=>B[i]+D[i]-n);
    return task({lessonId:'G3',skill:'G-FIG-PARA',title:'Vierten Parallelogrammpunkt bestimmen',answerKind:'point',operator:'bestimmen',answer:C,prompt:`A${`(${A.join('|')})`}, B${`(${B.join('|')})`} und D${`(${D.join('|')})`} sind aufeinanderfolgende Eckpunkte eines Parallelogramms ABCD. Bestimme C.`,hints:['Es gilt \\(\\vec{AC}=\\vec{AB}+\\vec{AD}\\).','Äquivalent: C=B+D−A.'],solutionSteps:[`\\(C=B+D-A\\)`,`\\(C(${C.join('|')})\\)`],explanation:'In einem Parallelogramm führen die beiden Seitenvektoren von A gemeinsam zum gegenüberliegenden Punkt C.'});
  }

  function linePointAtParameter(){
    const a=[rand(-4,4),rand(-4,4),rand(-4,4)],u=[nonZero(-3,3),nonZero(-3,3),nonZero(-3,3)],t=rand(-3,4),P=a.map((n,i)=>n+t*u[i]);
    return task({lessonId:'G4',skill:'G-LINE-PAR',title:'Punkt einer Parametergeraden',answerKind:'point',operator:'berechnen',answer:P,prompt:`Gegeben ist \\(g:\\vec x=${vec(a)}+t${vec(u)}\\). Bestimme den Punkt für \\(t=${t}\\).`,hints:['Skaliere den Richtungsvektor mit t.','Addiere zum Stützvektor.'],solutionSteps:[`\\(${t}${vec(u)}=${vec(u.map(n=>t*n))}\\)`,`\\(P(${P.join('|')})\\)`],explanation:'Der Parameter steuert, wie weit und in welcher Richtung man sich vom Stützpunkt bewegt.'});
  }

  function motionCollisionTime(){
    const P=[rand(-3,3),rand(-3,3),rand(-3,3)],u=[1,2,-1],v=[-1,1,2],t=pick([1,2,3]);
    const A=P.map((n,i)=>n-t*u[i]),B=P.map((n,i)=>n-t*v[i]);
    return task({lessonId:'G5',skill:'G-MOVE-COLL',title:'Begegnungszeit zweier Bewegungen',operator:'bestimmen',answer:t,prompt:`Zwei Objekte bewegen sich synchron: \\(g(t)=${vec(A)}+t${vec(u)}\\), \\(h(t)=${vec(B)}+t${vec(v)}\\). Zu welcher Zeit treffen sie sich?`,hints:['Bei einer echten Begegnung muss derselbe Zeitparameter in beiden Bewegungen gelten.','Setze die Ortsvektoren gleich.'],solutionSteps:[`\\(g(${t})=h(${t})=${vec(P)}\\)`,`Treffzeit \\(t=${t}\\)`],explanation:'Im Bewegungskontext reicht ein geometrischer Geradenschnitt nicht; beide müssen den Punkt zur gleichen Zeit erreichen.'});
  }

  function lineSegmentIntersection(){
    const A=[rand(-3,3),rand(-3,3),rand(-3,3)],u=[1,2,-1],t=pick([0.25,0.5,0.75]),P=A.map((n,i)=>n+t*u[i]);
    const B=[rand(-3,3),rand(-3,3),rand(-3,3)],v=P.map((n,i)=>n-B[i]);
    const correct='Ja, denn der Schnittparameter der Strecke liegt zwischen 0 und 1.';
    const options=shuffle([correct,'Nein, weil ein Parameter niemals kleiner als 1 sein darf.','Nein, Geraden im Raum können sich nicht schneiden.','Ja, unabhängig vom Parameterwert.']);
    return task({lessonId:'G5',skill:'G-SEG-CHECK',title:'Schnittpunkt auf einer Strecke prüfen',type:'choice',answerKind:'choice',operator:'begründen',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt:`Die Strecke \\(s:\\vec x=${vec(A)}+\\lambda${vec(u)}\\) gilt für \\(0\\le\\lambda\\le1\\). Eine zweite Gerade schneidet ihre Trägergerade bei \\(\\lambda=${fmt(t)}\\). Liegt der Schnittpunkt auf der Strecke?`,hints:['Prüfe nur den zulässigen Parameterbereich.'],solutionSteps:[`\\(0\\le${fmt(t)}\\le1\\)`,'Der Punkt gehört zur Strecke.'],explanation:'Eine Strecke ist nur der Teil einer Geraden, dessen Parameter im angegebenen Intervall liegt.'});
  }

  function lgsParameterConsistency(){
    const kind=pick(['none','infinite','one']);
    let prompt,correct,expl;
    if(kind==='none'){
      prompt='Für welchen Wert von k besitzt das LGS x+y=4 und 2x+2y=k keine Lösung?';correct='jeder Wert k ≠ 8';expl='Die linken Seiten sind Vielfache. Nur k=8 erzeugt dieselbe Gerade; jeder andere Wert einen Widerspruch.';
    }else if(kind==='infinite'){
      prompt='Für welchen Wert von k besitzt das LGS x+y=4 und 2x+2y=k unendlich viele Lösungen?';correct='k=8';expl='Die zweite Gleichung muss vollständig das Doppelte der ersten sein.';
    }else{
      prompt='Das LGS x+y=4 und 2x−y=k besitzt für wie viele reelle k genau eine Lösung?';correct='für alle reellen k';expl='Die Koeffizientenzeilen sind keine Vielfachen; die Geraden schneiden sich für jedes k genau einmal.';
    }
    const options=shuffle([correct,'nur k=0','für keinen Wert von k','nur k=4']);
    return task({lessonId:'G6',skill:'G-LGS-PAR',title:'Parameter und Lösungssituation',type:'choice',answerKind:'choice',operator:'begründen',options,answer:String.fromCharCode(65+options.indexOf(correct)),prompt,hints:['Vergleiche die Koeffizientenverhältnisse.'],solutionSteps:[expl],explanation:expl});
  }

  const generators={reciprocalDomainReasoning,powerCompare,polynomialFromRoots,polynomialCoefficientFromPoint,discriminantParameter,quadraticParameterRoot,transformationRecover,sinusPhaseShift,averageRateMissingValue,derivativeAtPointFromDefinition,tangentParallel,normalEquationV6,derivativeGraphFeature,derivativeRuleSelection,stationaryPointClassify,parameterExtremaV6,inflectionTangent,terracePoint,polynomialFromConditions,reconstructCubic,curveConsistencyChoice,modelOptimization,compareModels,modelUnits,vectorLinearCombination,parallelogramFourthPoint,linePointAtParameter,motionCollisionTime,lineSegmentIntersection,lgsParameterConsistency};
  const catalog=[
    ['reciprocalDomainReasoning','A1','Definitionslücke begründen'],['powerCompare','A1','Potenzsymmetrie vergleichen'],
    ['polynomialFromRoots','A2','Polynom aus Nullstellen'],['polynomialCoefficientFromPoint','A14','Parameter aus Punktbedingung'],
    ['discriminantParameter','F2','Parameter und Lösungsanzahl'],['quadraticParameterRoot','F2','Parameter aus Nullstelle'],
    ['transformationRecover','A4','Transformation rekonstruieren'],['sinusPhaseShift','A5','Sinus-Phasenlage'],
    ['averageRateMissingValue','A6','Fehlenden Funktionswert bestimmen'],['derivativeAtPointFromDefinition','A7','Ableitung aus Definition am Punkt'],
    ['tangentParallel','A8','Parallele Tangente'],['normalEquationV6','A8','Normalengleichung'],
    ['derivativeGraphFeature','A9','f′-Graph deuten'],['derivativeRuleSelection','A10','Ableitungsregeln auswählen'],
    ['stationaryPointClassify','A11','Stationäre Stellen klassifizieren'],['parameterExtremaV6','A11','Parameter für Extremstelle'],
    ['inflectionTangent','A12','Wendetangente'],['terracePoint','A12','Terrassenpunkt'],
    ['polynomialFromConditions','A13','Funktion aus Bedingungen'],['reconstructCubic','A13','Kurvendaten vernetzen'],
    ['curveConsistencyChoice','A13','Kurvendiskussion prüfen'],['modelOptimization','A14','Sachmodell optimieren'],
    ['compareModels','A14','Modelle vergleichen'],['modelUnits','A14','Einheiten interpretieren'],
    ['vectorLinearCombination','G2','Vektor-Linearkombination'],['parallelogramFourthPoint','G3','Parallelogrammpunkt'],
    ['linePointAtParameter','G4','Parameterpunkt'],['motionCollisionTime','G5','Begegnungszeit'],
    ['lineSegmentIntersection','G5','Streckenschnitt prüfen'],['lgsParameterConsistency','G6','LGS mit Parameter']
  ];

  E.generate=function(generatorId,difficulty=2){
    const fn=generators[generatorId];
    if(fn){const out=fn(difficulty);out.difficulty=difficulty;return out;}
    return oldGenerate(generatorId,difficulty);
  };
  for(const entry of catalog)if(!E.generatorCatalog.some(x=>x[0]===entry[0]))E.generatorCatalog.push(entry);

  const mathTokenCount = work => (String(work||'').match(/[-+*/=^]|\d+(?:[.,]\d+)?|f'?\s*\(|x|t|r|s|λ/gi)||[]).length;
  const normalized = text => String(text||'').toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss');
  function keywordHits(text,keywords=[]){
    const n=normalized(text);
    return keywords.filter(k=>n.includes(normalized(k))).length;
  }
  function inferOperator(taskDef){
    if(taskDef.operator)return taskDef.operator;
    const p=normalized(taskDef.prompt);
    if(p.includes('begruend'))return'begründen';
    if(p.includes('interpret'))return'interpretieren';
    if(p.includes('beurteil'))return'beurteilen';
    if(p.includes('nachweis'))return'nachweisen';
    if(p.includes('erklaer')||p.includes('erlaeuter'))return'erläutern';
    if(p.includes('berech'))return'berechnen';
    return'bestimmen';
  }
  function inferStrategyKeywords(taskDef){
    const text=normalized(`${taskDef.title} ${taskDef.prompt}`);
    if(text.includes('nullstell')||text.includes('gleichung'))return['gleich null','faktor','pq','wurzel','einsetzen'];
    if(text.includes('ableit')||text.includes('tangent')||text.includes('normal'))return['ableitung','potenzregel','steigung','einsetzen'];
    if(text.includes('extrem'))return['erste ableitung','gleich null','zweite ableitung','vorzeichenwechsel'];
    if(text.includes('wend')||text.includes('kruemm'))return['zweite ableitung','vorzeichenwechsel','in f einsetzen'];
    if(text.includes('vektor')||text.includes('gerade')||text.includes('schnitt'))return['komponenten','parameter','gleichsetzen','einsetzen'];
    if(text.includes('modell')||text.includes('sach'))return['variable','einheit','bedingung','kontext'];
    return taskDef.reasoningKeywords||['formel','regel','einsetzen'];
  }
  function analyzeWork(taskDef,work=''){
    const text=String(work||'').trim(),operator=inferOperator(taskDef),strategyKeywords=taskDef.strategyKeywords||inferStrategyKeywords(taskDef);
    const strategyHits=keywordHits(text,strategyKeywords);
    const tokens=mathTokenCount(text),lines=text.split(/\n|;/).map(x=>x.trim()).filter(Boolean).length,equalities=(text.match(/=/g)||[]).length;
    const controlHits=keywordHits(text,['probe','kontrolle','einsetzen','passt','plausibel','dritte koordinate','definitionsmenge','einheit']);
    const interpretationHits=keywordHits(text,['bedeutet','pro','einheit','im kontext','modell','zeit','strecke','liter','minute','punkt']);
    const strategy=Math.min(1,strategyHits>=2?1:strategyHits?0.5:0);
    const process=Math.min(1,tokens>=10&&equalities>=1?1:tokens>=5||lines>=2?0.5:0);
    const reasoningNeed=['begründen','erläutern','interpretieren','beurteilen','nachweisen'].includes(operator);
    const reasoning=Math.min(1,reasoningNeed?(text.length>=55&&(strategyHits+interpretationHits)>=2?1:text.length>=25?0.5:0):(text.length>=20?0.5:0));
    const control=Math.min(1,controlHits>=1?1:0);
    let layer='Methodenwahl';
    if(!text)layer='Darstellung';
    else if(strategy===0)layer='Methodenwahl';
    else if(process===0)layer='Algebra';
    else if(reasoningNeed&&reasoning===0)layer=operator==='interpretieren'||operator==='beurteilen'?'Interpretation':'Begründung';
    else if(control===0)layer='Kontrolle';
    return {operator,strategy,process,reasoning,control,strategyHits,tokens,lines,equalities,layer,evidence:{strategyKeywords,controlHits,interpretationHits}};
  }

  function enhanceExamTaskV6(t,index,section,indexInSection){
    if(t.type==='choice' || t.answerKind==='choice'){
      const base=Math.max(4,Number(t.points||3));
      return {...t,id:`${t.id}-V6E${index}`,examNumber:index+1,sectionId:section.id,sectionTitle:section.title,aid:section.aid,indexInSection:indexInSection+1,
        operator:inferOperator(t),points:base,answerPoints:base,strategyPoints:0,processPoints:0,reasoningPoints:0,controlPoints:0,
        strategyKeywords:t.strategyKeywords||inferStrategyKeywords(t),rubric:[{key:'answer',label:'Entscheidung / Auswahl',points:base}]};
    }
    const base=Math.max(6,Number(t.points||3)+3);
    const answerPoints=base-4;
    return {...t,id:`${t.id}-V6E${index}`,examNumber:index+1,sectionId:section.id,sectionTitle:section.title,aid:section.aid,indexInSection:indexInSection+1,
      operator:inferOperator(t),points:base,answerPoints,strategyPoints:1,processPoints:1,reasoningPoints:1,controlPoints:1,
      strategyKeywords:t.strategyKeywords||inferStrategyKeywords(t),rubric:[
        {key:'answer',label:'Ergebnis / Objekt',points:answerPoints},{key:'strategy',label:'Strategie',points:1},{key:'process',label:'Zwischenschritte',points:1},{key:'reasoning',label:'Begründung / Deutung',points:1},{key:'control',label:'Kontrolle',points:1}
      ]};
  }

  function createExamV6(level='preExam120'){
    const custom=D6.examBlueprints[level];
    let sections;
    if(custom){sections=custom.sections.map((s,i)=>({...s,id:`S${i+1}`}));}
    else {
      const old=window.MATHFORGE_V03_DATA.examBlueprints[level]||window.MATHFORGE_V03_DATA.examBlueprints.full;
      const split=Math.max(1,Math.ceil(old.generatorIds.length*0.4));
      sections=[
        {id:'S1',title:'Teil A · hilfsmittelfrei',aid:'Keine digitalen Hilfsmittel',generatorIds:old.generatorIds.slice(0,split)},
        {id:'S2',title:'Teil B · mit Hilfsmitteln',aid:'Taschenrechner/Graphenansicht erlaubt',generatorIds:old.generatorIds.slice(split)}
      ].filter(s=>s.generatorIds.length);
    }
    const title=custom?.title||(window.MATHFORGE_V03_DATA.examBlueprints[level]?.title||'EF NRW Probeklausur');
    const minutes=custom?.minutes||(window.MATHFORGE_V03_DATA.examBlueprints[level]?.minutes||90);
    let index=0;const tasks=[];
    sections.forEach(section=>section.generatorIds.forEach((generatorId,j)=>tasks.push(enhanceExamTaskV6(E.generate(generatorId,(index++%3)+2),index-1,section,j))));
    return {id:id('EXAM-V10'),title,level,tasks,sections:sections.map(s=>({id:s.id,title:s.title,aid:s.aid,count:s.generatorIds.length})),totalPoints:tasks.reduce((sum,t)=>sum+t.points,0),minutes,created:Date.now(),version:10,sourceStyle:'synthetische Aufgaben im NRW-Stil'};
  }

  function scoreExamTaskV6(taskDef,user,work=''){
    const base=oldScoreExamTask?oldScoreExamTask(taskDef,user,work):{...E.checkAnswer(taskDef,user),points:E.checkAnswer(taskDef,user).correct?taskDef.answerPoints:0,answerPoints:E.checkAnswer(taskDef,user).correct?taskDef.answerPoints:0};
    const wa=analyzeWork(taskDef,work);
    const answerPoints=Math.min(taskDef.answerPoints||2,base.answerPoints??(base.correct?taskDef.answerPoints:0));
    const strategyPoints=(taskDef.strategyPoints||0)*wa.strategy;
    const processPoints=(taskDef.processPoints||0)*wa.process;
    const reasoningPoints=(taskDef.reasoningPoints||0)*wa.reasoning;
    const controlPoints=(taskDef.controlPoints||0)*wa.control;
    const points=Math.min(taskDef.points,Math.round((answerPoints+strategyPoints+processPoints+reasoningPoints+controlPoints)*2)/2);
    const answerCorrect=E.checkAnswer(taskDef,user).correct;
    const taxonomy=D6.errorTaxonomy[wa.layer]||D6.errorTaxonomy.Methodenwahl;
    const diagnosis=answerCorrect?null:{type:wa.layer,title:`${wa.layer}: ${taxonomy.signal}`,repair:taxonomy.repair.join(' → ')};
    return {correct:answerCorrect,points,maxPoints:taskDef.points,answerPoints,strategyPoints,processPoints,reasoningPoints,controlPoints,workAnalysis:wa,answerNote:answerCorrect?'Ergebnis korrekt':'Ergebnis noch nicht korrekt',reasoningNote:wa.reasoning?'Begründung erkennbar':'Begründung noch zu knapp',diagnosis};
  }

  function wrapContextTask(t,contextPrompt,operator){return {...t,id:id('CASE-T'),prompt:contextPrompt||t.prompt,operator:operator||t.operator,points:Math.max(4,t.points||4)};}
  function createCaseStudy(type='ramp'){
    if(type==='ramp'){
      const a=pick([1,2]),r=pick([2,3]),d=rand(1,5),b=-3*a*r*r,expr=`${a}x^3 ${signed(b)}x ${signed(d)}`;
      const extrema=[-r,r],ys=extrema.map(x=>valueAt(expr,x));
      return {id:id('CASE'),type,title:'Skatepark-Rampe',subtitle:'Ein kubischer Rampenquerschnitt wird vollständig untersucht.',context:`Der Querschnitt einer Rampe wird im Planungsbereich durch \\(f(x)=${expr}\\) beschrieben. x und f(x) werden in Metern gemessen.`,lessonIds:['A10','A11','A12','A13','A14'],tasks:[
        wrapContextTask(task({lessonId:'A10',skill:'CASE-R1',title:'Ableitung',answerKind:'expression',answer:`${3*a}x^2 ${signed(b)}`,prompt:'Bestimme f′(x).',solutionSteps:[`\\(f'(x)=${3*a}x^2 ${signed(b)}\\)`],explanation:'Die Ableitung beschreibt die Rampensteigung.'})),
        wrapContextTask(task({lessonId:'A11',skill:'CASE-R2',title:'Stationäre Stellen',answerKind:'set',answer:extrema,prompt:'Bestimme alle stationären Stellen.',solutionSteps:[`\\(f'(x)=0\\Rightarrow x=\\pm${r}\\)`],explanation:'Stationäre Stellen liegen bei Steigung null.'})),
        wrapContextTask(task({lessonId:'A11',skill:'CASE-R3',title:'Höhen an Extremstellen',answerKind:'point',answer:ys,prompt:`Gib das Wertepaar \\((f(-${r})|f(${r}))\\) an.`,solutionSteps:[`\\(f(-${r})=${ys[0]}, f(${r})=${ys[1]}\\)`],explanation:'Die x-Stellen werden in die Ausgangsfunktion eingesetzt.'})),
        wrapContextTask(task({lessonId:'A12',skill:'CASE-R4',title:'Wendepunkt',answerKind:'point',answer:[0,d],prompt:'Bestimme den Wendepunkt.',solutionSteps:[`\\(f''(x)=${6*a}x\\Rightarrow x=0\\)`,`\\(W(0|${d})\\)`],explanation:'Die Krümmung wechselt am Ursprung der verschobenen Kubik.'})),
        wrapContextTask(task({lessonId:'A12',skill:'CASE-R5',title:'Wendetangente',answerKind:'expression',answer:`${b}x ${signed(d)}`,prompt:'Bestimme die Tangente im Wendepunkt.',solutionSteps:[`\\(m=f'(0)=${b}\\)`,`\\(t(x)=${b}x ${signed(d)}\\)`],explanation:'Punkt und lokale Steigung bestimmen die Tangente.'})),
        wrapContextTask(task({lessonId:'A14',skill:'CASE-R6',title:'Modellgrenze',type:'choice',answerKind:'choice',operator:'beurteilen',options:['Das Polynom ist nur im geplanten Rampenintervall sinnvoll; außerhalb können unphysikalische Höhen entstehen.','Das Polynom beschreibt die Rampe für alle reellen x exakt.','Negative Funktionswerte sind immer zulässig.','Die Ableitung ersetzt die Höhenfunktion.'],answer:'A',prompt:'Beurteile die Gültigkeit des Modells.',solutionSteps:['Ein mathematischer Term kann außerhalb des Sachbereichs unpassende Werte liefern.'],explanation:'Sachmodelle benötigen einen begründeten Gültigkeitsbereich.'}))
      ]};
    }
    if(type==='solar'){
      const h=pick([5,6,7]),k=pick([18,24,30]),a=-pick([1,2]),expr=`${a}(t-${h})^2+${k}`;
      const roots=[h-Math.sqrt(k/Math.abs(a)),h+Math.sqrt(k/Math.abs(a))];
      return {id:id('CASE'),type,title:'Solarleistung',subtitle:'Tagesleistung als Parabelmodell.',context:`Die Leistung einer Solaranlage wird näherungsweise durch \\(P(t)=${expr}\\) in kW modelliert. t ist die Zeit in Stunden nach Sonnenaufgang.`,lessonIds:['F2','A6','A11','A14'],tasks:[
        task({lessonId:'A14',skill:'CASE-S1',title:'Maximum',answerKind:'point',operator:'interpretieren',answer:[h,k],prompt:'Bestimme Zeitpunkt und Leistung des Maximums als Punkt.',solutionSteps:[`Scheitelpunkt \\(M(${h}|${k})\\)`],explanation:'Die nach unten geöffnete Parabel erreicht am Scheitel ihr Maximum.'}),
        task({lessonId:'A6',skill:'CASE-S2',title:'Mittlere Änderung',answer:(a*((h+1)-h)**2+k-(a*((h-1)-h)**2+k))/2,prompt:`Berechne die mittlere Änderungsrate auf \\([${h-1};${h+1}]\\).`,solutionSteps:['Wegen Symmetrie sind die Randwerte gleich; der Quotient ist 0.'],explanation:'Über ein symmetrisches Intervall um das Maximum ist die Gesamtänderung null.'}),
        task({lessonId:'A11',skill:'CASE-S3',title:'Lokale Änderungsrate am Maximum',answer:0,prompt:`Bestimme \\(P'(${h})\\).`,solutionSteps:['Am Scheitelpunkt ist die Tangente waagerecht.'],explanation:'Ein inneres Maximum einer differenzierbaren Funktion besitzt Steigung 0.'}),
        task({lessonId:'F2',skill:'CASE-S4',title:'Modellierte Betriebsgrenzen',answerKind:'set',answer:roots,prompt:'Bestimme die beiden mathematischen Nullstellen. Dezimalwerte sind erlaubt.',tolerance:1e-5,solutionSteps:[`\\((t-${h})^2=${k/Math.abs(a)}\\)`,`\\(t=${h}\\pm\\sqrt{${k/Math.abs(a)}}\\)`],explanation:'Die Nullstellen markieren im Modell Beginn und Ende positiver Leistung.'}),
        task({lessonId:'A14',skill:'CASE-S5',title:'Realitätscheck',type:'choice',answerKind:'choice',operator:'beurteilen',options:['Nur nichtnegative Zeiten und der reale Tagesbereich sind sinnvoll.','Alle reellen t sind gleich realistisch.','Negative Leistung ist immer physikalisch korrekt.','Der Scheitelpunkt zeigt eine Nullstelle.'],answer:'A',prompt:'Welche Einschränkung ist für das Modell nötig?',solutionSteps:['Zeit und Leistung besitzen sachliche Grenzen.'],explanation:'Ein Polynom hat mathematisch einen größeren Definitionsbereich als das reale Modell.'})
      ]};
    }
    if(type==='temperature'){
      const A=pick([5,6,8]),d=pick([12,14,16]),phase=pick([6,8]),expr=`${A}sin((pi/12)(t-${phase}))+${d}`;
      return {id:id('CASE'),type,title:'Tages-Temperatur',subtitle:'Periodisches Modell eines Tagesverlaufs.',context:`Ein vereinfachtes Temperaturmodell lautet \\(T(t)=${A}\\sin(\\frac{\\pi}{12}(t-${phase}))+${d}\\). t wird in Stunden gemessen.`,lessonIds:['A5','A14'],tasks:[
        task({lessonId:'A5',skill:'CASE-T1',title:'Amplitude',answer:A,prompt:'Bestimme die Amplitude.',solutionSteps:[`Amplitude \\(|A|=${A}\\)`],explanation:'Die Amplitude ist die maximale Abweichung von der Mittellinie.'}),
        task({lessonId:'A5',skill:'CASE-T2',title:'Mittellinie',answer:d,prompt:'Bestimme die Mittellinie als Temperaturwert.',solutionSteps:[`Mittellinie \\(T=${d}\\)`],explanation:'Der additive Parameter verschiebt die gesamte Kurve vertikal.'}),
        task({lessonId:'A5',skill:'CASE-T3',title:'Periode',answer:24,prompt:'Bestimme die Periodenlänge in Stunden.',solutionSteps:['b=π/12, daher 2π/b=24.'],explanation:'Das Modell wiederholt sich nach 24 Stunden.'}),
        task({lessonId:'A5',skill:'CASE-T4',title:'Zeitverschiebung',answer:phase,prompt:'Um wie viele Stunden ist die Grundkurve nach rechts verschoben?',solutionSteps:[`Verschiebung: ${phase}`],explanation:'Der Term t−phase verschiebt die Kurve nach rechts.'}),
        task({lessonId:'A14',skill:'CASE-T5',title:'Modellkritik',type:'choice',answerKind:'choice',operator:'beurteilen',options:['Das Modell erfasst eine idealisierte 24-Stunden-Periode, aber keine Wetterwechsel.','Das Modell ist an jedem Tag exakt.','Die Amplitude ist die Durchschnittstemperatur.','Die Periode hängt von d ab.'],answer:'A',prompt:'Beurteile die Aussagekraft des Modells.',solutionSteps:['Periodizität ist eine Annahme; reale Störungen fehlen.'],explanation:'Ein gutes Urteil nennt sowohl Nutzen als auch Grenze eines Modells.'})
      ]};
    }
    if(type==='drone'){
      const P=[rand(-2,3),rand(-2,3),rand(-2,3)],u=[1,2,-1],v=[-1,1,2],t=pick([1,2,3]),A=P.map((n,i)=>n-t*u[i]),B=P.map((n,i)=>n-t*v[i]);
      return {id:id('CASE'),type,title:'Drohnen-Routen',subtitle:'Räumliche Bewegung und echte Begegnung.',context:`Drohne A fliegt nach \\(a(t)=${vec(A)}+t${vec(u)}\\), Drohne B nach \\(b(t)=${vec(B)}+t${vec(v)}\\). Der Parameter t wird in Minuten gemessen.`,lessonIds:['G4','G5','G6'],tasks:[
        task({lessonId:'G4',skill:'CASE-D1',title:'Position A',answerKind:'point',answer:P,prompt:`Bestimme die Position von A bei \\(t=${t}\\).`,solutionSteps:[`\\(a(${t})=${vec(P)}\\)`],explanation:'Der Zeitparameter wird in die Bewegungsgleichung eingesetzt.'}),
        task({lessonId:'G4',skill:'CASE-D2',title:'Position B',answerKind:'point',answer:P,prompt:`Bestimme die Position von B bei \\(t=${t}\\).`,solutionSteps:[`\\(b(${t})=${vec(P)}\\)`],explanation:'Auch B erreicht denselben Punkt zur selben Zeit.'}),
        task({lessonId:'G5',skill:'CASE-D3',title:'Begegnungszeit',answer:t,prompt:'Bestimme die Begegnungszeit.',solutionSteps:[`Ortsvektoren gleichsetzen ergibt \\(t=${t}\\).`],explanation:'Für eine Kollision müssen Ort und Zeit übereinstimmen.'}),
        task({lessonId:'G5',skill:'CASE-D4',title:'Begegnungspunkt',answerKind:'point',answer:P,prompt:'Gib den Begegnungspunkt an.',solutionSteps:[`\\(S(${P.join('|')})\\)`],explanation:'Der gefundene Zeitwert wird in eine der Bewegungen eingesetzt.'}),
        task({lessonId:'G5',skill:'CASE-D5',title:'Sicherheitsurteil',type:'choice',answerKind:'choice',operator:'beurteilen',options:['Eine Kollisionswarnung ist nötig, weil beide denselben Punkt zur selben Zeit erreichen.','Keine Warnung, weil nur die Trägergeraden betrachtet werden.','Keine Warnung, sobald die Richtungsvektoren verschieden sind.','Eine Kollision ist im Raum grundsätzlich unmöglich.'],answer:'A',prompt:'Beurteile die Situation.',solutionSteps:['Ort und synchroner Parameter stimmen überein.'],explanation:'Bei Bewegungen muss zusätzlich zum geometrischen Schnitt die Zeitgleichheit geprüft werden.'})
      ]};
    }
    if(type==='park'){
      const A=[rand(-3,3),rand(-3,3),0],B=[rand(1,5),rand(-3,3),0],D=[rand(-3,3),rand(1,5),0],C=A.map((n,i)=>B[i]+D[i]-n),AB=B.map((n,i)=>n-A[i]),AD=D.map((n,i)=>n-A[i]);
      return {id:id('CASE'),type,title:'Geometrischer Stadtpark',subtitle:'Ein Parallelogramm wird vektoriell geplant.',context:`Drei Eckpunkte einer Parkfläche sind \\(A(${A.join('|')})\\), \\(B(${B.join('|')})\\) und \\(D(${D.join('|')})\\). ABCD soll ein Parallelogramm sein.`,lessonIds:['G1','G2','G3'],tasks:[
        task({lessonId:'G1',skill:'CASE-P1',title:'Seitenvektor AB',answerKind:'vector',answer:AB,prompt:'Bestimme den Vektor AB.',solutionSteps:[`\\(\\vec{AB}=B-A=${vec(AB)}\\)`],explanation:'Verbindungsvektor = Ziel minus Start.'}),
        task({lessonId:'G1',skill:'CASE-P2',title:'Seitenvektor AD',answerKind:'vector',answer:AD,prompt:'Bestimme den Vektor AD.',solutionSteps:[`\\(\\vec{AD}=D-A=${vec(AD)}\\)`],explanation:'Auch der zweite Seitenvektor startet in A.'}),
        task({lessonId:'G3',skill:'CASE-P3',title:'Vierter Eckpunkt',answerKind:'point',answer:C,prompt:'Bestimme C.',solutionSteps:[`\\(C=B+D-A\\)`,`\\(C(${C.join('|')})\\)`],explanation:'Die Summe der beiden Seitenvektoren führt von A zum Gegenpunkt.'}),
        task({lessonId:'G2',skill:'CASE-P4',title:'Länge AB',answer:Math.sqrt(AB.reduce((s,n)=>s+n*n,0)),tolerance:1e-5,prompt:'Berechne die Länge der Seite AB.',solutionSteps:[`\\(|AB|=\\sqrt{${AB.map(n=>n*n).join('+')}}\\)`],explanation:'Die Länge folgt aus dem räumlichen Satz des Pythagoras.'}),
        task({lessonId:'G3',skill:'CASE-P5',title:'Parallelogramm-Nachweis',type:'choice',answerKind:'choice',operator:'nachweisen',options:['AB=DC und AD=BC als Vektorgleichheiten prüfen.','Nur die vier Punktnamen vergleichen.','Alle Ortsvektoren müssen gleich sein.','Eine Seite muss Länge 0 haben.'],answer:'A',prompt:'Welcher Nachweis ist geeignet?',solutionSteps:['Gegenüberliegende Seiten eines Parallelogramms sind gleich und parallel.'],explanation:'Vektorgleichheit enthält Richtung und Länge.'})
      ]};
    }
    if(type==='traffic'){
      const m=pick([2,3]),b=pick([4,6]),a=1,x=pick([2,3]),c=m*x+b-x*x,y=m*x+b;
      return {id:id('CASE'),type,title:'Verkehrsmodelle',subtitle:'Lineares und quadratisches Modell werden verglichen.',context:`Für ein Verkehrsaufkommen werden \\(L(t)=${m}t+${b}\\) und \\(Q(t)=t^2 ${signed(c)}\\) diskutiert. Beide liefern bei \\(t=${x}\\) denselben Wert.`,lessonIds:['F3','A14'],tasks:[
        task({lessonId:'F3',skill:'CASE-V1',title:'Lineares Modell auswerten',answer:y,prompt:`Berechne \\(L(${x})\\).`,solutionSteps:[`\\(L(${x})=${y}\\)`],explanation:'Direktes Einsetzen in das lineare Modell.'}),
        task({lessonId:'A14',skill:'CASE-V2',title:'Quadratisches Modell auswerten',answer:y,prompt:`Berechne \\(Q(${x})\\).`,solutionSteps:[`\\(Q(${x})=${y}\\)`],explanation:'Der gemeinsame Wert bestätigt den Schnittpunkt.'}),
        task({lessonId:'A14',skill:'CASE-V3',title:'Schnittpunkt',answerKind:'point',answer:[x,y],prompt:'Gib den bekannten Schnittpunkt an.',solutionSteps:[`\\(S(${x}|${y})\\)`],explanation:'Gleicher Eingabewert und gleicher Funktionswert ergeben den Schnittpunkt.'}),
        task({lessonId:'F3',skill:'CASE-V4',title:'Änderungsrate L',answer:m,prompt:'Bestimme die konstante Änderungsrate des linearen Modells.',solutionSteps:[`\\(L'(t)=${m}\\)`],explanation:'Beim linearen Modell ist die Steigung konstant.'}),
        task({lessonId:'A14',skill:'CASE-V5',title:'Vergleich beurteilen',type:'choice',answerKind:'choice',operator:'beurteilen',options:['Ein gemeinsamer Punkt reicht nicht, um ein Modell global als besser zu bewerten.','Beide Modelle sind wegen eines Schnittpunkts identisch.','Das lineare Modell hat stets größere Werte.','Das quadratische Modell ist automatisch realistisch.'],answer:'A',prompt:'Beurteile den Modellvergleich.',solutionSteps:['Qualität hängt von Daten, Bereich und Ziel ab.'],explanation:'Ein einzelner Übereinstimmungspunkt ist kein allgemeiner Genauigkeitsnachweis.'})
      ]};
    }
    if(type==='tank'){
      const a=pick([-1,1]),r=pick([2,3]),d=pick([10,15]),b=-3*a*r*r,expr=`${a}t^3 ${signed(b)}t ${signed(d)}`;
      return {id:id('CASE'),type,title:'Wasserbehälter',subtitle:'Bestand und Änderungsrate eines kubischen Modells.',context:`Der modellierte Wasserstand lautet \\(W(t)=${expr}\\). t wird in Stunden, W in Litern gemessen.`,lessonIds:['A6','A8','A11','A12','A14'],tasks:[
        task({lessonId:'A10',skill:'CASE-W1',title:'Änderungsrate',answerKind:'expression',answer:`${3*a}t^2 ${signed(b)}`,prompt:'Bestimme W′(t). Verwende t als Variable.',solutionSteps:[`\\(W'(t)=${3*a}t^2 ${signed(b)}\\)`],explanation:'Die Ableitung ist die momentane Zu- oder Abflussrate.'}),
        task({lessonId:'A11',skill:'CASE-W2',title:'Stationäre Zeiten',answerKind:'set',answer:[-r,r],prompt:'Bestimme die stationären Zeiten mathematisch.',solutionSteps:[`\\(W'(t)=0\\Rightarrow t=\\pm${r}\\)`],explanation:'Im realen Kontext ist später nur der zulässige Zeitbereich relevant.'}),
        task({lessonId:'A14',skill:'CASE-W3',title:'Sachbereich',type:'choice',answerKind:'choice',operator:'interpretieren',options:[`Im Zeitkontext ist normalerweise nur t≥0 sinnvoll, also bleibt t=${r}.`,'Beide negativen und positiven Zeiten sind gleich real.','Nur t<0 ist sinnvoll.','Zeit besitzt keinen Definitionsbereich.'],answer:'A',prompt:'Welche stationäre Zeit ist im üblichen Sachkontext relevant?',solutionSteps:['Mathematische und sachliche Lösungsmenge unterscheiden.'],explanation:'Zeitmodelle werden meist auf nichtnegative Werte eingeschränkt.'}),
        task({lessonId:'A12',skill:'CASE-W4',title:'Wendestelle',answer:0,prompt:'Bestimme die Wendestelle.',solutionSteps:[`\\(W''(t)=${6*a}t\\Rightarrow t=0\\)`],explanation:'Am Vorzeichenwechsel von W″ ändert sich die Entwicklung der Rate.'}),
        task({lessonId:'A8',skill:'CASE-W5',title:'Anfangsrate',answer:b,prompt:'Bestimme W′(0).',solutionSteps:[`\\(W'(0)=${b}\\)`],explanation:'Die Ableitung am Anfang ist die momentane Anfangsänderung.'}),
        task({lessonId:'A14',skill:'CASE-W6',title:'Einheit',type:'choice',answerKind:'choice',operator:'interpretieren',options:['Liter pro Stunde','Liter','Stunden pro Liter','ohne Einheit'],answer:'A',prompt:'Welche Einheit besitzt W′(t)?',solutionSteps:['Bestandseinheit geteilt durch Zeiteinheit.'],explanation:'Eine Rate wird pro Zeit angegeben.'})
      ]};
    }
    const P=[rand(-2,2),rand(-2,2),rand(-2,2)],u=[1,1,0],v=[0,1,1],t=pick([1,2]),A=P.map((n,i)=>n-t*u[i]),B=P.map((n,i)=>n-t*v[i]);
    return {id:id('CASE'),type:'robot',title:'Roboter im Lager',subtitle:'Zwei Bewegungen werden auf eine Begegnung geprüft.',context:`Roboter R fährt nach \\(r(t)=${vec(A)}+t${vec(u)}\\), Roboter S nach \\(s(t)=${vec(B)}+t${vec(v)}\\).`,lessonIds:['G2','G4','G5'],tasks:[
      task({lessonId:'G4',skill:'CASE-RO1',title:'Position R',answerKind:'point',answer:P,prompt:`Bestimme r(${t}).`,solutionSteps:[`\\(r(${t})=${vec(P)}\\)`],explanation:'Parameter einsetzen und komponentenweise rechnen.'}),
      task({lessonId:'G4',skill:'CASE-RO2',title:'Position S',answerKind:'point',answer:P,prompt:`Bestimme s(${t}).`,solutionSteps:[`\\(s(${t})=${vec(P)}\\)`],explanation:'Auch S erreicht P.'}),
      task({lessonId:'G5',skill:'CASE-RO3',title:'Zeit',answer:t,prompt:'Bestimme die gemeinsame Zeit.',solutionSteps:[`\\(t=${t}\\)`],explanation:'Beide Bewegungsparameter sind synchron.'}),
      task({lessonId:'G5',skill:'CASE-RO4',title:'Punkt',answerKind:'point',answer:P,prompt:'Gib den Begegnungspunkt an.',solutionSteps:[`\\(P(${P.join('|')})\\)`],explanation:'Der Zeitwert wird eingesetzt.'}),
      task({lessonId:'G5',skill:'CASE-RO5',title:'Entscheidung',type:'choice',answerKind:'choice',operator:'beurteilen',options:['Die Routen führen zur selben Zeit an denselben Ort; eine Steuerungskorrektur ist nötig.','Verschiedene Richtungsvektoren schließen eine Begegnung aus.','Nur parallele Geraden können kollidieren.','Der Parameter hat keine reale Bedeutung.'],answer:'A',prompt:'Beurteile die Sicherheit.',solutionSteps:['Ort und Zeit müssen gemeinsam geprüft werden.'],explanation:'Räumliche Bewegungsmodelle verbinden Geometrie mit Zeit.'})]};
  }

  E.checkAnswer=function(taskDef,user){
    if(taskDef?.answerKind==='expression' && /(^|[^a-z])t([^a-z]|$)/i.test(String(taskDef.answer||''))){
      const mapped={...taskDef,answer:String(taskDef.answer).replace(/t/g,'x')};
      return oldCheckAnswer(mapped,String(user||'').replace(/t/g,'x'));
    }
    return oldCheckAnswer(taskDef,user);
  };

  E.createExamV6=createExamV6;
  E.scoreExamTaskV6=scoreExamTaskV6;
  E.analyzeWork=analyzeWork;
  E.createCaseStudy=createCaseStudy;
  E.v6Generators=Object.keys(generators);
})();
