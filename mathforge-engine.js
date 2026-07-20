(() => {
  'use strict';

  const EPS = 1e-7;
  const sampleXs = [-3.2, -2, -1.25, -0.4, 0.35, 1, 2.4, 4.1];

  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const choice = arr => arr[randInt(0, arr.length - 1)];
  const shuffle = arr => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(0, i);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const nonZero = (min = -6, max = 6) => {
    let n = 0;
    while (n === 0) n = randInt(min, max);
    return n;
  };
  const near = (a, b, tolerance = 1e-6) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tolerance * Math.max(1, Math.abs(a), Math.abs(b));
  const signed = n => n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`;
  const coeff = (a, power = '') => {
    if (a === 0) return '';
    const sign = a < 0 ? '-' : '';
    const abs = Math.abs(a);
    const c = power && abs === 1 ? '' : abs;
    return `${sign}${c}${power}`;
  };
  const cleanPoly = s => String(s)
    .replace(/\+\s*-/g, '- ')
    .replace(/-\s*-/g, '+ ')
    .replace(/\s+/g, ' ')
    .replace(/^\+\s*/, '')
    .trim();
  const polyTerm = (a, p) => {
    if (!a) return '';
    if (p === 0) return String(a);
    const v = p === 1 ? 'x' : `x^${p}`;
    return coeff(a, v);
  };
  const polyString = terms => {
    const out = terms.filter(t => t.a !== 0).sort((a, b) => b.p - a.p).map((t, i) => {
      let s = polyTerm(t.a, t.p);
      if (i > 0 && t.a > 0) s = `+ ${s}`;
      if (i > 0 && t.a < 0) s = `- ${s.slice(1)}`;
      return s;
    }).join(' ');
    return cleanPoly(out || '0');
  };
  const derivativeTerms = terms => terms.filter(t => t.p > 0).map(t => ({ a: t.a * t.p, p: t.p - 1 }));
  const latexPoly = s => `\\(${String(s).replace(/\^(-?\d+)/g, '^{$1}')}\\)`;
  const gcd = (a, b) => b ? gcd(b, a % b) : Math.abs(a);
  const fraction = (n, d) => {
    if (d === 0) return 'nicht definiert';
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(Math.round(Math.abs(n)), Math.round(Math.abs(d))) || 1;
    n /= g; d /= g;
    return d === 1 ? String(n) : `${n}/${d}`;
  };
  const fmtNum = n => Number.isInteger(n) ? String(n) : Number(n.toFixed(4)).toString().replace('.', ',');
  const vectorLatex = v => `\\(\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}\\)`;

  function preprocessExpression(raw) {
    let s = String(raw ?? '').trim().toLowerCase();
    s = s.replace(/−|–/g, '-').replace(/·|×/g, '*').replace(/÷|:/g, '/');
    s = s.replace(/,/g, '.').replace(/π/g, 'pi');
    s = s.replace(/²/g, '^2').replace(/³/g, '^3').replace(/⁴/g, '^4').replace(/⁵/g, '^5');
    s = s.replace(/\s+/g, '');
    s = s.replace(/^f\s*'?\s*\(x\)\s*=/, '').replace(/^y\s*=/, '').replace(/^g\s*\(x\)\s*=/, '');
    s = s.replace(/\^\{([^}]+)\}/g, '^$1');
    s = s.replace(/\\frac\\{([^{}]+)\\}\\{([^{}]+)\\}/g, '(($1)/($2))');
    s = s.replace(/\\sqrt\\{([^{}]+)\\}/g, 'sqrt($1)');
    s = s.replace(/\\cdot/g, '*');
    s = s.replace(/[{}]/g, m => m === '{' ? '(' : ')');
    s = s.replace(/(\d|x|pi|\))(?=(x|pi|sqrt|sin|cos|tan|abs|\())/g, '$1*');
    s = s.replace(/(x|pi|\))(?=\d)/g, '$1*');
    return s;
  }

  function tokenize(raw) {
    const s = preprocessExpression(raw);
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\d|\./.test(c)) {
        let j = i + 1;
        while (j < s.length && /\d|\./.test(s[j])) j++;
        const num = Number(s.slice(i, j));
        if (!Number.isFinite(num)) throw new Error('Ungültige Zahl');
        tokens.push({ type: 'number', value: num });
        i = j;
      } else if (/[a-z]/.test(c)) {
        let j = i + 1;
        while (j < s.length && /[a-z]/.test(s[j])) j++;
        tokens.push({ type: 'id', value: s.slice(i, j) });
        i = j;
      } else if ('+-*/^()'.includes(c)) {
        tokens.push({ type: c, value: c });
        i++;
      } else {
        throw new Error(`Unbekanntes Zeichen: ${c}`);
      }
    }
    return tokens;
  }

  function evaluateExpression(raw, x = 0) {
    const tokens = tokenize(raw);
    let pos = 0;
    const peek = () => tokens[pos];
    const eat = type => {
      if (peek()?.type !== type) throw new Error(`Erwartet: ${type}`);
      return tokens[pos++];
    };
    const parsePrimary = () => {
      const t = peek();
      if (!t) throw new Error('Unvollständiger Term');
      if (t.type === 'number') { pos++; return t.value; }
      if (t.type === 'id') {
        pos++;
        if (t.value === 'x') return x;
        if (t.value === 'pi') return Math.PI;
        if (['sqrt', 'sin', 'cos', 'tan', 'abs'].includes(t.value)) {
          eat('(');
          const v = parseAdd();
          eat(')');
          return ({ sqrt: Math.sqrt, sin: Math.sin, cos: Math.cos, tan: Math.tan, abs: Math.abs })[t.value](v);
        }
        throw new Error(`Unbekannte Funktion: ${t.value}`);
      }
      if (t.type === '(') {
        pos++;
        const v = parseAdd();
        eat(')');
        return v;
      }
      throw new Error('Ungültiger Term');
    };
    const parsePow = () => {
      let left = parsePrimary();
      if (peek()?.type === '^') {
        pos++;
        left = Math.pow(left, parseUnary());
      }
      return left;
    };
    const parseUnary = () => {
      if (peek()?.type === '+') { pos++; return parseUnary(); }
      if (peek()?.type === '-') { pos++; return -parseUnary(); }
      return parsePow();
    };
    const parseMul = () => {
      let v = parseUnary();
      while (peek() && ['*', '/'].includes(peek().type)) {
        const op = tokens[pos++].type;
        const r = parseUnary();
        v = op === '*' ? v * r : v / r;
      }
      return v;
    };
    const parseAdd = () => {
      let v = parseMul();
      while (peek() && ['+', '-'].includes(peek().type)) {
        const op = tokens[pos++].type;
        const r = parseMul();
        v = op === '+' ? v + r : v - r;
      }
      return v;
    };
    const value = parseAdd();
    if (pos !== tokens.length) throw new Error('Term konnte nicht vollständig gelesen werden');
    return value;
  }

  function expressionEquivalent(a, b, tolerance = 1e-5) {
    let valid = 0;
    try {
      for (const x of sampleXs) {
        const av = evaluateExpression(a, x);
        const bv = evaluateExpression(b, x);
        if (!Number.isFinite(av) || !Number.isFinite(bv)) continue;
        valid++;
        if (!near(av, bv, tolerance)) return false;
      }
      return valid >= 4;
    } catch {
      return false;
    }
  }

  function parseNumber(raw) {
    const s = preprocessExpression(raw);
    try { return evaluateExpression(s, 0); } catch { return Number.NaN; }
  }

  function parseTuple(raw) {
    let s = String(raw ?? '').trim().replace(/−|–/g, '-');
    s = s.replace(/[\[\]{}()]/g, '').replace(/^[A-Za-z]\s*=?\s*/, '');

    // In deutschen Eingaben ist das Komma mehrdeutig: „1,5“ kann eine
    // Dezimalzahl sein, „1,5,3“ aber eine Komponentenliste. Bei klaren
    // Trennern (| oder ;) bleiben Dezimalkommas innerhalb der Komponenten
    // erhalten. Ohne klare Trenner werden Kommata als Listentrenner gelesen.
    let parts;
    if (/[|;]/.test(s)) {
      parts = s.split(/[|;]/).map(part => part.trim()).filter(Boolean);
    } else if (/\s+/.test(s) && !/[+\-*/^]/.test(s.replace(/^[-+]/, ''))) {
      parts = s.split(/\s+/).filter(Boolean);
    } else {
      parts = s.split(',').map(part => part.trim()).filter(Boolean);
    }

    return parts.map(part => parseNumber(part)).filter(Number.isFinite);
  }

  function parseSet(raw) {
    const vals = parseTuple(raw);
    return [...new Set(vals.map(v => Math.abs(v) < EPS ? 0 : v))].sort((a, b) => a - b);
  }

  function sameArray(a, b, tolerance = 1e-6) {
    return a.length === b.length && a.every((v, i) => near(v, b[i], tolerance));
  }

  function checkAnswer(task, user) {
    const raw = String(user ?? '').trim();
    if (!raw) return { correct: false, reason: 'empty' };
    if (task.type === 'choice' || task.answerKind === 'choice') {
      return { correct: raw.toUpperCase() === String(task.answer).toUpperCase(), reason: 'choice' };
    }
    if (task.answerKind === 'expression') {
      return { correct: expressionEquivalent(raw, task.answer), reason: 'expression' };
    }
    if (task.answerKind === 'set') {
      const expected = Array.isArray(task.answer) ? [...task.answer].sort((a, b) => a - b) : parseSet(task.answer);
      return { correct: sameArray(parseSet(raw), expected), reason: 'set' };
    }
    if (task.answerKind === 'vector' || task.answerKind === 'point') {
      const expected = Array.isArray(task.answer) ? task.answer : parseTuple(task.answer);
      return { correct: sameArray(parseTuple(raw), expected), reason: task.answerKind };
    }
    if (task.type === 'numeric' || task.answerKind === 'numeric') {
      return { correct: near(parseNumber(raw), Number(task.answer), task.tolerance || 1e-6), reason: 'numeric' };
    }
    const normalized = raw.toLowerCase().replace(/\s+/g, '').replace(/−/g, '-');
    const accepted = [task.answer, ...(task.accepted || [])].map(x => String(x).toLowerCase().replace(/\s+/g, '').replace(/−/g, '-'));
    if (accepted.includes(normalized)) return { correct: true, reason: 'text' };
    if (/x/.test(String(task.answer)) && expressionEquivalent(raw, task.answer)) return { correct: true, reason: 'expression-fallback' };
    return { correct: false, reason: 'text' };
  }

  function classifyError(task, user) {
    const raw = String(user ?? '').trim();
    const n = parseNumber(raw);
    if (!raw) return { type: 'Auslassung', title: 'Keine Antwort', repair: 'Schreibe zunächst bekannte Größen, gesuchte Größe und eine passende Formel auf.' };
    for (const m of task.mistakes || []) {
      if (m.kind === 'numeric' && near(n, m.value)) return { type: m.type, title: m.title, repair: m.repair };
      if (m.kind === 'expression' && expressionEquivalent(raw, m.value)) return { type: m.type, title: m.title, repair: m.repair };
      if (m.kind === 'text' && raw.toLowerCase().replace(/\s/g, '') === String(m.value).toLowerCase().replace(/\s/g, '')) return { type: m.type, title: m.title, repair: m.repair };
    }
    if (task.answerKind === 'expression') return { type: 'Verfahrensfehler', title: 'Der Term ist nicht äquivalent', repair: 'Prüfe jeden Summanden getrennt, dann Koeffizient und Exponent. Teste anschließend einen einfachen x-Wert.' };
    if (task.answerKind === 'set') return { type: 'Vollständigkeitsfehler', title: 'Lösungsmenge stimmt nicht vollständig', repair: 'Prüfe jeden Faktor bzw. jedes ± und sortiere die Lösungen.' };
    if (task.answerKind === 'vector' || task.answerKind === 'point') return { type: 'Koordinatenfehler', title: 'Mindestens eine Komponente stimmt nicht', repair: 'Rechne jede Koordinate separat und prüfe die Reihenfolge.' };
    return { type: 'Konzept oder Rechnung', title: 'Antwort weicht ab', repair: 'Vergleiche deinen ersten abweichenden Schritt mit der Musterlösung und benenne die dort verwendete Regel.' };
  }

  function restoreTex(value) {
    if (value == null) return value;
    let s = String(value)
      .replace(/\u000c/g, '\\f')
      .replace(/\u000b/g, '\\v')
      .replace(/\u0008/g, '\\b')
      .replace(/(^|[^\\])frac(?=\{|\d)/g, '$1\\frac')
      .replace(/(^|[^\\])sqrt(?=\{|\()/g, '$1\\sqrt')
      .replace(/(^|[^\\])cdot/g, '$1\\cdot')
      .replace(/(^|[^\\])Rightarrow/g, '$1\\Rightarrow')
      .replace(/(^|[^\\])mapsto/g, '$1\\mapsto')
      .replace(/(^|[^\\])pm(?=\d|\{|\$)/g, '$1\\pm')
      .replace(/(^|[^\\])vec(?=\s|[a-z])/g, '$1\\vec');
    return s;
  }

  function mathStep(value) {
    let s = restoreTex(value).trim();
    if (s.includes('\\(') || s.includes('\\[')) return s;
    const mathLike = /[=^]|\\(?:frac|sqrt|vec|begin|cdot|Rightarrow|mapsto|pm)|f['′″]?\s*\(/.test(s);
    if (!mathLike) return s;
    if (s.startsWith('(') && s.endsWith(')')) s = s.slice(1, -1);
    return `\\(${s}\\)`;
  }

  function finalizeTask(task) {
    const t = { ...task };
    t.prompt = restoreTex(t.prompt);
    t.explanation = restoreTex(t.explanation || '');
    t.hints = (t.hints || []).map(restoreTex);
    t.solutionSteps = (t.solutionSteps || []).map(mathStep);
    t.options = (t.options || []).map(restoreTex);
    return t;
  }

  const baseTask = (data) => finalizeTask({
    id: `GEN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'numeric', answerKind: 'numeric', accepted: [], options: [], tolerance: 1e-6,
    hints: [], solutionSteps: [], explanation: '', points: 2, difficulty: 2,
    masteryDimension: 'Verfahren',
    ...data
  });

  function genLinearEquation(difficulty = 2) {
    const x = nonZero(-9, 9);
    const a = nonZero(-8, 8);
    const b = randInt(-15, 15);
    const c = a * x + b;
    return baseTask({ lessonId: 'F0', skill: 'A19', title: 'Lineare Gleichung', prompt: `Löse ${latexPoly(`${a}x ${signed(b)} = ${c}`)}.`, answer: x,
      hints: ['Mache zuerst den konstanten Summanden rückgängig.', `Bringe den Term ${b >= 0 ? b : `−${Math.abs(b)}`} auf die andere Seite.`, `Teile zuletzt durch ${a}.`],
      solutionSteps: [`\(${a}x ${signed(b)}=${c}\)`, `\(${a}x=${c - b}\)`, `\(x=${x}\)`],
      explanation: `Durch die Gegenoperationen erhält man zuerst ${a}x=${c - b} und anschließend x=${x}.`,
      mistakes: [{ kind: 'numeric', value: c - b, type: 'Schritt zu früh beendet', title: 'Division vergessen', repair: `Nach ${a}x=${c-b} muss noch durch ${a} geteilt werden.` }]
    });
  }

  function genSimplify() {
    const a = nonZero(-8, 8), b = nonZero(-8, 8), c = nonZero(-10, 10);
    const sum = a + b;
    return baseTask({ lessonId: 'F0', skill: 'A2', title: 'Terme vereinfachen', type: 'text', answerKind: 'expression',
      prompt: `Vereinfache ${latexPoly(`${a}x ${signed(b)}x ${signed(c)}`)}.`, answer: `${sum}x${c >= 0 ? '+' : ''}${c}`,
      hints: ['Nur gleichartige x-Terme werden zusammengefasst.', `Addiere die Koeffizienten ${a} und ${b}.`, 'Der konstante Summand bleibt unverändert.'],
      solutionSteps: [`\((${a}${b >= 0 ? '+' : ''}${b})x ${signed(c)}\)`, `\(${sum}x ${signed(c)}\)`],
      explanation: `Die x-Koeffizienten ergeben ${sum}; der konstante Summand bleibt ${c}.`,
      mistakes: [{ kind: 'expression', value: `${a+b+c}x`, type: 'Strukturfehler', title: 'Konstante mit x-Term vermischt', repair: 'Konstante und x-Term sind nicht gleichartig.' }]
    });
  }

  function genQuadraticRoots() {
    let r1 = randInt(-7, 5), r2 = randInt(r1 + 1, 8);
    if (r1 === 0 && r2 === 0) r2 = 2;
    const p = -(r1 + r2), q = r1 * r2;
    return baseTask({ lessonId: 'F2', skill: 'A2', title: 'Quadratische Gleichung', type: 'text', answerKind: 'set',
      prompt: `Löse ${latexPoly(`x^2 ${signed(p)}x ${signed(q)} = 0`)} und gib beide Lösungen an.`, answer: [r1, r2],
      hints: ['Suche zwei Zahlen, deren Produkt q und deren Summe p ist.', `Gesucht sind Zahlen mit Produkt ${q} und Summe ${-p}.`, `Faktoren: (x ${signed(-r1)})(x ${signed(-r2)}).`],
      solutionSteps: [`\(x^2 ${signed(p)}x ${signed(q)}=(x${r1 >= 0 ? '-' : '+'}${Math.abs(r1)})(x${r2 >= 0 ? '-' : '+'}${Math.abs(r2)})\)`, `\(x_1=${r1},\;x_2=${r2}\)`],
      explanation: 'Nach dem Faktorisieren liefert die Nullproduktregel jede Nullstelle.',
      mistakes: [{ kind: 'numeric', value: r1 + r2, type: 'Faktorisierungsfehler', title: 'Summe statt Lösungen angegeben', repair: 'Die beiden Faktoren müssen jeweils nullgesetzt werden.' }]
    });
  }

  function genSlope() {
    const x1 = randInt(-5, 2), dx = choice([1, 2, 3, 4]);
    const m = nonZero(-5, 5), y1 = randInt(-7, 7);
    const x2 = x1 + dx, y2 = y1 + m * dx;
    return baseTask({ lessonId: 'F3', skill: 'A5', title: 'Steigung', prompt: `Bestimme die Steigung der Geraden durch \(A(${x1}|${y1})\) und \(B(${x2}|${y2})\).`, answer: m,
      hints: ['Nutze m=Δy/Δx.', `Δx=${x2}-${x1}=${dx}.`, `Δy=${y2}-${y1}=${m*dx}.`],
      solutionSteps: [`\(m=\frac{${y2}-${y1}}{${x2}-${x1}}\)`, `\(m=\frac{${m*dx}}{${dx}}=${m}\)`],
      explanation: `Die y-Änderung ${m*dx} geteilt durch die x-Änderung ${dx} ergibt ${m}.`,
      mistakes: [{ kind: 'numeric', value: 1/m, type: 'Quotient vertauscht', title: 'Δx/Δy statt Δy/Δx', repair: 'Steigung bedeutet vertikale Änderung geteilt durch horizontale Änderung.' }]
    });
  }

  function genFunctionValue() {
    const a = nonZero(-4, 4), b = randInt(-6, 6), c = randInt(-7, 7), x = randInt(-4, 4);
    const y = a*x*x+b*x+c;
    return baseTask({ lessonId: 'F1', skill: 'A19', title: 'Funktionswert', prompt: `Gegeben ist ${latexPoly(`f(x)=${a}x^2 ${signed(b)}x ${signed(c)}`)}. Berechne \(f(${x})\).`, answer: y,
      hints: [`Setze überall x=${x} ein.`, `Achte bei ${x < 0 ? 'der negativen Zahl' : 'der Potenz'} auf Klammern.`, `Berechne zuerst ${x}².`],
      solutionSteps: [`\(f(${x})=${a}\cdot(${x})^2 ${signed(b)}\cdot(${x}) ${signed(c)}\)`, `\(f(${x})=${y}\)`],
      explanation: 'Ein Funktionswert entsteht durch vollständiges Einsetzen der Eingabe in den Term.',
      mistakes: x < 0 ? [{ kind: 'numeric', value: -a*x*x+b*x+c, type: 'Vorzeichenfehler', title: 'Negative Zahl ohne Klammer quadriert', repair: `Schreibe (${x})²; das Quadrat ist positiv.` }] : []
    });
  }

  function genPowerProperty() {
    const n = choice([-4,-3,-2,2,3,4,5]);
    const even = Math.abs(n) % 2 === 0;
    const opts = shuffle([
      even ? 'achsensymmetrisch zur y-Achse' : 'punktsymmetrisch zum Ursprung',
      even ? 'punktsymmetrisch zum Ursprung' : 'achsensymmetrisch zur y-Achse',
      'weder achsen- noch punktsymmetrisch',
      'periodisch'
    ]);
    const correctText = even ? 'achsensymmetrisch zur y-Achse' : 'punktsymmetrisch zum Ursprung';
    const idx = opts.indexOf(correctText);
    return baseTask({ lessonId: 'A1', skill: 'A1', title: 'Potenzfunktion', type: 'choice', answerKind: 'choice',
      prompt: `Welche Symmetrie besitzt \(f(x)=x^{${n}}\)?`, options: opts, answer: String.fromCharCode(65 + idx),
      hints: ['Prüfe, ob der Exponent gerade oder ungerade ist.', even ? 'Gerade Potenzen erfüllen f(−x)=f(x).' : 'Ungerade Potenzen erfüllen f(−x)=−f(x).'],
      solutionSteps: [even ? '\\(f(-x)=(-x)^n=x^n=f(x)\\)' : '\\(f(-x)=(-x)^n=-x^n=-f(x)\\)'],
      explanation: `${n} ist ${even ? 'gerade' : 'ungerade'}; daraus folgt die entsprechende Symmetrie.`, masteryDimension: 'Verständnis'
    });
  }

  function genEndBehavior() {
    const degree = randInt(2, 6), a = nonZero(-5, 5);
    const even = degree % 2 === 0, positive = a > 0;
    let correct;
    if (even && positive) correct = 'beide Enden nach oben';
    if (even && !positive) correct = 'beide Enden nach unten';
    if (!even && positive) correct = 'links unten, rechts oben';
    if (!even && !positive) correct = 'links oben, rechts unten';
    const opts = shuffle(['beide Enden nach oben','beide Enden nach unten','links unten, rechts oben','links oben, rechts unten']);
    return baseTask({ lessonId: 'A2', skill: 'A1', title: 'Endverhalten', type: 'choice', answerKind: 'choice',
      prompt: `Wie verläuft der Graph für große \(|x|\), wenn der führende Term ${latexPoly(`${a}x^${degree}`)} ist?`, options: opts, answer: String.fromCharCode(65 + opts.indexOf(correct)),
      hints: ['Betrachte nur Grad und Vorzeichen des Leitkoeffizienten.', `${degree} ist ${even ? 'gerade' : 'ungerade'}.`, `Der Leitkoeffizient ist ${positive ? 'positiv' : 'negativ'}.`],
      solutionSteps: [`Grad ${degree}: ${even ? 'gleiche' : 'verschiedene'} Endrichtungen.`, `Vorzeichen ${positive ? '+' : '−'} entscheidet über die Orientierung.`],
      explanation: `Aus ${even ? 'geradem' : 'ungeradem'} Grad und ${positive ? 'positivem' : 'negativem'} Leitkoeffizienten folgt: ${correct}.`, masteryDimension: 'Verständnis'
    });
  }

  function genFactoredRoots() {
    const roots = shuffle([randInt(-6,-1), randInt(1,6), randInt(-3,3)]).slice(0,3);
    const unique = [...new Set(roots)];
    const factors = roots.map(r => `(x${r >= 0 ? '-' : '+'}${Math.abs(r)})`).join('');
    return baseTask({ lessonId: 'A3', skill: 'A2', title: 'Nullstellen aus Faktoren', type: 'text', answerKind: 'set',
      prompt: `Bestimme alle Nullstellen von ${latexPoly(`f(x)=${factors}`)}.`, answer: unique.sort((a,b)=>a-b),
      hints: ['Nutze die Nullproduktregel.', 'Setze jeden einzelnen Faktor gleich null.', 'Achte auf das Vorzeichen innerhalb der Klammer.'],
      solutionSteps: roots.map(r => `\(x${r >= 0 ? '-' : '+'}${Math.abs(r)}=0\Rightarrow x=${r}\)`),
      explanation: 'Jeder lineare Faktor liefert eine Nullstelle; doppelte Faktoren erzeugen keine zusätzliche x-Zahl.',
      mistakes: [{ kind: 'text', value: roots.map(r=>-r).join(','), type: 'Vorzeichenfehler', title: 'Klammerzeichen direkt übernommen', repair: 'Aus x−r=0 folgt x=r; das Vorzeichen beim Lösen kehrt sich um.' }]
    });
  }

  function genTransformation() {
    const c = nonZero(-5,5), d = nonZero(-5,5);
    const correct = `um ${Math.abs(c)} nach ${c > 0 ? 'rechts' : 'links'} und ${Math.abs(d)} nach ${d > 0 ? 'oben' : 'unten'}`;
    const opts = shuffle([
      correct,
      `um ${Math.abs(c)} nach ${c > 0 ? 'links' : 'rechts'} und ${Math.abs(d)} nach ${d > 0 ? 'oben' : 'unten'}`,
      `um ${Math.abs(c)} nach ${c > 0 ? 'rechts' : 'links'} und ${Math.abs(d)} nach ${d > 0 ? 'unten' : 'oben'}`,
      'nur gestreckt, nicht verschoben'
    ]);
    return baseTask({ lessonId: 'A4', skill: 'A4', title: 'Transformation', type: 'choice', answerKind: 'choice',
      prompt: `Wie wird der Graph von \(f\) zu \(g(x)=f(x${c > 0 ? '-' : '+'}${Math.abs(c)})${d > 0 ? '+' : '-'}${Math.abs(d)}\) verschoben?`, options: opts, answer: String.fromCharCode(65 + opts.indexOf(correct)),
      hints: ['Innen wirkt auf die x-Richtung mit umgekehrtem Vorzeichen.', 'Außen wirkt auf die y-Richtung mit gleichem Vorzeichen.'],
      solutionSteps: [`\(x${c > 0 ? '-' : '+'}${Math.abs(c)}\): ${c > 0 ? 'rechts' : 'links'}`, `${d > 0 ? '+' : '-'}${Math.abs(d)}: ${d > 0 ? 'oben' : 'unten'}`],
      explanation: correct, masteryDimension: 'Verständnis'
    });
  }

  function genSine() {
    const a = nonZero(-5,5), b = choice([0.5,1,2,3,4]), d = randInt(-4,4);
    const ask = choice(['amplitude','period','midline']);
    if (ask === 'amplitude') return baseTask({ lessonId:'A5',skill:'A3',title:'Sinusparameter',prompt:`Bestimme die Amplitude von \(f(x)=${a}\sin(${b}x)${d>=0?'+':''}${d}\).`,answer:Math.abs(a),hints:['Die Amplitude ist der Betrag des äußeren Faktors.'],solutionSteps:[`\(A=|${a}|=${Math.abs(a)}\)`],explanation:'Das Vorzeichen spiegelt nur; die Amplitude ist nicht negativ.',masteryDimension:'Verständnis'});
    if (ask === 'period') return baseTask({ lessonId:'A5',skill:'A3',title:'Sinusparameter',type:'text',answerKind:'numeric',prompt:`Bestimme die Periode von \(f(x)=${a}\sin(${b}x)${d>=0?'+':''}${d}\). Gib einen Dezimalwert an.`,answer:2*Math.PI/Math.abs(b),tolerance:0.005,hints:['Nutze T=2π/|b|.',`Hier ist b=${b}.`],solutionSteps:[`\(T=\frac{2\pi}{${b}}\approx ${(2*Math.PI/Math.abs(b)).toFixed(3)}\)`],explanation:'Der Innenfaktor skaliert die x-Achse umgekehrt.',masteryDimension:'Verfahren'});
    return baseTask({ lessonId:'A5',skill:'A3',title:'Sinusparameter',prompt:`Welche y-Koordinate hat die Mittellinie von \(f(x)=${a}\sin(${b}x)${d>=0?'+':''}${d}\)?`,answer:d,hints:['Die Mittellinie wird durch den äußeren Summanden d bestimmt.'],solutionSteps:[`\(y=d=${d}\)`],explanation:'Die vertikale Verschiebung ist zugleich die Mittellinie.',masteryDimension:'Verständnis'});
  }

  function genAverageRate() {
    const a = nonZero(-3,3), b = randInt(-5,5), c = randInt(-5,5);
    const x1 = randInt(-3,1), x2 = x1 + randInt(1,4);
    const f = x => a*x*x+b*x+c;
    const rate = (f(x2)-f(x1))/(x2-x1);
    return baseTask({ lessonId:'A6',skill:'A5',title:'Mittlere Änderungsrate',prompt:`Gegeben ist ${latexPoly(`f(x)=${a}x^2 ${signed(b)}x ${signed(c)}`)}. Bestimme die mittlere Änderungsrate im Intervall \([${x1};${x2}]\).`,answer:rate,
      hints:['Berechne zuerst beide Funktionswerte.','Bilde (f(x₂)−f(x₁))/(x₂−x₁).',`Der Nenner ist ${x2-x1}.`],
      solutionSteps:[`\(f(${x1})=${f(x1)},\;f(${x2})=${f(x2)}\)`,`\(\frac{${f(x2)}-${f(x1)}}{${x2}-${x1}}=${fmtNum(rate)}\)`],
      explanation:`Die durchschnittliche Änderung pro x-Einheit beträgt ${fmtNum(rate)}.`,
      mistakes:[{kind:'numeric',value:f(x2)-f(x1),type:'Quotient unvollständig',title:'Nur Δy berechnet',repair:'Eine Rate ist Δy geteilt durch Δx.'}]
    });
  }

  function genDerivative() {
    const count = randInt(2,4);
    const powers = shuffle([5,4,3,2,1,0]).slice(0,count).sort((a,b)=>b-a);
    const terms = powers.map(p => ({a:nonZero(-6,6),p}));
    const answer = polyString(derivativeTerms(terms));
    return baseTask({ lessonId:'A10',skill:'A13',title:'Polynom ableiten',type:'text',answerKind:'expression',
      prompt:`Leite ${latexPoly(`f(x)=${polyString(terms)}`)} ab.`,answer,
      hints:['Leite jeden Summanden getrennt ab.','Bei a·xⁿ wird der neue Faktor a·n.', 'Der Exponent sinkt um 1; Konstanten verschwinden.'],
      solutionSteps:terms.map(t => t.p===0 ? `\(${t.a}\mapsto0\)` : `\(${polyTerm(t.a,t.p)}\mapsto${polyTerm(t.a*t.p,t.p-1)}\)`).concat([`\(f'(x)=${answer.replace(/\^(-?\d+)/g,'^{$1}')}\\)`]),
      explanation:`Termweise abgeleitet ergibt sich f′(x)=${answer}.`,
      mistakes:[
        {kind:'expression',value:polyString(terms.map(t=>({a:t.a,p:Math.max(0,t.p-1)}))),type:'Regelfehler',title:'Exponent verringert, aber nicht multipliziert',repair:'Der alte Exponent wird zuerst zum Faktor.'},
        {kind:'expression',value:polyString(terms.map(t=>({a:t.a*t.p,p:t.p}))),type:'Regelfehler',title:'Exponent nicht verringert',repair:'Nach dem Multiplizieren muss n zu n−1 werden.'}
      ]
    });
  }

  function genTangent() {
    const a=nonZero(-3,3), b=randInt(-5,5), c=randInt(-6,6), x0=randInt(-3,3);
    const y0=a*x0*x0+b*x0+c, m=2*a*x0+b, intercept=y0-m*x0;
    const answer=cleanPoly(`${m}x ${signed(intercept)}`);
    return baseTask({lessonId:'A8',skill:'A9',title:'Tangente',type:'text',answerKind:'expression',prompt:`Bestimme den Funktionsterm der Tangente an ${latexPoly(`f(x)=${a}x^2 ${signed(b)}x ${signed(c)}`)} bei \\(x_0=${x0}\\).`,answer,
      hints:['Berechne zuerst f(x₀) und f′(x₀).','Die Tangente hat m=f′(x₀).','Setze in y−y₀=m(x−x₀) ein.'],
      solutionSteps:[`\\(f(${x0})=${y0}\\)`,`\\(f'(x)=${2*a}x ${signed(b)},\;m=f'(${x0})=${m}\\)`,`\\(y-${y0}=${m}(x-${x0})\\)`,`\\(y=${answer.replace(/\^(-?\d+)/g,'^{$1}')}\\)`],
      explanation:`Die Tangente geht durch (${x0}|${y0}) und besitzt die Steigung ${m}.`,
      mistakes:[{kind:'expression',value:`${y0}x${intercept>=0?'+':''}${intercept}`,type:'Konzeptfehler',title:'Funktionswert als Steigung verwendet',repair:'Die Steigung kommt aus f′(x₀), nicht aus f(x₀).'}]
    });
  }

  function genExtrema() {
    const a=choice([-2,-1,1,2]), r=randInt(1,4), d=randInt(-5,5);
    const terms=[{a,p:3},{a:-3*a*r*r,p:1},{a:d,p:0}];
    const left=-r,right=r;
    const correct=a>0?`Hochpunkt bei x=${left}, Tiefpunkt bei x=${right}`:`Tiefpunkt bei x=${left}, Hochpunkt bei x=${right}`;
    const opts=shuffle([correct,a>0?`Tiefpunkt bei x=${left}, Hochpunkt bei x=${right}`:`Hochpunkt bei x=${left}, Tiefpunkt bei x=${right}`,'beide sind Hochpunkte','es gibt keine Extrempunkte']);
    return baseTask({lessonId:'A11',skill:'A15',title:'Extrempunkte klassifizieren',type:'choice',answerKind:'choice',prompt:`Klassifiziere die kritischen Stellen von ${latexPoly(`f(x)=${polyString(terms)}`)}.`,options:opts,answer:String.fromCharCode(65+opts.indexOf(correct)),
      hints:['Bilde f′ und löse f′=0.','Hier lässt sich f′ als 3a(x²−r²) faktorisieren.','Nutze f″ oder den Vorzeichenwechsel.'],
      solutionSteps:[`\\(f'(x)=${3*a}x^2 ${signed(-3*a*r*r)}=${3*a}(x^2-${r*r})\)`,`\(x_1=${left},\;x_2=${right}\)`,`\(f''(x)=${6*a}x\)`],
      explanation:correct, masteryDimension:'Transfer'
    });
  }

  function genInflection() {
    const a=choice([-2,-1,1,2]), xw=randInt(-3,3), c=randInt(-5,5), d=randInt(-6,6);
    const b=-3*a*xw;
    const terms=[{a,p:3},{a:b,p:2},{a:c,p:1},{a:d,p:0}];
    const y=a*xw**3+b*xw**2+c*xw+d;
    return baseTask({lessonId:'A12',skill:'A16',title:'Wendepunkt',type:'text',answerKind:'point',prompt:`Bestimme den Wendepunkt von ${latexPoly(`f(x)=${polyString(terms)}`)}. Gib ihn als \((x|y)\) an.`,answer:[xw,y],
      hints:['Bilde die zweite Ableitung.','Löse f″(x)=0.','Setze die Wendestelle in f ein und prüfe den Krümmungswechsel.'],
      solutionSteps:[`\(f''(x)=${6*a}x ${signed(2*b)}\)`,`\(${6*a}x ${signed(2*b)}=0\Rightarrow x=${xw}\)`,`\(f(${xw})=${y}\)`,`\(W(${xw}|${y})\)`],
      explanation:`Die zweite Ableitung wechselt bei x=${xw} ihr Vorzeichen; der Wendepunkt ist W(${xw}|${y}).`, masteryDimension:'Transfer'
    });
  }

  function genVectorAdd() {
    const u=[nonZero(-5,5),randInt(-5,5),randInt(-5,5)],v=[randInt(-5,5),nonZero(-5,5),randInt(-5,5)];
    const ans=u.map((x,i)=>x+v[i]);
    return baseTask({lessonId:'G2',skill:'G4',title:'Vektoraddition',type:'text',answerKind:'vector',prompt:`Berechne ${vectorLatex(u)}+${vectorLatex(v)}.`,answer:ans,
      hints:['Addiere komponentenweise.','Erste mit erster, zweite mit zweiter, dritte mit dritter Komponente.'],
      solutionSteps:[`\(${vectorLatex(u).slice(2,-2)}+${vectorLatex(v).slice(2,-2)}=${vectorLatex(ans).slice(2,-2)}\)`],
      explanation:`Die Summe ist (${ans.join('|')}).`, mistakes:[{kind:'text',value:u.map((x,i)=>x-v[i]).join(','),type:'Operationsfehler',title:'Subtrahiert statt addiert',repair:'Das Pluszeichen gilt für jede Komponente.'}]
    });
  }

  function genVectorLength() {
    const triples=choice([[3,4,0],[1,2,2],[2,3,6],[4,4,7],[2,6,9]]);
    const signs=triples.map(n=>n*(Math.random()<.5?-1:1));
    const len=Math.sqrt(signs.reduce((s,n)=>s+n*n,0));
    return baseTask({lessonId:'G2',skill:'G5',title:'Vektorlänge',prompt:`Bestimme die Länge von ${vectorLatex(signs)}.`,answer:len,
      hints:['Quadriere alle Komponenten.','Addiere die Quadrate.','Ziehe zuletzt die Wurzel.'],
      solutionSteps:[`\(|\vec v|=\sqrt{${signs.map(n=>`(${n})^2`).join('+')}}\)`,`\(|\vec v|=\sqrt{${signs.reduce((s,n)=>s+n*n,0)}}=${fmtNum(len)}\)`],
      explanation:'Vorzeichen verschwinden beim Quadrieren; die Länge ist nie negativ.'
    });
  }

  function genMidpoint() {
    const m=[randInt(-4,4),randInt(-4,4),randInt(-4,4)], delta=[randInt(1,4),nonZero(-4,4),randInt(0,4)];
    const A=m.map((x,i)=>x-delta[i]), B=m.map((x,i)=>x+delta[i]);
    return baseTask({lessonId:'G3',skill:'G6',title:'Mittelpunkt',type:'text',answerKind:'point',prompt:`Bestimme den Mittelpunkt der Strecke mit \(A(${A.join('|')})\) und \(B(${B.join('|')})\).`,answer:m,
      hints:['Mittle jede Koordinate separat.','Addiere die jeweiligen Koordinaten und teile durch 2.'],
      solutionSteps:[`\(M=\frac12(A+B)\)`,`\(M(${m.join('|')})\)`],
      explanation:`Der Mittelpunkt ist M(${m.join('|')}).`
    });
  }

  function genPointOnLine() {
    const S=[randInt(-4,4),randInt(-4,4),randInt(-4,4)],v=[nonZero(-3,3),nonZero(-3,3),nonZero(-3,3)],t=randInt(-3,3);
    const P=S.map((x,i)=>x+t*v[i]);
    const bad=[P[0],P[1]+1,P[2]];
    const correct=`P(${P.join('|')}) liegt auf g`;
    const opts=shuffle([correct,`P(${bad.join('|')}) liegt auf g`,'beide Punkte liegen auf g','keiner der Punkte liegt auf g']);
    return baseTask({lessonId:'G4',skill:'G10',title:'Punktprobe',type:'choice',answerKind:'choice',prompt:`Gegeben ist \(g:\vec x=${vectorLatex(S)}+r\cdot${vectorLatex(v)}\). Welche Aussage ist korrekt?`,options:opts,answer:String.fromCharCode(65+opts.indexOf(correct)),
      hints:['Setze die Punktkoordinaten komponentenweise ein.','In allen drei Gleichungen muss derselbe Parameterwert entstehen.',`Der konstruierte Parameter ist r=${t}.`],
      solutionSteps:[`\(${vectorLatex(S)}+${t}\cdot${vectorLatex(v)}=${vectorLatex(P)}\)`],
      explanation:`Für P entsteht in jeder Komponente r=${t}; der andere Punkt verletzt mindestens eine Komponente.`
    });
  }

  function genLineIntersection() {
    const S=[randInt(-4,1),randInt(-4,4)],v=[nonZero(-3,3),nonZero(-3,3)],r=randInt(-2,3);
    const P=S.map((x,i)=>x+r*v[i]);
    const w=[nonZero(-3,3),nonZero(-3,3)],s=randInt(-2,3);
    const T=P.map((x,i)=>x-s*w[i]);
    return baseTask({lessonId:'G5',skill:'G11',title:'Geradenschnitt',type:'text',answerKind:'point',prompt:`Bestimme den Schnittpunkt von \(g:\vec x=${vectorLatex(S)}+r${vectorLatex(v)}\) und \(h:\vec x=${vectorLatex(T)}+s${vectorLatex(w)}\) im zweidimensionalen Raum.`,answer:P,
      hints:['Setze beide Geraden komponentenweise gleich.','Löse das LGS nach r und s.','Setze einen Parameter in seine Gerade ein.'],
      solutionSteps:[`\(${S[0]}+${v[0]}r=${T[0]}+${w[0]}s\)`,`\(${S[1]}+${v[1]}r=${T[1]}+${w[1]}s\)`,`\(r=${r},\;s=${s}\)`,`\(S(${P.join('|')})\)`],
      explanation:`Beide Geraden erreichen für r=${r} und s=${s} den Punkt (${P.join('|')}).`
    });
  }


  function genSymmetry() {
    const kind = choice(['even', 'odd', 'none']);
    let term, correct, proof;
    if (kind === 'even') {
      const a = nonZero(-4, 4), b = nonZero(-6, 6), c = randInt(-5, 5);
      term = `${a}x^4 ${signed(b)}x^2 ${signed(c)}`;
      correct = 'achsensymmetrisch zur y-Achse';
      proof = 'Nur gerade Exponenten und eine Konstante: f(−x)=f(x).';
    } else if (kind === 'odd') {
      const a = nonZero(-3, 3), b = nonZero(-5, 5), c = nonZero(-6, 6);
      term = `${a}x^5 ${signed(b)}x^3 ${signed(c)}x`;
      correct = 'punktsymmetrisch zum Ursprung';
      proof = 'Nur ungerade Exponenten ohne Konstante: f(−x)=−f(x).';
    } else {
      const a = nonZero(-3, 3), b = nonZero(-5, 5), c = randInt(-5, 5);
      term = `${a}x^3 ${signed(b)}x^2 ${signed(c)}`;
      correct = 'keine der beiden Standardsymmetrien';
      proof = 'Gerade und ungerade Potenzen treten gemeinsam auf; beide Symmetrietests scheitern.';
    }
    const options = shuffle(['achsensymmetrisch zur y-Achse', 'punktsymmetrisch zum Ursprung', 'keine der beiden Standardsymmetrien', 'achsensymmetrisch zur x-Achse']);
    return baseTask({ lessonId:'A2', skill:'A1', title:'Symmetrieprüfung', type:'choice', answerKind:'choice',
      prompt:`Untersuche ${latexPoly(`f(x)=${term}`)} auf Symmetrie.`, options, answer:String.fromCharCode(65 + options.indexOf(correct)),
      hints:['Bilde gedanklich f(−x).','Vergleiche f(−x) zuerst mit f(x), dann mit −f(x).','Achte auf gerade und ungerade Exponenten sowie den konstanten Summanden.'],
      solutionSteps:[`\\(f(-x)\\) bilden`, proof], explanation:proof, masteryDimension:'Verständnis'
    });
  }

  function genDifferenceQuotient() {
    const a = nonZero(-4,4), b = randInt(-6,6), c = randInt(-5,5);
    const x0 = randInt(-3,3), h = choice([-2,-1,1,2]);
    const f = x => a*x*x+b*x+c;
    const numerator = f(x0+h)-f(x0);
    const result = numerator/h;
    return baseTask({ lessonId:'A7', skill:'A7', title:'Differenzenquotient',
      prompt:`Gegeben ist ${latexPoly(`f(x)=${a}x^2 ${signed(b)}x ${signed(c)}`)}. Berechne \\(\\frac{f(${x0+h})-f(${x0})}{${h}}\\).`, answer:result,
      hints:['Berechne beide Funktionswerte getrennt.','Bilde danach die Differenz im Zähler.',`Teile zuletzt durch h=${h}.`],
      solutionSteps:[`\\(f(${x0+h})=${f(x0+h)}\\)`,`\\(f(${x0})=${f(x0)}\\)`,`\\(\\frac{${f(x0+h)}-${f(x0)}}{${h}}=${fmtNum(result)}\\)`],
      explanation:`Der Differenzenquotient misst die mittlere Änderung auf dem kleinen Intervall von ${x0} bis ${x0+h}.`,
      mistakes:[{kind:'numeric',value:numerator,type:'Schritt zu früh beendet',title:'Division durch h vergessen',repair:'Der Zähler ist nur die Funktionsänderung Δy; für die Rate muss noch durch Δx=h geteilt werden.'}]
    });
  }

  function genNormalSlope() {
    let a,b,x0,m;
    do { a=nonZero(-4,4); b=randInt(-6,6); x0=randInt(-3,3); m=2*a*x0+b; } while (m===0);
    const c=randInt(-5,5), normal=-1/m;
    return baseTask({ lessonId:'A8', skill:'A9', title:'Normalensteigung',
      prompt:`Gegeben ist ${latexPoly(`f(x)=${a}x^2 ${signed(b)}x ${signed(c)}`)}. Bestimme die Steigung der Normalen an der Stelle \\(x_0=${x0}\\).`, answer:normal,
      hints:['Bestimme zuerst f′(x).',`Berechne die Tangentensteigung f′(${x0}).`,'Für senkrechte Geraden gilt mₜ·mₙ=−1.'],
      solutionSteps:[`\\(f'(x)=${2*a}x ${signed(b)}\\)`,`\\(m_t=f'(${x0})=${m}\\)`,`\\(m_n=-\\frac{1}{${m}}=${fraction(-1,m)}\\)`],
      explanation:`Die Normale steht senkrecht auf der Tangente; deshalb ist ihre Steigung der negative Kehrwert ${fraction(-1,m)}.`,
      mistakes:[{kind:'numeric',value:1/m,type:'Vorzeichenfehler',title:'Kehrwert ohne Minus',repair:'Senkrechte Steigungen erfüllen mₜ·mₙ=−1, nicht +1.'},{kind:'numeric',value:m,type:'Konzeptfehler',title:'Tangenten- statt Normalensteigung',repair:'Nach f′(x₀) musst du noch den negativen Kehrwert bilden.'}]
    });
  }

  function genMonotonicity() {
    const r1=randInt(-5,-1), r2=randInt(1,5), k=choice([-3,-2,-1,1,2,3]);
    const positiveOutside=k>0;
    const correct = positiveOutside
      ? `steigend für x<${r1} und x>${r2}, fallend dazwischen`
      : `fallend für x<${r1} und x>${r2}, steigend dazwischen`;
    const options=shuffle([
      correct,
      positiveOutside ? `fallend für x<${r1} und x>${r2}, steigend dazwischen` : `steigend für x<${r1} und x>${r2}, fallend dazwischen`,
      'überall steigend', 'überall fallend'
    ]);
    return baseTask({lessonId:'A11',skill:'A12',title:'Monotonie aus f′',type:'choice',answerKind:'choice',
      prompt:`Für eine Funktion gilt ${latexPoly(`f'(x)=${k}(x${r1>=0?'-':'+'}${Math.abs(r1)})(x${r2>=0?'-':'+'}${Math.abs(r2)})`)}. Welche Monotonieaussage stimmt?`,
      options,answer:String.fromCharCode(65+options.indexOf(correct)),
      hints:['Markiere die Nullstellen von f′ auf einer Zahlengeraden.','Prüfe das Vorzeichen in jedem der drei Intervalle.',`Der Vorfaktor ${k} ${k>0?'erhält':'kehrt'} das Faktorvorzeichen ${k>0?'':'um'}.`],
      solutionSteps:[`\\(f'(x)=0\\Rightarrow x=${r1},${r2}\\)`,'Vorzeichentabelle für die drei Intervalle erstellen',correct],
      explanation:`Aus dem Vorzeichen von f′ folgt direkt: ${correct}.`,masteryDimension:'Transfer'
    });
  }

  function genScalarVector() {
    const v=[nonZero(-5,5),randInt(-5,5),randInt(-5,5)], k=nonZero(-4,4);
    const result=v.map(x=>k*x);
    const vb=vectorLatex(v).replace(/^\\\(|\\\)$/g,''), rb=vectorLatex(result).replace(/^\\\(|\\\)$/g,'');
    return baseTask({lessonId:'G2',skill:'G4',title:'Skalarmultiplikation',type:'text',answerKind:'vector',
      prompt:`Berechne \\(${k}\\cdot ${vb}\\).`,answer:result,
      hints:['Multipliziere jede Komponente mit demselben Skalar.',`Beginne mit ${k}·${v[0]}.`,'Prüfe besonders negative Vorzeichen.'],
      solutionSteps:[`\\(${k}\\cdot ${vb}=${rb}\\)`],
      explanation:'Bei der Skalarmultiplikation wird jede Vektorkomponente mit demselben Faktor multipliziert.'
    });
  }

  function genCollinearity() {
    const u=[nonZero(-4,4),nonZero(-4,4),nonZero(-4,4)], k=choice([-3,-2,2,3]);
    const isCollinear=Math.random()<0.5;
    const v=u.map(x=>k*x); if(!isCollinear)v[randInt(0,2)]+=choice([-2,-1,1,2]);
    const correct=isCollinear?'ja, ein gemeinsamer Faktor existiert':'nein, die Komponentenverhältnisse sind nicht gleich';
    const options=shuffle(['ja, ein gemeinsamer Faktor existiert','nein, die Komponentenverhältnisse sind nicht gleich','ja, weil beide Vektoren drei Komponenten besitzen','nein, weil negative Zahlen vorkommen']);
    return baseTask({lessonId:'G2',skill:'G5',title:'Kollinearität',type:'choice',answerKind:'choice',
      prompt:`Sind ${vectorLatex(u)} und ${vectorLatex(v)} kollinear?`,options,answer:String.fromCharCode(65+options.indexOf(correct)),
      hints:['Suche einen einzigen Faktor k für alle Komponenten.','Vergleiche nicht nur eine Komponente.','Ein Vorzeichenwechsel ist erlaubt, wenn er überall durch denselben Faktor entsteht.'],
      solutionSteps:[isCollinear?`${vectorLatex(v)}=${k}\\cdot${vectorLatex(u)}`:'Die Komponenten liefern keinen einheitlichen Faktor.'],
      explanation:correct,masteryDimension:'Verständnis'
    });
  }

  function genLinePosition() {
    const type=choice(['parallel','identical','intersect','skew']);
    let S,T,v,w,correct,explanation;
    if(type==='identical'){
      S=[randInt(-3,3),randInt(-3,3),randInt(-3,3)];v=[nonZero(-3,3),nonZero(-3,3),nonZero(-3,3)];const q=randInt(-3,3);T=S.map((x,i)=>x+q*v[i]);w=v.map(x=>-2*x);correct='identisch';explanation='Die Richtungen sind parallel und der Stützpunkt der zweiten Gerade liegt auf der ersten.';
    }else if(type==='parallel'){
      S=[0,0,0];v=[1,2,1];T=[0,1,0];w=[-2,-4,-2];correct='echt parallel';explanation='Die Richtungsvektoren sind Vielfache, aber T liegt nicht auf g.';
    }else if(type==='intersect'){
      const P=[randInt(-3,3),randInt(-3,3),randInt(-3,3)],r=randInt(-2,2),q=randInt(-2,2);v=[1,2,-1];w=[2,-1,1];S=P.map((x,i)=>x-r*v[i]);T=P.map((x,i)=>x-q*w[i]);correct='schneidend';explanation=`Beide Geraden erreichen den Punkt (${P.join('|')}) für passende Parameter.`;
    }else{
      S=[0,0,0];v=[1,0,0];T=[0,1,1];w=[0,1,0];correct='windschief';explanation='Die Richtungen sind nicht parallel; die z-Koordinate verhindert jedoch einen gemeinsamen Punkt.';
    }
    const line=(name,A,d)=>`${name}:\\vec x=${vectorLatex(A).replace(/^\\\(|\\\)$/g,'')}+t${vectorLatex(d).replace(/^\\\(|\\\)$/g,'')}`;
    const options=shuffle(['identisch','echt parallel','schneidend','windschief']);
    return baseTask({lessonId:'G5',skill:'G9',title:'Lagebeziehung',type:'choice',answerKind:'choice',
      prompt:`Bestimme die Lagebeziehung von \\(${line('g',S,v)}\\) und \\(${line('h',T,w).replace('+t','+s')}\\).`,options,answer:String.fromCharCode(65+options.indexOf(correct)),
      hints:['Prüfe zuerst, ob die Richtungsvektoren Vielfache sind.','Sind sie nicht parallel, löse die Koordinatengleichungen.','Ein Widerspruch bei nicht parallelen Geraden bedeutet im Raum: windschief.'],
      solutionSteps:['Richtungsvektoren vergleichen','gegebenenfalls Stützpunktprobe oder LGS durchführen',explanation],explanation,masteryDimension:'Transfer'
    });
  }

  const generators = {
    linear: genLinearEquation,
    simplify: genSimplify,
    quadratic: genQuadraticRoots,
    slope: genSlope,
    functionValue: genFunctionValue,
    power: genPowerProperty,
    endBehavior: genEndBehavior,
    roots: genFactoredRoots,
    transform: genTransformation,
    sine: genSine,
    averageRate: genAverageRate,
    derivative: genDerivative,
    tangent: genTangent,
    extrema: genExtrema,
    inflection: genInflection,
    vectorAdd: genVectorAdd,
    vectorLength: genVectorLength,
    midpoint: genMidpoint,
    pointOnLine: genPointOnLine,
    lineIntersection: genLineIntersection,
    symmetry: genSymmetry,
    differenceQuotient: genDifferenceQuotient,
    normalSlope: genNormalSlope,
    monotonicity: genMonotonicity,
    scalarVector: genScalarVector,
    collinearity: genCollinearity,
    linePosition: genLinePosition
  };

  const generatorCatalog = [
    ['linear','F0','Lineare Gleichungen'],['simplify','F0','Terme vereinfachen'],['quadratic','F2','Quadratische Gleichungen'],['slope','F3','Steigungen'],
    ['functionValue','F1','Funktionswerte'],['power','A1','Potenzfunktionen'],['endBehavior','A2','Endverhalten'],['roots','A3','Nullstellen'],
    ['transform','A4','Transformationen'],['sine','A5','Sinusparameter'],['averageRate','A6','Mittlere Änderungsrate'],['derivative','A10','Ableitungen'],
    ['tangent','A8','Tangenten'],['extrema','A11','Extrempunkte'],['inflection','A12','Wendepunkte'],['vectorAdd','G2','Vektoroperationen'],
    ['vectorLength','G2','Vektorlängen'],['midpoint','G3','Mittelpunkte'],['pointOnLine','G4','Punktproben'],['lineIntersection','G5','Geradenschnitte'],
    ['symmetry','A2','Symmetrieprüfungen'],['differenceQuotient','A7','Differenzenquotienten'],['normalSlope','A8','Normalensteigungen'],['monotonicity','A11','Monotonie aus f′'],
    ['scalarVector','G2','Skalarmultiplikation'],['collinearity','G2','Kollinearität'],['linePosition','G5','Lagebeziehungen']
  ];

  function generate(id, difficulty = 2) {
    const fn = generators[id] || genDerivative;
    return fn(difficulty);
  }

  function generateMixed(count = 10, preferredLessons = []) {
    const candidates = generatorCatalog.filter(x => !preferredLessons.length || preferredLessons.includes(x[1]));
    const pool = candidates.length ? candidates : generatorCatalog;
    return Array.from({ length: count }, () => generate(choice(pool)[0]));
  }

  function derivativeCoach() {
    const task = genDerivative();
    const x0 = randInt(-3,3);
    const val = evaluateExpression(task.answer, x0);
    const coach = {
      id:`COACH-D-${Date.now()}`, type:'derivative', title:'Ableitungs-Coach', lessonId:'A10', intro:'Du wirst nicht direkt nach dem Endergebnis gefragt. Jede Entscheidung wird einzeln geprüft.',
      context:task.prompt,
      steps:[
        {id:'rule',title:'1 · Regel auswählen',prompt:'Welche Strategie passt?',type:'choice',options:['jeden Summanden mit Potenz-, Faktor- und Summenregel ableiten','den gesamten Term nur durch x teilen','alle Exponenten addieren','nur den größten Summanden ableiten'],answer:'A',answerKind:'choice',explanation:'Ein Polynom wird termweise abgeleitet.'},
        {id:'derivative',title:'2 · Ableitung bilden',prompt:'Gib den vollständigen Term \\(f′(x)\\) an.',type:'text',answer:task.answer,answerKind:'expression',hints:task.hints,solutionSteps:task.solutionSteps,explanation:task.explanation},
        {id:'value',title:'3 · Lokale Rate berechnen',prompt:`Berechne \(f′(${x0})\).`,type:'numeric',answer:val,answerKind:'numeric',hints:[`Setze x=${x0} in deine Ableitung ein.`],solutionSteps:[`\(f'(${x0})=${fmtNum(val)}\\)`],explanation:`Die lokale Änderungsrate bei x=${x0} ist ${fmtNum(val)}.`},
        {id:'explain',title:'4 · Warum erklären',prompt:'Erkläre in mindestens einem vollständigen Satz, warum ein konstanter Summand beim Ableiten verschwindet.',type:'explain',keywords:['konstant','änder','steigung','null'],minLength:35,explanation:'Eine Konstante ändert sich nicht; ihre lokale Änderungsrate und damit ihre Ableitung ist 0.'}
      ]
    };
    coach.steps = coach.steps.map(finalizeTask);
    coach.context = restoreTex(coach.context);
    return coach;
  }

  function curveCoach() {
    const a=choice([-2,-1,1,2]),r=randInt(1,3),d=randInt(-4,4);
    const terms=[{a,p:3},{a:-3*a*r*r,p:1},{a:d,p:0}];
    const f=polyString(terms),fp=polyString(derivativeTerms(terms)),fpp=`${6*a}x`;
    const x1=-r,x2=r,y1=evaluateExpression(f,x1),y2=evaluateExpression(f,x2),yw=evaluateExpression(f,0);
    const classText=a>0?'bei x=−r Hochpunkt, bei x=r Tiefpunkt':'bei x=−r Tiefpunkt, bei x=r Hochpunkt';
    const opts=shuffle([classText,a>0?'bei x=−r Tiefpunkt, bei x=r Hochpunkt':'bei x=−r Hochpunkt, bei x=r Tiefpunkt','beide Tiefpunkte','keine Extrempunkte']);
    const coach = {
      id:`COACH-C-${Date.now()}`,type:'curve',title:'Kurvendiskussions-Mission',lessonId:'A13',intro:'Eine komplette Funktionsuntersuchung wird in kontrollierbare Teilentscheidungen zerlegt.',
      context:`Untersuche ${latexPoly(`f(x)=${f}`)}.`,
      summary:{f,fp,fpp,r,a,d},
      steps:[
        {id:'fp',title:'1 · Erste Ableitung',prompt:'Bestimme \(f′(x)\).',type:'text',answer:fp,answerKind:'expression',hints:['Leite termweise ab.','Die Konstante verschwindet.'],solutionSteps:[`\\(f'(x)=${fp.replace(/\^(-?\d+)/g,'^{$1}')}\)`],explanation:`f′(x)=${fp}.`},
        {id:'crit',title:'2 · Kritische Stellen',prompt:'Löse \\(f′(x)=0\\) und gib die x-Werte an.',type:'text',answer:[x1,x2],answerKind:'set',hints:['Klammere den gemeinsamen Faktor aus.',`Nutze x²=${r*r}.`],solutionSteps:[`\(${3*a}(x^2-${r*r})=0\)`,`\(x=\pm${r}\)`],explanation:`Die kritischen Stellen sind x=${x1} und x=${x2}.`},
        {id:'class',title:'3 · Extrema klassifizieren',prompt:'Welche Klassifikation ist korrekt?',type:'choice',options:opts,answer:String.fromCharCode(65+opts.indexOf(classText)),answerKind:'choice',hints:['Nutze f″(x)=6ax.','Setze beide kritischen Stellen in f″ ein.'],solutionSteps:[`\(f''(x)=${fpp}\)`,classText],explanation:`${classText}; die Punkte lauten (${x1}|${y1}) und (${x2}|${y2}).`},
        {id:'fpp',title:'4 · Zweite Ableitung',prompt:'Bestimme \\(f″(x)\\).',type:'text',answer:fpp,answerKind:'expression',hints:['Leite f′ ein zweites Mal ab.'],solutionSteps:[`\(f''(x)=${fpp}\)`],explanation:`f″(x)=${fpp}.`},
        {id:'wend',title:'5 · Wendepunkt',prompt:'Gib den Wendepunkt als \\((x|y)\\) an.',type:'text',answer:[0,yw],answerKind:'point',hints:['Löse f″(x)=0.','Setze die Wendestelle in f ein.'],solutionSteps:["\\(f''(x)=0\\Rightarrow x=0\\)",`\(f(0)=${yw}\)`,`\(W(0|${yw})\)`],explanation:`Der Wendepunkt ist W(0|${yw}).`},
        {id:'explain',title:'6 · Konsistenz erklären',prompt:'Erkläre, wie die Vorzeichen von f′ zu den gefundenen Extrempunkten passen.',type:'explain',keywords:['positiv','negativ','steig','fall','wechsel'],minLength:50,explanation:'An einem Hochpunkt wechselt f′ von positiv zu negativ; an einem Tiefpunkt von negativ zu positiv.'}
      ]
    };
    coach.steps = coach.steps.map(finalizeTask);
    coach.context = restoreTex(coach.context);
    return coach;
  }


  function rootsCoach() {
    const r1=randInt(-6,-1), r2=randInt(1,7), p=-(r1+r2), q=r1*r2;
    const polynomial=`x^2 ${signed(p)}x ${signed(q)}`;
    const factor=`(x${r1>=0?'-':'+'}${Math.abs(r1)})(x${r2>=0?'-':'+'}${Math.abs(r2)})`;
    const options=shuffle(['faktorisieren und Nullproduktregel nutzen','nur durch x teilen','direkt ableiten','eine Wertetabelle ohne Gleichung erstellen']);
    const coach={id:`COACH-R-${Date.now()}`,type:'roots',title:'Nullstellen-Coach',lessonId:'A3',intro:'Von der Strukturentscheidung bis zur vollständigen Lösungsmenge wird jeder Schritt einzeln geprüft.',
      context:`Löse ${latexPoly(`${polynomial}=0`)}.`,steps:[
        {id:'method',title:'1 · Methode erkennen',prompt:'Welche Strategie ist hier am effizientesten?',type:'choice',options,answer:String.fromCharCode(65+options.indexOf('faktorisieren und Nullproduktregel nutzen')),answerKind:'choice',explanation:'Die Gleichung wurde mit ganzzahligen Nullstellen konstruiert und lässt sich direkt faktorisieren.'},
        {id:'factor',title:'2 · Faktorisieren',prompt:'Gib die linke Seite als Produkt zweier linearer Faktoren an.',type:'text',answer:factor,answerKind:'expression',hints:['Suche zwei Zahlen mit Produkt q und Summe p.',`Produkt ${q}, Summe ${-p}.`],solutionSteps:[`\\(${polynomial}=${factor}\\)`],explanation:'Die Faktoren werden so gewählt, dass ihre Nullstellen die gesuchten Lösungen sind.'},
        {id:'roots',title:'3 · Nullproduktregel',prompt:'Gib die vollständige Lösungsmenge an.',type:'text',answer:[r1,r2],answerKind:'set',hints:['Setze jeden Faktor einzeln gleich null.','Achte beim Auflösen der Klammern auf das Vorzeichen.'],solutionSteps:[`\\(x${r1>=0?'-':'+'}${Math.abs(r1)}=0\\Rightarrow x=${r1}\\)`,`\\(x${r2>=0?'-':'+'}${Math.abs(r2)}=0\\Rightarrow x=${r2}\\)`],explanation:`Die Lösungen sind ${r1} und ${r2}.`},
        {id:'explain',title:'4 · Vollständigkeit erklären',prompt:'Erkläre, warum das Produkt genau dann null ist, wenn mindestens ein Faktor null ist.',type:'explain',keywords:['produkt','faktor','null','nullprodukt'],minLength:45,explanation:'Die Nullproduktregel sichert, dass jeder lineare Faktor eine Lösung liefert und keine weitere Lösung übersehen wird.'}
      ]};
    coach.steps=coach.steps.map(finalizeTask);coach.context=restoreTex(coach.context);return coach;
  }

  function rateCoach() {
    const a=nonZero(-4,4),b=randInt(-6,6),c=randInt(-5,5),x1=randInt(-4,1),dx=choice([1,2,3,4]),x2=x1+dx;
    const f=x=>a*x*x+b*x+c,y1=f(x1),y2=f(x2),dy=y2-y1,rate=dy/dx;
    const options=shuffle(['mittlere Änderungsrate auf einem Intervall','lokale Änderungsrate an genau einer Stelle','Nullstelle der Funktion','Flächeninhalt unter dem Graphen']);
    const coach={id:`COACH-M-${Date.now()}`,type:'rate',title:'Änderungsraten-Coach',lessonId:'A6',intro:'Du trennst Funktionsänderung, Intervalländerung, Quotient und Bedeutung im Kontext.',
      context:`Für ${latexPoly(`f(x)=${a}x^2 ${signed(b)}x ${signed(c)}`)} soll die Änderung auf \\([${x1};${x2}]\\) untersucht werden.`,steps:[
        {id:'concept',title:'1 · Größe identifizieren',prompt:'Welche mathematische Größe ist gefragt?',type:'choice',options,answer:String.fromCharCode(65+options.indexOf('mittlere Änderungsrate auf einem Intervall')),answerKind:'choice',explanation:'Zwei verschiedene x-Stellen definieren ein Intervall und damit eine mittlere Änderungsrate.'},
        {id:'dy',title:'2 · Funktionsänderung',prompt:'Berechne \\(\\Delta y=f(x_2)-f(x_1)\\).',type:'numeric',answer:dy,answerKind:'numeric',hints:[`Berechne f(${x2}) und f(${x1}) getrennt.`,`f(${x2})=${y2}, f(${x1})=${y1}.`],solutionSteps:[`\\(\\Delta y=${y2}-${y1}=${dy}\\)`],explanation:'Δy beschreibt nur die Änderung des Funktionswertes, noch nicht die Rate.'},
        {id:'rate',title:'3 · Änderungsrate',prompt:'Berechne den vollständigen Differenzenquotienten.',type:'numeric',answer:rate,answerKind:'numeric',hints:[`\\(\\Delta x=${x2}-${x1}=${dx}\\)`,'Teile Δy durch Δx.'],solutionSteps:[`\\(\\frac{\\Delta y}{\\Delta x}=\\frac{${dy}}{${dx}}=${fmtNum(rate)}\\)`],explanation:`Die mittlere Änderungsrate beträgt ${fmtNum(rate)} Funktionswerteinheiten pro x-Einheit.`},
        {id:'explain',title:'4 · Bedeutung erklären',prompt:'Erkläre in einem vollständigen Satz, was der berechnete Quotient geometrisch bedeutet.',type:'explain',keywords:['sekante','steigung','intervall','mittlere'],minLength:45,explanation:'Der Quotient ist die Steigung der Sekante durch die beiden Graphenpunkte und beschreibt die mittlere Änderung auf dem Intervall.'}
      ]};
    coach.steps=coach.steps.map(finalizeTask);coach.context=restoreTex(coach.context);return coach;
  }

  function lineCoach() {
    const P=[randInt(-4,4),randInt(-4,4),randInt(-4,4)],r=randInt(-3,3),s=randInt(-3,3),v=[1,2,-1],w=[2,-1,1];
    const A=P.map((x,i)=>x-r*v[i]),B=P.map((x,i)=>x-s*w[i]);
    const g=`\\vec x=${vectorLatex(A).replace(/^\\\(|\\\)$/g,'')}+r${vectorLatex(v).replace(/^\\\(|\\\)$/g,'')}`;
    const h=`\\vec x=${vectorLatex(B).replace(/^\\\(|\\\)$/g,'')}+s${vectorLatex(w).replace(/^\\\(|\\\)$/g,'')}`;
    const options=shuffle(['Koordinaten gleichsetzen und das Parameter-LGS lösen','nur die Längen der Richtungsvektoren vergleichen','beide Geraden ableiten','die Stützvektoren addieren']);
    const coach={id:`COACH-L-${Date.now()}`,type:'line',title:'Geradenschnitt-Coach',lessonId:'G5',intro:'Aus dem räumlichen Problem entsteht ein kontrolliertes Parameter-LGS mit anschließender Punktprüfung.',
      context:`Bestimme den Schnittpunkt von \\(g:${g}\\) und \\(h:${h}\\).`,steps:[
        {id:'strategy',title:'1 · Strategie',prompt:'Wie beginnt eine Schnittpunktberechnung korrekt?',type:'choice',options,answer:String.fromCharCode(65+options.indexOf('Koordinaten gleichsetzen und das Parameter-LGS lösen')),answerKind:'choice',explanation:'Am Schnittpunkt beschreiben beide Geradengleichungen denselben Ortsvektor.'},
        {id:'r',title:'2 · Parameter r',prompt:'Bestimme den Parameter \\(r\\) der ersten Geraden.',type:'numeric',answer:r,answerKind:'numeric',hints:['Setze die ersten beiden Koordinaten gleich.','Eliminiere zunächst s.'],solutionSteps:[`\\(r=${r}\\)`],explanation:`Das Koordinaten-LGS liefert r=${r}.`},
        {id:'s',title:'3 · Parameter s',prompt:'Bestimme den Parameter \\(s\\) der zweiten Geraden.',type:'numeric',answer:s,answerKind:'numeric',hints:['Nutze eine der Koordinatengleichungen mit dem bereits gefundenen r.'],solutionSteps:[`\\(s=${s}\\)`],explanation:`Einsetzen liefert s=${s}.`},
        {id:'point',title:'4 · Schnittpunkt',prompt:'Gib den Schnittpunkt als \\((x|y|z)\\) an.',type:'text',answer:P,answerKind:'point',hints:['Setze r in g oder s in h ein.','Berechne jede Koordinate getrennt.'],solutionSteps:[`\\(S(${P.join('|')})\\)`],explanation:`Beide Geraden erreichen den Punkt (${P.join('|')}).`},
        {id:'explain',title:'5 · Kontrolle erklären',prompt:'Erkläre, wie du überprüfst, dass der Punkt wirklich auf beiden Geraden liegt.',type:'explain',keywords:['einsetzen','beide','geraden','koordinaten'],minLength:50,explanation:'Der Punkt wird in beide Parameterdarstellungen eingesetzt; alle drei Koordinaten müssen jeweils mit demselben Parameter übereinstimmen.'}
      ]};
    coach.steps=coach.steps.map(finalizeTask);coach.context=restoreTex(coach.context);return coach;
  }

  function checkCoachStep(step, user) {
    if (step.type === 'explain') {
      const text=String(user||'').toLowerCase();
      const hits=(step.keywords||[]).filter(k=>text.includes(k)).length;
      return {correct:text.length>=(step.minLength||25)&&hits>=2,reason:'explain',hits};
    }
    return checkAnswer(step,user);
  }

  function createExam(level='standard') {
    const ids = level === 'basis'
      ? ['linear','quadratic','slope','functionValue','power','roots','averageRate','derivative','vectorAdd','midpoint']
      : ['quadratic','endBehavior','roots','transform','sine','averageRate','derivative','tangent','extrema','inflection','pointOnLine','lineIntersection'];
    const tasks = ids.map(id=>generate(id));
    tasks.forEach((t,i)=>{t.examNumber=i+1;t.points=Math.max(2,t.points||2)});
    return {id:`EXAM-${Date.now()}`,title:level==='basis'?'EF Grundlagen-Check':'EF NRW Probeklausur',level,tasks,totalPoints:tasks.reduce((s,t)=>s+t.points,0),minutes:level==='basis'?60:90,created:Date.now()};
  }

  window.MATHFORGE_ENGINE = {
    randInt, choice, shuffle, evaluateExpression, expressionEquivalent, parseNumber, parseTuple, parseSet,
    checkAnswer, checkCoachStep, classifyError, generate, generateMixed, generatorCatalog,
    derivativeCoach, curveCoach, rootsCoach, rateCoach, lineCoach, createExam, format: { polyString, latexPoly, fmtNum, vectorLatex, fraction }
  };
})();
