(() => {
  'use strict';

  const DATA = window.MATHFORGE_DATA;
  const V3 = window.MATHFORGE_V03_DATA;
  const ENGINE = window.MATHFORGE_ENGINE;
  const STORAGE_KEY = 'mathforge_nrw_v04';
  const LEGACY_KEY = 'mathforge_nrw_v03';
  const LEGACY_KEY_V2 = 'mathforge_nrw_v02';
  const DIMENSIONS = [
    ['understanding', 'Verständnis'],
    ['method', 'Verfahren'],
    ['transfer', 'Transfer'],
    ['retention', 'Langzeitabruf']
  ];
  const PHASES = DATA.learningArchitecture?.phases || [];

  const defaultState = {
    version: 4,
    xp: 0,
    level: 1,
    streak: 1,
    lastStudyDate: null,
    totalMinutes: 0,
    answers: 0,
    correct: 0,
    mastery: {},
    masteryDimensions: {},
    phaseProgress: {},
    review: {},
    errors: [],
    reflections: {},
    attemptLog: [],
    diagnostic: null,
    practice: null,
    generatorSession: null,
    coachSession: null,
    examSession: null,
    examHistory: [],
    pathwaySession: null,
    curveSession: null,
    spaceSession: null,
    weeklyPlan: null,
    lessonSessions: {},
    theme: 'dark',
    route: 'dashboard',
    lesson: null,
    lessonTab: 'overview',
    settings: { reducedMotion: false, strictMode: false }
  };

  let state = loadState();
  let toastTimer;
  let timerHandle;

  const main = document.getElementById('main');
  const nav = document.getElementById('nav');

  const navItems = [
    ['dashboard', '⌂', 'Heute'],
    ['learn', '◇', 'Lernen'],
    ['practiceHub', '⚡', 'Üben'],
    ['exam', '▣', 'Klausuren'],
    ['progressHub', '↗', 'Fortschritt'],
    ['settings', '⚙', 'Einstellungen']
  ];

  function deepMerge(base, incoming) {
    if (!incoming || typeof incoming !== 'object') return structuredClone(base);
    const out = { ...base, ...incoming };
    for (const key of ['settings']) out[key] = { ...(base[key] || {}), ...(incoming[key] || {}) };
    return out;
  }

  function loadState() {
    try {
      const current = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (current) return deepMerge(defaultState, current);
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || 'null') || JSON.parse(localStorage.getItem(LEGACY_KEY_V2) || 'null');
      if (legacy) {
        const migrated = deepMerge(defaultState, legacy);
        migrated.version = 4;
        migrated.route = ['dashboard','learn','practiceHub','exam','progressHub','settings'].includes(migrated.route) ? migrated.route : 'dashboard';
        return migrated;
      }
    } catch (error) {
      console.warn('Lernstand konnte nicht geladen werden:', error);
    }
    return structuredClone(defaultState);
  }

  function saveState() {
    state.level = Math.max(1, Math.floor(state.xp / 300) + 1);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Die App bleibt auch in restriktiven Vorschau-/Privatmodi bedienbar.
      // In einem normalen GitHub-Pages-Tab wird weiterhin dauerhaft gespeichert.
      console.warn('Lernstand konnte in diesem Kontext nicht gespeichert werden:', error);
    }
    updateSidebar();
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[char]);
  }

  function clamp(value, min = 0, max = 100) {
    return Math.max(min, Math.min(max, value));
  }

  function mean(values) {
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  }

  function formatDate(timestamp, withYear = false) {
    if (!timestamp) return '–';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit', month: '2-digit', ...(withYear ? { year: 'numeric' } : {})
    }).format(new Date(timestamp));
  }

  function formatDuration(seconds) {
    const s = Math.max(0, Math.round(seconds));
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  function typeset() {
    if (!window.MathJax?.typesetPromise) return;
    window.MathJax.typesetClear?.([main]);
    window.MathJax.typesetPromise([main]).catch(error => console.warn('MathJax:', error));
  }

  function applyTheme() {
    document.documentElement.classList.toggle('light', state.theme === 'light');
  }

  function route(to, extra = {}) {
    state.route = to;
    Object.assign(state, extra);
    saveState();
    clearInterval(timerHandle);
    render();
    document.querySelector('.sidebar')?.classList.remove('open');
    window.scrollTo({ top: 0, behavior: state.settings.reducedMotion ? 'auto' : 'smooth' });
  }

  function navRender() {
    nav.innerHTML = navItems.map(([id, icon, label]) => `
      <button class="nav-btn ${state.route === id ? 'active' : ''}" data-route="${id}">
        <span class="nav-icon">${icon}</span>${label}
      </button>
    `).join('');
    nav.querySelectorAll('[data-route]').forEach(button => {
      button.onclick = () => route(button.dataset.route);
    });
  }

  function updateSidebar() {
    document.getElementById('side-level').textContent = state.level;
    document.getElementById('side-mastery').textContent = `${Math.round(globalMastery())}%`;
  }

  function pageHead(eyebrow, title, subtitle, actions = '') {
    return `
      <header class="page-head">
        <div>
          <div class="eyebrow">${eyebrow}</div>
          <h1>${title}</h1>
          <p class="subtitle">${subtitle}</p>
        </div>
        <div class="actions">${actions}</div>
      </header>
    `;
  }

  function progress(value, label = '') {
    return `<div class="progress" ${label ? `aria-label="${esc(label)}"` : ''}><span style="width:${clamp(value)}%"></span></div>`;
  }

  function ring(value) {
    return `<div class="ring" style="--p:${Math.round(clamp(value))}"><strong>${Math.round(clamp(value))}%</strong></div>`;
  }

  function pill(text, kind = '') {
    return `<span class="pill ${kind}">${esc(text)}</span>`;
  }

  function getLesson(id) {
    return DATA.lessons.find(lesson => lesson.id === id);
  }

  function dimensionState(lessonId) {
    const existing = state.masteryDimensions[lessonId];
    if (existing) return existing;
    const legacy = Number(state.mastery[lessonId] || 0);
    const created = { understanding: legacy, method: legacy, transfer: Math.max(0, legacy - 10), retention: Math.max(0, legacy - 15) };
    state.masteryDimensions[lessonId] = created;
    return created;
  }

  function lessonMastery(lessonId) {
    const dims = dimensionState(lessonId);
    return mean(Object.values(dims));
  }

  function globalMastery() {
    return mean(DATA.lessons.map(lesson => lessonMastery(lesson.id)));
  }

  function groupMastery(domain) {
    return mean(DATA.lessons.filter(lesson => lesson.domain === domain).map(lesson => lessonMastery(lesson.id)));
  }

  function dimensionAverage(key) {
    return mean(DATA.lessons.map(lesson => dimensionState(lesson.id)[key] || 0));
  }

  function updateMastery(lessonId, dimension, amount) {
    const dims = dimensionState(lessonId);
    const key = ({
      'Verständnis': 'understanding', 'Verfahren': 'method', 'Transfer': 'transfer', 'Langzeitabruf': 'retention'
    })[dimension] || dimension || 'method';
    dims[key] = clamp((dims[key] || 0) + amount);
    state.masteryDimensions[lessonId] = dims;
    state.mastery[lessonId] = lessonMastery(lessonId);
  }

  function phaseState(lessonId) {
    if (!state.phaseProgress[lessonId]) state.phaseProgress[lessonId] = {};
    return state.phaseProgress[lessonId];
  }

  function markPhase(lessonId, phaseId, complete = true) {
    phaseState(lessonId)[phaseId] = complete;
  }

  function phaseCompletion(lessonId) {
    const phases = phaseState(lessonId);
    return PHASES.length ? 100 * PHASES.filter(p => phases[p.id]).length / PHASES.length : 0;
  }

  function dueCount() {
    const now = Date.now();
    return Object.values(state.review).filter(item => item.due <= now).length;
  }

  function scheduleReview(lessonId, correct, confidence = 2) {
    const current = state.review[lessonId] || { stage: 0, due: Date.now() };
    let stage = current.stage || 0;
    if (correct) stage = Math.min(6, stage + (confidence >= 3 ? 1 : 0));
    else stage = Math.max(0, stage - 2);
    const intervals = [15 * 60e3, 6 * 3600e3, 24 * 3600e3, 3 * 86400e3, 7 * 86400e3, 21 * 86400e3, 60 * 86400e3];
    state.review[lessonId] = { stage, due: Date.now() + intervals[stage], last: Date.now(), lastCorrect: correct };
  }

  function todayRecommendation() {
    const now = Date.now();
    const due = DATA.lessons
      .filter(lesson => (state.review[lesson.id]?.due || Infinity) <= now)
      .sort((a, b) => lessonMastery(a.id) - lessonMastery(b.id));
    return due[0] || [...DATA.lessons].sort((a, b) => lessonMastery(a.id) - lessonMastery(b.id))[0];
  }

  function updateStudyStreak() {
    const today = new Date().toISOString().slice(0, 10);
    if (state.lastStudyDate === today) return;
    if (state.lastStudyDate) {
      const previous = new Date(`${state.lastStudyDate}T12:00:00`);
      const current = new Date(`${today}T12:00:00`);
      const days = Math.round((current - previous) / 86400e3);
      state.streak = days === 1 ? state.streak + 1 : 1;
    } else {
      state.streak = 1;
    }
    state.lastStudyDate = today;
  }

  function recordAttempt(task, user, result, context = 'practice', confidence = 2) {
    state.answers++;
    if (result.correct) state.correct++;
    const isRetention = (state.review[task.lessonId]?.due || Infinity) <= Date.now();
    const dimension = isRetention ? 'retention' : ({ Verständnis: 'understanding', Verfahren: 'method', Transfer: 'transfer' }[task.masteryDimension] || 'method');
    updateMastery(task.lessonId, dimension, result.correct ? (confidence >= 3 ? 5 : 4) : -2);
    if (isRetention && result.correct) updateMastery(task.lessonId, 'retention', 4);
    scheduleReview(task.lessonId, result.correct, confidence);
    state.xp += result.correct ? 22 + confidence * 2 : 4;
    state.totalMinutes += 1;
    updateStudyStreak();

    const attempt = {
      id: Date.now() + Math.random(),
      taskId: task.id,
      lessonId: task.lessonId,
      skill: task.skill,
      context,
      correct: result.correct,
      confidence,
      created: Date.now()
    };
    state.attemptLog.unshift(attempt);
    state.attemptLog = state.attemptLog.slice(0, 500);

    let diagnosis = null;
    if (!result.correct) {
      diagnosis = ENGINE.classifyError(task, user);
      state.errors.unshift({
        id: Date.now() + Math.random(),
        lessonId: task.lessonId,
        taskId: task.id,
        prompt: task.prompt,
        user: String(user),
        answer: task.answer,
        explanation: task.explanation,
        solutionSteps: task.solutionSteps || [],
        diagnosis,
        created: Date.now(),
        resolved: false,
        repairAttempts: 0
      });
      state.errors = state.errors.slice(0, 250);
    }
    saveState();
    return diagnosis;
  }

  function competencyProgress(code) {
    const ids = DATA.compToLessons[code] || [];
    return ids.length ? mean(ids.map(lessonMastery)) : 0;
  }

  function generatorForLesson(lessonId) {
    return ENGINE.generatorCatalog.find(item => item[1] === lessonId)?.[0]
      || (lessonId.startsWith('G') ? 'vectorAdd' : lessonId === 'A13' ? 'extrema' : 'derivative');
  }

  function newTaskForLesson(lessonId, transfer = false) {
    const task = ENGINE.generate(generatorForLesson(lessonId), transfer ? 3 : 2);
    if (transfer) task.masteryDimension = 'Transfer';
    return task;
  }

  function getLessonSession(lessonId) {
    if (!state.lessonSessions[lessonId]) {
      state.lessonSessions[lessonId] = {
        guided: { task: newTaskForLesson(lessonId), input: '', selected: '', confidence: 2, hints: 0, answered: false, result: null },
        independentIndex: 0,
        independent: { input: '', selected: '', confidence: 2, hints: 0, answered: false, result: null },
        transfer: { task: newTaskForLesson(lessonId, true), input: '', selected: '', confidence: 2, hints: 0, answered: false, result: null },
        exampleReveal: {},
        reflectionDraft: '',
        exitDraft: ''
      };
    }
    return state.lessonSessions[lessonId];
  }

  function taskValue(task, session) {
    return task.type === 'choice' ? session.selected : session.input;
  }

  function taskInputHTML(task, session, prefix) {
    if (task.type === 'choice') {
      return `<div class="options">
        ${(task.options || []).map((option, index) => {
          const letter = String.fromCharCode(65 + index);
          return `<button class="option ${session.selected === letter ? 'selected' : ''}" data-${prefix}-option="${letter}" ${session.answered ? 'disabled' : ''}>
            <strong>${letter}.</strong><span>${option}</span>
          </button>`;
        }).join('')}
      </div>`;
    }
    const placeholder = task.answerKind === 'set' ? 'z. B. -2, 3'
      : task.answerKind === 'point' ? 'z. B. (2|5)'
      : task.answerKind === 'vector' ? 'z. B. (1|−2|3)'
      : task.answerKind === 'expression' ? 'z. B. 12x^3 - 4x'
      : 'Antwort eingeben …';
    return `<input class="answer-input" id="${prefix}-input" value="${esc(session.input || '')}" placeholder="${placeholder}" ${session.answered ? 'disabled' : ''}>`;
  }

  function confidenceHTML(session, prefix) {
    return `<div class="confidence-row">
      <span>Wie sicher bist du?</span>
      ${[
        [1, 'geraten'], [2, 'unsicher'], [3, 'ziemlich sicher'], [4, 'sehr sicher']
      ].map(([value, label]) => `<button class="confidence-btn ${session.confidence === value ? 'active' : ''}" data-${prefix}-confidence="${value}" ${session.answered ? 'disabled' : ''}>${value}<small>${label}</small></button>`).join('')}
    </div>`;
  }

  function solutionHTML(task) {
    return `<div class="solution-panel">
      <div class="solution-title">Lösungsweg – nicht nur Endergebnis</div>
      <ol class="solution-steps">${(task.solutionSteps || [task.explanation]).map(step => `<li>${step}</li>`).join('')}</ol>
      <div class="why-box"><strong>Warum funktioniert das?</strong><p>${task.explanation || 'Der Lösungsweg folgt aus der passenden mathematischen Definition und den zulässigen Umformungen.'}</p></div>
    </div>`;
  }

  function taskFeedbackHTML(task, session) {
    if (!session.answered) return '';
    const correct = session.result?.correct;
    const diagnosis = session.diagnosis;
    return `<div class="feedback ${correct ? 'correct' : 'wrong'}">
      <strong>${correct ? '✓ Mathematisch korrekt' : '✕ Noch nicht korrekt'}</strong>
      <p>${correct
        ? (session.confidence <= 2 ? 'Richtig, aber noch unsicher. Diese Aufgabe wird früher wiederholt.' : 'Richtig und sicher. Der Wiederholungsabstand wird vergrößert.')
        : `${esc(diagnosis?.title || 'Antwort stimmt nicht')}: ${esc(diagnosis?.repair || 'Vergleiche den ersten abweichenden Schritt.')}`}</p>
    </div>
    ${solutionHTML(task)}
    ${!correct ? `<div class="correction-box"><label>Fehler in eigenen Worten</label><textarea id="task-correction" placeholder="Was war dein erster falscher Gedanke oder Rechenschritt?"></textarea><button class="btn small" id="save-correction">Fehlerreflexion speichern</button></div>` : ''}`;
  }

  function taskCardHTML(task, session, prefix, label = '') {
    return `<div class="card question-card deep-question">
      <div class="lesson-meta">
        ${pill(label || task.title || 'Aufgabe', 'cyan')}
        ${pill(`NRW ${task.skill || 'EF'}`)}
        ${pill(task.masteryDimension || 'Verfahren', 'green')}
      </div>
      <h2>${task.prompt}</h2>
      ${taskInputHTML(task, session, prefix)}
      ${confidenceHTML(session, prefix)}
      <div class="question-actions">
        <div class="hint-dots">${(task.hints || []).map((_, i) => `<i class="${i < session.hints ? 'active' : ''}"></i>`).join('')}</div>
        <div class="actions">
          <button class="btn" id="${prefix}-hint" ${session.answered || session.hints >= (task.hints || []).length ? 'disabled' : ''}>Gestuften Hinweis</button>
          <button class="btn primary" id="${prefix}-check" ${session.answered ? 'disabled' : ''}>Rechenweg prüfen</button>
        </div>
      </div>
      ${session.hints ? `<div class="hint-stack">${(task.hints || []).slice(0, session.hints).map((hint, i) => `<div class="hint"><strong>Hinweis ${i + 1}</strong>${hint}</div>`).join('')}</div>` : ''}
      ${taskFeedbackHTML(task, session)}
    </div>`;
  }

  function bindTaskCard(task, session, prefix, context, onAfterCheck = () => {}) {
    main.querySelectorAll(`[data-${prefix}-option]`).forEach(button => {
      button.onclick = () => {
        session.selected = button.dataset[`${prefix}Option`];
        saveState();
        render();
      };
    });
    main.querySelectorAll(`[data-${prefix}-confidence]`).forEach(button => {
      button.onclick = () => {
        session.confidence = Number(button.dataset[`${prefix}Confidence`]);
        saveState();
        render();
      };
    });
    const input = document.getElementById(`${prefix}-input`);
    if (input) input.oninput = event => { session.input = event.target.value; };
    const hintButton = document.getElementById(`${prefix}-hint`);
    if (hintButton) hintButton.onclick = () => {
      session.hints = Math.min((task.hints || []).length, session.hints + 1);
      state.xp = Math.max(0, state.xp - 1);
      saveState();
      render();
    };
    const checkButton = document.getElementById(`${prefix}-check`);
    if (checkButton) checkButton.onclick = () => {
      if (input) session.input = input.value;
      const value = taskValue(task, session);
      if (!String(value || '').trim()) return toast('Trage zuerst eine Antwort ein.');
      const result = ENGINE.checkAnswer(task, value);
      session.answered = true;
      session.result = result;
      session.diagnosis = recordAttempt(task, value, result, context, session.confidence || 2);
      onAfterCheck(result);
      saveState();
      render();
    };
    const saveCorrection = document.getElementById('save-correction');
    if (saveCorrection) saveCorrection.onclick = () => {
      const text = document.getElementById('task-correction')?.value.trim();
      if (!text || text.length < 12) return toast('Beschreibe den Fehler etwas genauer.');
      const error = state.errors.find(item => item.taskId === task.id && !item.reflection);
      if (error) error.reflection = text;
      state.xp += 8;
      saveState();
      toast('Fehlerreflexion gespeichert · +8 XP');
    };
  }

  function resetTaskSession(session, task) {
    session.task = task;
    session.input = '';
    session.selected = '';
    session.confidence = 2;
    session.hints = 0;
    session.answered = false;
    session.result = null;
    session.diagnosis = null;
  }

  function renderDashboard() {
    const rec = todayRecommendation();
    const due = dueCount();
    const openErrors = state.errors.filter(item => !item.resolved).length;
    const nextAction = due > 0 ? 'Fällige Wiederholung starten' : 'Heutige Masterclass starten';
    main.innerHTML = `<div class="page calm-page">
      ${pageHead('HEUTE', `Bereit für deine nächste Mathe-Mission?`, 'Eine klare Aufgabe nach der anderen. Spezialwerkzeuge erscheinen erst, wenn sie dir wirklich helfen.', `<button class="btn ghost" id="today-plan">Wochenplan</button>`)}

      <section class="today-hero card">
        <div class="today-hero-copy">
          <div class="lesson-meta">${pill(rec.domain, 'cyan')}${pill(`${rec.minutes} Min.`)}${due ? pill(`${due} Wiederholungen fällig`, 'orange') : pill('Plan aktuell', 'green')}</div>
          <span class="micro-label">DEIN NÄCHSTER SCHRITT</span>
          <h2>${rec.title}</h2>
          <p>${rec.summary}</p>
          <div class="today-actions">
            <button class="btn primary xl" id="today-start">${nextAction}</button>
            <button class="btn" id="today-details">Thema ansehen</button>
          </div>
        </div>
        <div class="today-score">
          ${ring(lessonMastery(rec.id))}
          <strong>${Math.round(phaseCompletion(rec.id))}%</strong>
          <span>Lernpfad abgeschlossen</span>
        </div>
      </section>

      <div class="today-grid">
        <button class="card quiet-action" id="today-resume"><span class="quiet-icon">▶</span><div><small>WEITERLERNEN</small><strong>${rec.title}</strong><p>Setze genau dort fort, wo dein Lernstand den größten Hebel hat.</p></div><b>→</b></button>
        <button class="card quiet-action" id="today-review"><span class="quiet-icon">↻</span><div><small>WIEDERHOLEN</small><strong>${due} fällige Abrufe</strong><p>Ohne vorheriges Nachlesen langfristig aus dem Gedächtnis abrufen.</p></div><b>→</b></button>
        <button class="card quiet-action ${openErrors ? 'attention' : ''}" id="today-repair"><span class="quiet-icon">!</span><div><small>FEHLERFOKUS</small><strong>${openErrors} offene Fehler</strong><p>${openErrors ? 'Repariere die Ursache statt nur dieselbe Aufgabe erneut zu rechnen.' : 'Aktuell keine offenen Reparaturen.'}</p></div><b>→</b></button>
      </div>

      <section class="section-shell">
        <div class="section-title"><h2>Dein Überblick</h2><span>nur das, was heute eine Entscheidung verändert</span></div>
        <div class="overview-strip">
          <div><small>Gesamt-Mastery</small><strong>${Math.round(globalMastery())}%</strong></div>
          <div><small>Lernserie</small><strong>${state.streak} Tage</strong></div>
          <div><small>Level</small><strong>${state.level}</strong></div>
          <div><small>Lernzeit</small><strong>${state.totalMinutes} Min.</strong></div>
        </div>
      </section>

      <section class="section-shell">
        <div class="section-title"><h2>Schnellzugriff</h2><span>für konkrete Situationen</span></div>
        <div class="quick-grid">
          <button data-quick-route="diagnostic"><span>⌁</span><strong>Ich weiß nicht, wo meine Lücke liegt</strong><small>Diagnose starten</small></button>
          <button data-quick-route="pathway"><span>≡</span><strong>Mein Rechenweg wird falsch</strong><small>Schrittweise prüfen</small></button>
          <button data-quick-route="exam"><span>▣</span><strong>Ich schreibe bald eine Klausur</strong><small>Prüfungsmodus</small></button>
          <button data-quick-route="formulas"><span>ƒ</span><strong>Ich suche eine Formel</strong><small>Formelwerk öffnen</small></button>
        </div>
      </section>
    </div>`;
    document.getElementById('today-plan').onclick = () => route('planner');
    document.getElementById('today-start').onclick = () => due > 0 ? route('practice') : openLesson(rec.id, 'overview');
    document.getElementById('today-details').onclick = () => openLesson(rec.id, 'overview');
    document.getElementById('today-resume').onclick = () => openLesson(rec.id, 'overview');
    document.getElementById('today-review').onclick = () => route('practice');
    document.getElementById('today-repair').onclick = () => route(openErrors ? 'errors' : 'practiceHub');
    main.querySelectorAll('[data-quick-route]').forEach(button => button.onclick = () => route(button.dataset.quickRoute));
  }

  function renderPracticeHub() {
    const openErrors = state.errors.filter(item => !item.resolved).length;
    main.innerHTML = `<div class="page calm-page">
      ${pageHead('ÜBEN', 'Wähle nur die Art des Trainings', 'Die App entscheidet im Hintergrund über passende Themen, Schwierigkeit, Wiederholung und Fehlertypen.')}
      <div class="mode-grid">
        <article class="card mode-card featured"><div class="mode-icon">↳</div><div><span>GEFÜHRT</span><h2>Schritt für Schritt lernen</h2><p>Hilfen werden kontrolliert freigegeben. Strategie, Zwischenschritte, Begründung und Kontrolle werden einzeln trainiert.</p><ul><li>Step Coach</li><li>Rechenwegprüfung</li><li>Teilpunkte und Hinweise</li></ul></div><button class="btn primary" data-mode="coach">Geführt starten</button></article>
        <article class="card mode-card"><div class="mode-icon">∞</div><div><span>FREI</span><h2>Selbstständig trainieren</h2><p>Neue Varianten, gemischte Themen und Aufgaben ohne vorgegebenes Verfahren.</p><ul><li>Smart Practice</li><li>Infinite Forge</li><li>Transfertraining</li></ul></div><button class="btn primary" data-mode="practice">Freies Training</button></article>
        <article class="card mode-card ${openErrors ? 'repair' : ''}"><div class="mode-icon">!</div><div><span>FEHLERFOKUS</span><h2>Ursachen gezielt reparieren</h2><p>Die App bündelt wiederkehrende Denkfehler und erstellt ähnliche Reparaturaufgaben.</p><ul><li>${openErrors} offene Fehler</li><li>Fehler-DNA</li><li>Reparaturroute</li></ul></div><button class="btn primary" data-mode="errors">Fehlertraining</button></article>
      </div>
      <details class="card advanced-tools"><summary><span>Erweiterte Werkzeuge</span><small>Simulationen, Formeln und Spezialtrainer</small></summary><div class="tool-grid">
        <button data-tool="graph"><span>∿</span><strong>Graphen-Labor</strong><small>Parameter dynamisch verändern</small></button>
        <button data-tool="curveLab"><span>⌇</span><strong>Kurven-Simulator</strong><small>f, f′ und f″ verbinden</small></button>
        <button data-tool="space"><span>◫</span><strong>3D-Vektorraum</strong><small>Geraden räumlich verstehen</small></button>
        <button data-tool="formulas"><span>ƒ</span><strong>Formelwerk</strong><small>Formeln mit Einsatzhinweisen</small></button>
        <button data-tool="generators"><span>∞</span><strong>Generator-Auswahl</strong><small>Aufgabentyp selbst festlegen</small></button>
        <button data-tool="diagnostic"><span>⌁</span><strong>Diagnose</strong><small>Grundlagenlücken lokalisieren</small></button>
      </div></details>
    </div>`;
    main.querySelectorAll('[data-mode]').forEach(button => button.onclick = () => route(button.dataset.mode));
    main.querySelectorAll('[data-tool]').forEach(button => button.onclick = () => route(button.dataset.tool));
  }

  function renderProgressHub() {
    const weak = [...DATA.lessons].sort((a,b)=>lessonMastery(a.id)-lessonMastery(b.id)).slice(0,3);
    const attempts7 = state.attemptLog.filter(item => item.created > Date.now() - 7 * 86400e3);
    const accuracy = attempts7.length ? Math.round(100 * attempts7.filter(item=>item.correct).length/attempts7.length) : 0;
    main.innerHTML = `<div class="page calm-page">
      ${pageHead('FORTSCHRITT', 'Was kannst du – und was kostet noch Punkte?', 'Keine Statistik um der Statistik willen. Jede Anzeige führt zu einer konkreten Lernentscheidung.')}
      <div class="progress-hero card"><div>${ring(globalMastery())}</div><div><span>GESAMTSTATUS</span><h2>${globalMastery() >= 80 ? 'Klausurnah' : globalMastery() >= 55 ? 'Im Aufbau' : 'Fundament stärken'}</h2><p>${DATA.lessons.filter(l=>lessonMastery(l.id)>=80).length} von ${DATA.lessons.length} Modulen sind aktuell klausurreif.</p></div><button class="btn primary" id="progress-next">Nächste Lücke trainieren</button></div>
      <div class="grid grid-3">
        <div class="card stat-card"><div class="label">7-Tage-Trefferquote</div><div class="value">${accuracy}%</div><div class="delta">${attempts7.length} Versuche</div></div>
        <div class="card stat-card"><div class="label">Offene Fehler</div><div class="value">${state.errors.filter(e=>!e.resolved).length}</div><div class="delta">mit Reparaturpfad</div></div>
        <div class="card stat-card"><div class="label">Fällige Abrufe</div><div class="value">${dueCount()}</div><div class="delta">Langzeitlernen</div></div>
      </div>
      <div class="section-title"><h2>Deine drei größten Hebel</h2><span>nach Mastery sortiert</span></div>
      <div class="leverage-list">${weak.map((lesson,i)=>`<button data-progress-lesson="${lesson.id}"><b>${i+1}</b><div><strong>${lesson.title}</strong><span>${lesson.domain} · ${Math.round(lessonMastery(lesson.id))}% Mastery</span>${progress(lessonMastery(lesson.id))}</div><em>Trainieren →</em></button>`).join('')}</div>
      <div class="section-title"><h2>Details</h2><span>nur öffnen, wenn du tiefer analysieren möchtest</span></div>
      <div class="detail-links">
        <button data-progress-route="curriculum"><span>◎</span><div><strong>NRW-Kompetenzatlas</strong><small>Alle 31 EF-Kompetenzen</small></div></button>
        <button data-progress-route="analytics"><span>↗</span><div><strong>Lernanalyse</strong><small>Dimensionen und Verlauf</small></div></button>
        <button data-progress-route="errors"><span>!</span><div><strong>Fehlerprofil</strong><small>Denkfehler und Reparaturen</small></div></button>
        <button data-progress-route="planner"><span>▦</span><div><strong>Wochenplan</strong><small>Adaptive Lernverteilung</small></div></button>
      </div>
    </div>`;
    document.getElementById('progress-next').onclick = () => openLesson(weak[0].id, 'overview');
    main.querySelectorAll('[data-progress-lesson]').forEach(button=>button.onclick=()=>openLesson(button.dataset.progressLesson,'overview'));
    main.querySelectorAll('[data-progress-route]').forEach(button=>button.onclick=()=>route(button.dataset.progressRoute));
  }

  function renderCurriculum() {
    const competencyGroup = (key, title) => `<section class="competency-group">
      <div class="section-title"><h2>${title}</h2><span>${DATA.competencies[key].length} verbindliche Kompetenzen</span></div>
      <div class="competency-list">
        ${DATA.competencies[key].map(([code, name, description]) => {
          const p = competencyProgress(code);
          const linked = DATA.compToLessons[code] || [];
          return `<div class="competency">
            <div class="comp-code">${code}</div>
            <div><h4>${name}</h4><p>${description}</p>${progress(p)}<small>${linked.length} verknüpfte Module</small></div>
            <i class="status-dot ${p >= 80 ? 'done' : p > 0 ? 'progressing' : ''}"></i>
          </div>`;
        }).join('')}
      </div>
    </section>`;
    main.innerHTML = `<div class="page">
      ${pageHead('NRW-VOLLSTÄNDIGKEITSATLAS', 'Jede EF-Kompetenz sichtbar', 'Der Atlas zeigt nicht nur, ob ein Thema existiert, sondern wie sicher du es in Verständnis, Verfahren, Transfer und Langzeitabruf beherrschst.')}
      <div class="grid grid-3">
        <div class="card stat-card"><div class="label">Kompetenzen</div><div class="value">31</div><div class="delta">offizieller EF-Kern</div></div>
        <div class="card stat-card"><div class="label">Masterclasses</div><div class="value">${DATA.lessons.length}</div><div class="delta">inkl. Reparaturpfade</div></div>
        <div class="card stat-card"><div class="label">Generatorfamilien</div><div class="value">${ENGINE.generatorCatalog.length}</div><div class="delta">unbegrenzt neue Varianten</div></div>
      </div>
      ${competencyGroup('analysis', 'Funktionen & Analysis')}
      ${competencyGroup('geometry', 'Analytische Geometrie & Lineare Algebra')}
    </div>`;
  }

  function renderLearn() {
    const filters = ['Alle', 'Grundlagen', 'Analysis', 'Geometrie'];
    const activeFilter = state.learnFilter || 'Alle';
    const lessons = DATA.lessons.filter(lesson => activeFilter === 'Alle' || lesson.domain === activeFilter);
    main.innerHTML = `<div class="page">
      ${pageHead('MASTERCLASS-BIBLIOTHEK', 'Lernpfade mit Tiefe', 'Jedes Modul besitzt Lernziele, Voraussetzungen, Konzeptkern, Lösungsalgorithmus, Beispiele, geführte Aufgaben, Selbst-Erklärung, Transfer und Wiederholung.')}
      <div class="filter-row">${filters.map(filter => `<button class="filter-btn ${activeFilter === filter ? 'active' : ''}" data-learn-filter="${filter}">${filter}</button>`).join('')}</div>
      <div class="lesson-grid">
        ${lessons.map(lesson => {
          const dims = dimensionState(lesson.id);
          return `<article class="card lesson-card deep-lesson-card" data-open-lesson="${lesson.id}">
            <div class="lesson-meta">${pill(lesson.domain, 'cyan')}${pill(lesson.level)}${pill(`${lesson.minutes} Min.`)}</div>
            <h3>${lesson.title}</h3><p>${lesson.summary}</p>
            <div class="micro-tags">${(lesson.masterclass?.microSkills || []).slice(0, 5).map(skill => `<span>${esc(skill)}</span>`).join('')}</div>
            <div class="mini-dimensions">
              ${DIMENSIONS.map(([key, label]) => `<div><span>${label}</span>${progress(dims[key] || 0)}</div>`).join('')}
            </div>
            <div class="lesson-foot"><strong>${Math.round(lessonMastery(lesson.id))}% Mastery</strong><span>${Math.round(phaseCompletion(lesson.id))}% Phasen</span></div>
          </article>`;
        }).join('')}
      </div>
    </div>`;
    main.querySelectorAll('[data-learn-filter]').forEach(button => button.onclick = () => { state.learnFilter = button.dataset.learnFilter; saveState(); render(); });
    main.querySelectorAll('[data-open-lesson]').forEach(card => card.onclick = () => openLesson(card.dataset.openLesson, 'overview'));
  }

  function openLesson(id, tab = 'overview') {
    state.lesson = id;
    state.lessonTab = tab;
    state.route = 'lesson';
    saveState();
    render();
  }

  function lessonTabs(lesson) {
    const tabs = [
      ['overview', 'Kompass'], ['concept', 'Verstehen'], ['deep', 'Warum-Labor'], ['examples', 'Beispiele'], ['guided', 'Geführt'],
      ['explain', 'Erklären'], ['independent', 'Selbstständig'], ['transfer', 'Transfer'], ['retain', 'Behalten']
    ];
    return `<div class="tabs phase-tabs">${tabs.map(([id, label]) => `<button class="tab ${state.lessonTab === id ? 'active' : ''} ${phaseState(lesson.id)[id === 'overview' ? 'orient' : ({concept:'concept',deep:'concept',examples:'worked',guided:'guided',explain:'explain',independent:'independent',transfer:'transfer',retain:'retain'}[id])] ? 'done' : ''}" data-lesson-tab="${id}">${label}</button>`).join('')}</div>`;
  }

  function masteryPanelHTML(lesson) {
    const dims = dimensionState(lesson.id);
    return `<aside class="card lesson-side sticky">
      <div class="side-mastery">${ring(lessonMastery(lesson.id))}<div><strong>Gesamt-Mastery</strong><span>${Math.round(phaseCompletion(lesson.id))}% Lernpfad abgeschlossen</span></div></div>
      <div class="dimension-bars">${DIMENSIONS.map(([key, label]) => `<div class="skill-row"><span>${label}</span>${progress(dims[key] || 0)}<strong>${Math.round(dims[key] || 0)}%</strong></div>`).join('')}</div>
      <hr>
      <strong>NRW-Zuordnung</strong><div class="micro-tags">${lesson.competencies.map(code => `<span>${code}</span>`).join('')}</div>
      <strong>Fälliger Abruf</strong><p class="subtitle">${state.review[lesson.id] ? formatDate(state.review[lesson.id].due, true) : 'nach erster Übung geplant'}</p>
      <button class="btn full" id="lesson-infinite">Unendliche Aufgaben</button>
    </aside>`;
  }

  function renderLessonOverview(lesson) {
    const mc = lesson.masterclass;
    markPhase(lesson.id, 'orient');
    return `<div class="lesson-main">
      <div class="card core-idea"><div class="eyebrow">DIE ZENTRALE IDEE</div><h2>${mc.coreIdea}</h2></div>
      <div class="grid grid-2">
        <div class="card"><h3>Nach dieser Masterclass kannst du …</h3><ul class="check-list">${mc.objectives.map(item => `<li>${item}</li>`).join('')}</ul></div>
        <div class="card"><h3>Vorwissen-Check</h3><p>Diese Grundlagen sollten zumindest teilweise sitzen:</p><div class="micro-tags large">${mc.prerequisites.map(item => `<span>${esc(item)}</span>`).join('')}</div><button class="btn small" id="prereq-diagnostic">Kurzen Check erzeugen</button></div>
      </div>
      <div class="card"><h3>Mikrokompetenzen – nichts bleibt versteckt</h3><div class="micro-skill-grid">${mc.microSkills.map((skill, index) => `<div><b>${String(index + 1).padStart(2, '0')}</b><span>${esc(skill)}</span></div>`).join('')}</div></div>
      <div class="card"><h3>Der Lösungsalgorithmus</h3><ol class="algorithm-list">${mc.algorithm.map((step, index) => `<li><b>${index + 1}</b><span>${step}</span></li>`).join('')}</ol><p class="subtitle">Dieser Algorithmus ist kein starrer Rezeptzettel: In Transferaufgaben musst du zuerst erkennen, welche Schritte überhaupt nötig sind.</p></div>
      <div class="card learning-contract"><h3>Mastery statt Durchklicken</h3><p>Ein Modul gilt erst als sicher, wenn alle vier Dimensionen stabil sind. Eine richtige Antwort mit geringer Sicherheit erhöht den Wert weniger und wird früher wiederholt.</p><div class="grid grid-4">${DIMENSIONS.map(([key, label]) => `<div><strong>${label}</strong><small>${key === 'understanding' ? 'Begriffe und Warum' : key === 'method' ? 'Rechenweg und Regeln' : key === 'transfer' ? 'neue Situationen' : 'Abruf nach Zeit'}</small></div>`).join('')}</div></div>
    </div>`;
  }

  function renderLessonConcept(lesson) {
    markPhase(lesson.id, 'concept');
    return `<div class="lesson-main">
      <div class="concept-banner"><span>Konzeptphase</span><h2>Erst Bedeutung aufbauen, dann Verfahren automatisieren</h2><p>Lies aktiv: Formuliere nach jedem Abschnitt einen Satz, den du ohne Fachtext noch wiedergeben könntest.</p></div>
      ${lesson.sections.map((section, index) => `<section class="card theory-section deep-theory">
        <div class="theory-number">${String(index + 1).padStart(2, '0')}</div>
        <div><h2>${section.title}</h2><p>${section.html}</p><button class="btn small concept-toggle" data-concept="${index}">Aktive Abruffrage anzeigen</button><div class="concept-recall" id="concept-${index}" hidden><strong>Ohne nach oben zu schauen:</strong><p>${conceptQuestion(lesson, index)}</p><textarea placeholder="Erkläre es mit eigenen Worten …"></textarea></div></div>
      </section>`).join('')}
      <div class="card connection-map"><h3>Verbindungen zu anderen Themen</h3><div class="connection-nodes">${lesson.competencies.map(code => `<span>${code}</span>`).join('<i>→</i>')}<i>→</i><span>${lesson.domain === 'Geometrie' ? 'Raumprobleme' : 'Funktionsanalyse'}</span></div><p>Mathematik bleibt besser im Gedächtnis, wenn neue Inhalte an bereits bestehende Ideen geknüpft werden.</p></div>
    </div>`;
  }

  function conceptQuestion(lesson, index) {
    const prompts = [
      `Was ist die wichtigste Aussage des Abschnitts „${lesson.sections[index].title}“?`,
      `Welche typische Verwechslung könnte bei „${lesson.sections[index].title}“ entstehen?`,
      `Wie würdest du die Idee aus „${lesson.sections[index].title}“ an einem eigenen Mini-Beispiel zeigen?`
    ];
    return prompts[index % prompts.length];
  }

  function renderLessonDeep(lesson) {
    markPhase(lesson.id, 'concept');
    const deep = V3.deepDives[lesson.id] || V3.genericDeepDive;
    const saved = state.reflections[`deep-${lesson.id}`] || [];
    return `<div class="lesson-main">
      <div class="concept-banner why-banner"><span>WARUM-LABOR</span><h2>Vom Verfahren zum tragfähigen mentalen Modell</h2><p>Hier wird nicht nur gezeigt, was du tun sollst. Du untersuchst, warum die Regeln gelten, wann sie versagen und wie du sie kontrollierst.</p></div>
      <div class="card mental-anchor"><div class="eyebrow">MENTALER ANKER</div><h2>${deep.anchor}</h2><p><strong>Bild im Kopf:</strong> ${deep.analogy}</p></div>
      <div class="why-grid">
        ${deep.why.map(([question, answer], index) => `<article class="card why-card"><div class="why-number">${String(index + 1).padStart(2,'0')}</div><h3>${question}</h3><p>${answer}</p><button class="btn small" data-why-recall="${index}">Ausblenden & selbst erklären</button><div class="why-recall" id="why-recall-${index}" hidden><textarea placeholder="Erkläre die Antwort ohne den Text zu kopieren …">${esc(saved[index] || '')}</textarea><button class="btn primary small" data-save-why="${index}">Erklärung speichern</button></div></article>`).join('')}
      </div>
      <div class="card proof-card"><div class="eyebrow">BEWEISIDEE / HERLEITUNG</div><h3>Woher kommt die Regel?</h3><p>${deep.proofSketch}</p><div class="proof-warning"><strong>Wichtig:</strong> Eine Beweisidee ersetzt nicht das Rechnen. Sie sorgt dafür, dass du Regeln rekonstruieren kannst, statt sie nur auswendig zu kennen.</div></div>
      <div class="card"><h3>Fehler-Landkarte</h3><div class="mistake-map">${deep.mistakeMap.map(([name, repair]) => `<div><span>${esc(name)}</span><i>→</i><strong>${esc(repair)}</strong></div>`).join('')}</div></div>
      <div class="card explain-back"><h3>Teach-back: Könntest du es jemandem beibringen?</h3>${deep.explainBack.map((prompt, index) => `<label><span>${index + 1}. ${prompt}</span><textarea data-teachback="${index}" placeholder="Eigene Erklärung …"></textarea></label>`).join('')}<button class="btn primary" id="save-teachback">Teach-back abschließen</button></div>
    </div>`;
  }

  function renderLessonExamples(lesson, session) {
    markPhase(lesson.id, 'worked');
    return `<div class="lesson-main">
      <div class="concept-banner examples-banner"><span>Worked Examples</span><h2>Nicht abschreiben – Entscheidungen erkennen</h2><p>Versuche vor jedem aufgedeckten Schritt vorherzusagen, was als Nächstes kommt und welche Regel verwendet wird.</p></div>
      ${lesson.examples.map((example, exampleIndex) => {
        const shown = session.exampleReveal[exampleIndex] || 0;
        return `<article class="card worked-example">
          <div class="worked-head"><div><span>Beispiel ${exampleIndex + 1}</span><h2>${example.title}</h2></div><button class="btn small" data-restart-example="${exampleIndex}">Zurücksetzen</button></div>
          <div class="prediction-box"><strong>Vorhersage:</strong> Was wäre dein nächster Schritt – und warum?</div>
          <div class="worked-steps">${example.steps.map((step, stepIndex) => `<div class="worked-step ${stepIndex < shown ? 'revealed' : ''}"><b>${stepIndex + 1}</b><div>${stepIndex < shown ? step : '<span class="hidden-step">Schritt noch verdeckt</span>'}</div></div>`).join('')}</div>
          ${shown < example.steps.length ? `<button class="btn primary" data-reveal-example="${exampleIndex}">Nächsten Schritt aufdecken</button>` : `<div class="insight"><strong>Strategischer Kern</strong><p>${example.insight}</p></div>`}
        </article>`;
      }).join('')}
      <div class="card"><h3>Beispielvergleich</h3><p>Vergleiche die Beispiele: Welche Entscheidung war gleich, welche hing von der Aufgabenstruktur ab?</p><textarea class="reflection-area" id="example-comparison" placeholder="Gemeinsamkeit, Unterschied, Entscheidungsregel …"></textarea><button class="btn" id="save-example-comparison">Vergleich speichern</button></div>
    </div>`;
  }

  function renderLessonGuided(lesson, session) {
    const guided = session.guided;
    return `<div class="lesson-main">
      <div class="concept-banner guided-banner"><span>Geführtes Anwenden</span><h2>Hilfen werden stufenweise freigeschaltet</h2><p>Hinweis 1 aktiviert das Konzept, Hinweis 2 nennt die Strategie, Hinweis 3 hilft beim nächsten Rechenschritt. Die Lösung erscheint erst nach deiner Antwort.</p></div>
      ${taskCardHTML(guided.task, guided, 'guided', 'Geführte Aufgabe')}
      ${guided.answered ? `<div class="actions end-actions"><button class="btn primary" id="guided-next">Neue geführte Variante</button><button class="btn" id="guided-independent">Ohne Hilfen weiter</button></div>` : ''}
    </div>`;
  }

  function renderLessonExplain(lesson, session) {
    const saved = state.reflections[lesson.id] || [];
    return `<div class="lesson-main">
      <div class="concept-banner explain-banner"><span>Self Explanation</span><h2>Wer erklären kann, hat Struktur aufgebaut</h2><p>Schreibe nicht nur die Formel. Benenne Bedeutung, Entscheidung und Kontrolle.</p></div>
      <div class="card explain-task">
        <div class="eyebrow">WARUM-FRAGE</div><h2>${lesson.masterclass.explainPrompt}</h2>
        <textarea class="reflection-area large" id="lesson-reflection" placeholder="Meine Erklärung …">${esc(session.reflectionDraft || '')}</textarea>
        <div class="rubric-grid"><div><strong>Begriff</strong><span>Fachbegriffe korrekt?</span></div><div><strong>Begründung</strong><span>Warum statt nur was?</span></div><div><strong>Beispiel</strong><span>konkrete Verbindung?</span></div><div><strong>Kontrolle</strong><span>Wie prüfbar?</span></div></div>
        <button class="btn primary" id="check-reflection">Erklärung analysieren</button>
        <div id="reflection-result"></div>
      </div>
      ${saved.length ? `<div class="card"><h3>Gespeicherte Erklärungen</h3>${saved.slice(0, 4).map(item => `<div class="saved-reflection"><small>${formatDate(item.created, true)}</small><p>${esc(item.text)}</p><span>${item.score}/4 Kriterien</span></div>`).join('')}</div>` : ''}
    </div>`;
  }

  function renderLessonIndependent(lesson, session) {
    const index = Math.min(session.independentIndex || 0, lesson.questions.length - 1);
    const task = lesson.questions[index];
    task.lessonId = lesson.id;
    task.masteryDimension = index >= lesson.questions.length - 1 ? 'Transfer' : 'Verfahren';
    const qSession = session.independent;
    return `<div class="lesson-main">
      <div class="concept-banner independent-banner"><span>Selbstständig</span><h2>Jetzt ohne Themenstütze entscheiden</h2><p>Formuliere vor dem Rechnen innerlich: „Gefragt ist …, deshalb nutze ich …“</p></div>
      <div class="question-count">Aufgabe ${index + 1} von ${lesson.questions.length}</div>
      ${taskCardHTML(task, qSession, 'independent', 'Mastery-Aufgabe')}
      ${qSession.answered ? `<div class="actions end-actions"><button class="btn primary" id="independent-next">${index + 1 < lesson.questions.length ? 'Nächste Aufgabe' : 'Neue Runde'}</button></div>` : ''}
    </div>`;
  }

  function renderLessonTransfer(lesson, session) {
    return `<div class="lesson-main">
      <div class="concept-banner transfer-banner"><span>Transfer</span><h2>Keine Überschrift verrät dir das Verfahren</h2><p>Die Aufgabe kann eine andere Darstellung oder einen neuen Kontext verwenden. Entscheidend ist, dass du die mathematische Struktur erkennst.</p></div>
      ${taskCardHTML(session.transfer.task, session.transfer, 'transfer', 'Transfer-Challenge')}
      ${session.transfer.answered ? `<div class="actions end-actions"><button class="btn primary" id="transfer-next">Neue Transferaufgabe</button></div>` : ''}
    </div>`;
  }

  function renderLessonRetain(lesson, session) {
    const review = state.review[lesson.id];
    const due = review && review.due <= Date.now();
    return `<div class="lesson-main">
      <div class="concept-banner retain-banner"><span>Langzeitabruf</span><h2>Erst abrufen, dann nachlesen</h2><p>Vergessen ist kein Scheitern. Der Versuch zu erinnern stärkt die spätere Abrufbarkeit stärker als erneutes passives Lesen.</p></div>
      <div class="grid grid-2">
        <div class="card"><h3>Wiederholungsstatus</h3><div class="review-status ${due ? 'due' : ''}"><strong>${due ? 'Jetzt fällig' : review ? `Geplant: ${formatDate(review.due, true)}` : 'Noch nicht geplant'}</strong><span>Stufe ${review?.stage || 0} von 6</span></div><p>Eine sichere richtige Antwort vergrößert den Abstand. Unsicherheit verkürzt ihn, selbst wenn das Ergebnis korrekt war.</p><button class="btn primary" id="start-retrieval">Abrufaufgabe starten</button></div>
        <div class="card"><h3>Exit-Ticket</h3>${lesson.masterclass.exit.map((question, i) => `<label class="exit-question">${i + 1}. ${question}<textarea data-exit-answer="${i}" placeholder="kurze Antwort ohne Nachlesen …"></textarea></label>`).join('')}<button class="btn" id="save-exit">Exit-Ticket speichern</button></div>
      </div>
      <div class="card"><h3>Interleaving-Vorschlag</h3><p>Kombiniere dieses Thema beim nächsten Training mit:</p><div class="micro-tags large">${DATA.lessons.filter(item => item.domain === lesson.domain && item.id !== lesson.id).sort((a,b)=>lessonMastery(a.id)-lessonMastery(b.id)).slice(0,3).map(item => `<button class="tag-button" data-interleave="${item.id}">${item.title}</button>`).join('')}</div></div>
    </div>`;
  }

  function renderLesson() {
    const lesson = getLesson(state.lesson) || DATA.lessons[0];
    const session = getLessonSession(lesson.id);
    let body;
    if (state.lessonTab === 'concept') body = renderLessonConcept(lesson);
    else if (state.lessonTab === 'deep') body = renderLessonDeep(lesson);
    else if (state.lessonTab === 'examples') body = renderLessonExamples(lesson, session);
    else if (state.lessonTab === 'guided') body = renderLessonGuided(lesson, session);
    else if (state.lessonTab === 'explain') body = renderLessonExplain(lesson, session);
    else if (state.lessonTab === 'independent') body = renderLessonIndependent(lesson, session);
    else if (state.lessonTab === 'transfer') body = renderLessonTransfer(lesson, session);
    else if (state.lessonTab === 'retain') body = renderLessonRetain(lesson, session);
    else body = renderLessonOverview(lesson);

    main.innerHTML = `<div class="page lesson-page">
      <button class="back" id="lesson-back">← Masterclasses</button>
      <div class="lesson-hero deep-lesson-hero">
        <div><div class="lesson-meta">${pill(lesson.domain, 'cyan')}${pill(lesson.level)}${pill(`${lesson.minutes} Min.`)}${pill(lesson.competencies.join(' · '), 'green')}</div><h1>${lesson.title}</h1><p>${lesson.summary}</p></div>
        ${ring(lessonMastery(lesson.id))}
      </div>
      ${lessonTabs(lesson)}
      <div class="lesson-layout">${body}${masteryPanelHTML(lesson)}</div>
    </div>`;

    document.getElementById('lesson-back').onclick = () => route('learn');
    document.getElementById('lesson-infinite').onclick = () => startGenerator(generatorForLesson(lesson.id));
    main.querySelectorAll('[data-lesson-tab]').forEach(button => button.onclick = () => { state.lessonTab = button.dataset.lessonTab; saveState(); render(); });

    if (state.lessonTab === 'overview') {
      document.getElementById('prereq-diagnostic').onclick = () => {
        state.practice = createPractice([lesson.id], 5);
        route('practice');
      };
    }
    if (state.lessonTab === 'concept') {
      main.querySelectorAll('[data-concept]').forEach(button => button.onclick = () => {
        const el = document.getElementById(`concept-${button.dataset.concept}`);
        el.hidden = !el.hidden;
        button.textContent = el.hidden ? 'Aktive Abruffrage anzeigen' : 'Abruffrage ausblenden';
      });
    }
    if (state.lessonTab === 'deep') {
      main.querySelectorAll('[data-why-recall]').forEach(button => button.onclick = () => {
        const el = document.getElementById(`why-recall-${button.dataset.whyRecall}`);
        el.hidden = !el.hidden;
        button.textContent = el.hidden ? 'Ausblenden & selbst erklären' : 'Erklärung wieder anzeigen';
      });
      main.querySelectorAll('[data-save-why]').forEach(button => button.onclick = () => {
        const index = Number(button.dataset.saveWhy);
        const text = document.querySelector(`#why-recall-${index} textarea`)?.value.trim();
        if (!text || text.length < 25) return toast('Erkläre den Zusammenhang noch etwas ausführlicher.');
        const key = `deep-${lesson.id}`;
        if (!Array.isArray(state.reflections[key])) state.reflections[key] = [];
        state.reflections[key][index] = text;
        state.xp += 8; updateMastery(lesson.id, 'understanding', 2); saveState(); toast('Warum-Erklärung gespeichert · +8 XP');
      });
      document.getElementById('save-teachback').onclick = () => {
        const values = [...main.querySelectorAll('[data-teachback]')].map(el => el.value.trim()).filter(Boolean);
        if (values.length < 2 || values.join(' ').length < 80) return toast('Beantworte mindestens zwei Teach-back-Fragen ausführlich.');
        const key = `teachback-${lesson.id}`;
        state.reflections[key] = values;
        state.xp += 18; updateMastery(lesson.id, 'understanding', 4); updateMastery(lesson.id, 'transfer', 2); saveState(); toast('Teach-back abgeschlossen · +18 XP');
      };
    }
    if (state.lessonTab === 'examples') bindExamples(lesson, session);
    if (state.lessonTab === 'guided') bindGuided(lesson, session);
    if (state.lessonTab === 'explain') bindExplain(lesson, session);
    if (state.lessonTab === 'independent') bindIndependent(lesson, session);
    if (state.lessonTab === 'transfer') bindTransfer(lesson, session);
    if (state.lessonTab === 'retain') bindRetain(lesson, session);
    saveState();
  }

  function bindExamples(lesson, session) {
    main.querySelectorAll('[data-reveal-example]').forEach(button => button.onclick = () => {
      const i = Number(button.dataset.revealExample);
      session.exampleReveal[i] = (session.exampleReveal[i] || 0) + 1;
      if (session.exampleReveal[i] >= lesson.examples[i].steps.length) updateMastery(lesson.id, 'understanding', 2);
      saveState(); render();
    });
    main.querySelectorAll('[data-restart-example]').forEach(button => button.onclick = () => {
      session.exampleReveal[Number(button.dataset.restartExample)] = 0; saveState(); render();
    });
    document.getElementById('save-example-comparison').onclick = () => {
      const text = document.getElementById('example-comparison').value.trim();
      if (text.length < 20) return toast('Vergleiche die Beispiele etwas ausführlicher.');
      if (!state.reflections[lesson.id]) state.reflections[lesson.id] = [];
      state.reflections[lesson.id].unshift({ text, score: 3, type: 'example-comparison', created: Date.now() });
      state.xp += 12; updateMastery(lesson.id, 'understanding', 3); saveState(); toast('Vergleich gespeichert · +12 XP');
    };
  }

  function bindGuided(lesson, session) {
    bindTaskCard(session.guided.task, session.guided, 'guided', 'guided', result => {
      if (result.correct) markPhase(lesson.id, 'guided');
    });
    document.getElementById('guided-next')?.addEventListener('click', () => {
      resetTaskSession(session.guided, newTaskForLesson(lesson.id)); saveState(); render();
    });
    document.getElementById('guided-independent')?.addEventListener('click', () => { state.lessonTab = 'independent'; saveState(); render(); });
  }

  function scoreExplanation(text, lesson) {
    const lower = text.toLowerCase();
    const keywords = [...new Set([
      ...lesson.masterclass.microSkills.flatMap(skill => skill.toLowerCase().split(/\s+/)),
      ...lesson.masterclass.coreIdea.toLowerCase().split(/\s+/).filter(word => word.length > 5)
    ])].filter(word => word.length > 4);
    const keywordHits = keywords.filter(word => lower.includes(word)).length;
    let score = 0;
    if (text.length >= 60) score++;
    if (keywordHits >= 2) score++;
    if (/weil|deshalb|dadurch|denn|folg/.test(lower)) score++;
    if (/beispiel|zum beispiel|etwa|prüf|kontroll/.test(lower)) score++;
    return { score, keywordHits };
  }

  function bindExplain(lesson, session) {
    const textarea = document.getElementById('lesson-reflection');
    textarea.oninput = event => { session.reflectionDraft = event.target.value; };
    document.getElementById('check-reflection').onclick = () => {
      const text = textarea.value.trim();
      if (text.length < 35) return toast('Erkläre die Idee in mindestens zwei vollständigen Sätzen.');
      const evaluation = scoreExplanation(text, lesson);
      const result = document.getElementById('reflection-result');
      result.innerHTML = `<div class="reflection-feedback ${evaluation.score >= 3 ? 'strong' : ''}"><strong>${evaluation.score}/4 Kriterien erfüllt</strong><p>${evaluation.score >= 3 ? 'Die Erklärung enthält Bedeutung und Begründung. Sehr gut – jetzt ohne Text wiederholen.' : 'Ergänze eine Warum-Verbindung, ein Beispiel oder eine Prüfmöglichkeit.'}</p></div>`;
      if (!state.reflections[lesson.id]) state.reflections[lesson.id] = [];
      state.reflections[lesson.id].unshift({ text, score: evaluation.score, created: Date.now(), type: 'self-explanation' });
      session.reflectionDraft = '';
      state.xp += 8 + evaluation.score * 3;
      updateMastery(lesson.id, 'understanding', evaluation.score + 1);
      if (evaluation.score >= 3) markPhase(lesson.id, 'explain');
      saveState();
    };
  }

  function bindIndependent(lesson, session) {
    const index = Math.min(session.independentIndex || 0, lesson.questions.length - 1);
    const task = lesson.questions[index]; task.lessonId = lesson.id;
    bindTaskCard(task, session.independent, 'independent', 'independent', result => {
      if (result.correct && index === lesson.questions.length - 1) markPhase(lesson.id, 'independent');
    });
    document.getElementById('independent-next')?.addEventListener('click', () => {
      session.independentIndex = index + 1 < lesson.questions.length ? index + 1 : 0;
      session.independent = { input: '', selected: '', confidence: 2, hints: 0, answered: false, result: null };
      saveState(); render();
    });
  }

  function bindTransfer(lesson, session) {
    bindTaskCard(session.transfer.task, session.transfer, 'transfer', 'transfer', result => {
      if (result.correct) markPhase(lesson.id, 'transfer');
    });
    document.getElementById('transfer-next')?.addEventListener('click', () => {
      resetTaskSession(session.transfer, newTaskForLesson(lesson.id, true)); saveState(); render();
    });
  }

  function bindRetain(lesson, session) {
    document.getElementById('start-retrieval').onclick = () => {
      resetTaskSession(session.transfer, newTaskForLesson(lesson.id, true));
      session.transfer.task.masteryDimension = 'Langzeitabruf';
      state.lessonTab = 'transfer';
      saveState(); render();
    };
    document.getElementById('save-exit').onclick = () => {
      const answers = [...main.querySelectorAll('[data-exit-answer]')].map(area => area.value.trim()).filter(Boolean);
      if (answers.length < 2) return toast('Beantworte mindestens zwei Exit-Fragen.');
      if (!state.reflections[lesson.id]) state.reflections[lesson.id] = [];
      state.reflections[lesson.id].unshift({ text: answers.join('\n'), score: answers.length, created: Date.now(), type: 'exit-ticket' });
      markPhase(lesson.id, 'retain'); updateMastery(lesson.id, 'retention', 3); state.xp += 10; saveState(); toast('Exit-Ticket gespeichert');
    };
    main.querySelectorAll('[data-interleave]').forEach(button => button.onclick = () => openLesson(button.dataset.interleave, 'guided'));
  }

  function renderGenerators() {
    const session = state.generatorSession;
    if (session?.active && session.task) return renderGeneratorActive(session);
    const groups = {
      Grundlagen: ENGINE.generatorCatalog.filter(item => ['F0','F1','F2','F3'].includes(item[1])),
      Analysis: ENGINE.generatorCatalog.filter(item => item[1].startsWith('A')),
      Geometrie: ENGINE.generatorCatalog.filter(item => item[1].startsWith('G'))
    };
    main.innerHTML = `<div class="page">
      ${pageHead('INFINITE FORGE', 'Unbegrenzt neue Aufgabenvarianten', 'Keine feste Liste zum Auswendiglernen. Parameter, Zahlen und Darstellungen werden bei jeder Aufgabe neu erzeugt – mit gestuften Hinweisen und vollständigem Lösungsweg.')}
      <div class="card generator-hero"><div><div class="eyebrow">${ENGINE.generatorCatalog.length} GENERATORFAMILIEN</div><h2>Trainiere ein Verfahren, bis du die Struktur erkennst</h2><p>Die Antwortprüfung unterscheidet Zahlen, Mengen, Punkte, Vektoren und mathematisch äquivalente Terme. Beispielsweise werden 12x³−4x und −4x+12x³ als gleich erkannt.</p></div><div class="infinity-symbol">∞</div></div>
      ${Object.entries(groups).map(([group, items]) => `<section><div class="section-title"><h2>${group}</h2><span>${items.length} Generatoren</span></div><div class="generator-grid">${items.map(([id, lessonId, label]) => {
        const stats = generatorStats(id);
        return `<button class="card generator-card" data-generator="${id}"><div class="generator-icon">${lessonId}</div><h3>${label}</h3><p>${getLesson(lessonId)?.masterclass?.microSkills?.slice(0,3).join(' · ') || 'adaptive Aufgaben'}</p><div class="generator-stats"><span>${stats.attempts} Versuche</span><strong>${stats.accuracy}%</strong></div></button>`;
      }).join('')}</div></section>`).join('')}
    </div>`;
    main.querySelectorAll('[data-generator]').forEach(button => button.onclick = () => startGenerator(button.dataset.generator));
  }

  function generatorStats(id) {
    const lessonId = ENGINE.generatorCatalog.find(item => item[0] === id)?.[1];
    const items = state.attemptLog.filter(item => item.context === `generator:${id}` || (item.context === 'generator' && item.lessonId === lessonId));
    return { attempts: items.length, accuracy: items.length ? Math.round(100 * items.filter(item => item.correct).length / items.length) : 0 };
  }

  function startGenerator(id) {
    state.generatorSession = {
      active: true, generatorId: id, task: ENGINE.generate(id), input: '', selected: '', confidence: 2, hints: 0,
      answered: false, result: null, streak: 0, correct: 0, total: 0
    };
    route('generators');
  }

  function renderGeneratorActive(session) {
    const catalog = ENGINE.generatorCatalog.find(item => item[0] === session.generatorId);
    const task = session.task;
    main.innerHTML = `<div class="page focus-page">
      ${pageHead('INFINITE FORGE', catalog?.[2] || 'Generator', 'Jede neue Aufgabe verändert Zahlen und Struktur. Beende die Runde, sobald du nicht mehr nur rechnest, sondern das Muster erklären kannst.', `<button class="btn" id="generator-end">Runde beenden</button>`)}
      <div class="run-stats"><div><span>Rundenserie</span><strong>${session.streak}</strong></div><div><span>Richtig</span><strong>${session.correct}/${session.total}</strong></div><div><span>Mastery</span><strong>${Math.round(lessonMastery(task.lessonId))}%</strong></div></div>
      ${taskCardHTML(task, session, 'generator', 'Unendliche Variante')}
      ${session.answered ? `<div class="actions end-actions"><button class="btn primary" id="generator-next">Nächste neue Variante</button><button class="btn" id="generator-coach">Im Step Coach vertiefen</button></div>` : ''}
    </div>`;
    bindTaskCard(task, session, 'generator', `generator:${session.generatorId}`, result => {
      session.total++;
      if (result.correct) { session.correct++; session.streak++; } else session.streak = 0;
    });
    document.getElementById('generator-next')?.addEventListener('click', () => {
      const next = ENGINE.generate(session.generatorId);
      resetTaskSession(session, next); saveState(); render();
    });
    document.getElementById('generator-coach')?.addEventListener('click', () => {
      state.coachSession = createCoach(coachTypeForLesson(task.lessonId));
      route('coach');
    });
    document.getElementById('generator-end').onclick = () => { state.generatorSession = null; saveState(); render(); };
  }

  function coachTypeForLesson(lessonId) {
    if (lessonId === 'A3' || lessonId === 'F2') return 'roots';
    if (lessonId === 'A6' || lessonId === 'A7') return 'rate';
    if (['G4', 'G5', 'G6'].includes(lessonId)) return 'line';
    if (['A11', 'A12', 'A13', 'A14'].includes(lessonId)) return 'curve';
    return 'derivative';
  }

  function createCoach(type) {
    const factories = {
      derivative: () => ENGINE.derivativeCoach(),
      curve: () => ENGINE.curveCoach(),
      roots: () => ENGINE.rootsCoach(),
      rate: () => ENGINE.rateCoach(),
      line: () => ENGINE.lineCoach()
    };
    const coach = (factories[type] || factories.derivative)();
    return { active: true, coach, index: 0, input: '', selected: '', hints: 0, attempts: 0, answered: false, result: null, score: 0 };
  }

  function renderCoach() {
    const session = state.coachSession;
    if (!session?.active) {
      main.innerHTML = `<div class="page">
        ${pageHead('STEP COACH', 'Rechenwege statt Antwortbox', 'Jede mathematische Entscheidung wird einzeln geprüft. Du wählst zuerst die Strategie, führst dann den Rechenschritt aus und erklärst abschließend das Warum.')}
        <div class="grid grid-3 coach-choice-grid">
          <button class="card coach-choice" data-coach="derivative"><div class="coach-icon">f′</div><h2>Ableitungs-Coach</h2><p>Regelwahl → termweise Ableitung → Wert einsetzen → Warum-Erklärung.</p><ul><li>äquivalente Termprüfung</li><li>Regelfehlerdiagnose</li><li>Konstantenverständnis</li></ul></button>
          <button class="card coach-choice" data-coach="roots"><div class="coach-icon">x₁</div><h2>Nullstellen-Coach</h2><p>Methode erkennen → faktorisieren → Nullproduktregel → Vollständigkeit erklären.</p><ul><li>Vorzeichenkontrolle</li><li>Lösungsmengenprüfung</li><li>Faktorverständnis</li></ul></button>
          <button class="card coach-choice" data-coach="rate"><div class="coach-icon">Δ</div><h2>Änderungsraten-Coach</h2><p>Δy → Δx → Quotient → geometrische Bedeutung als Sekantensteigung.</p><ul><li>Einheitenverständnis</li><li>Intervallbezug</li><li>Interpretation</li></ul></button>
          <button class="card coach-choice" data-coach="curve"><div class="coach-icon">∿</div><h2>Kurvendiskussions-Mission</h2><p>Erste Ableitung → kritische Stellen → Klassifikation → zweite Ableitung → Wendepunkt → Konsistenz.</p><ul><li>sechs kontrollierte Schritte</li><li>keine Lösungssprünge</li><li>Zusammenhang der Ergebnisse</li></ul></button>
          <button class="card coach-choice" data-coach="line"><div class="coach-icon">↗</div><h2>Geradenschnitt-Coach</h2><p>Koordinaten gleichsetzen → Parameter-LGS → Schnittpunkt → Doppelprüfung.</p><ul><li>räumliche Struktur</li><li>Parametertrennung</li><li>Punktkontrolle</li></ul></button>
        </div>
        <div class="card coach-principle"><h3>Warum dieser Modus anders ist</h3><div class="grid grid-4"><div><strong>Entscheidung</strong><span>Welche Regel?</span></div><div><strong>Ausführung</strong><span>Ist der Schritt korrekt?</span></div><div><strong>Diagnose</strong><span>Welche Fehlerart?</span></div><div><strong>Erklärung</strong><span>Warum gilt das?</span></div></div></div>
      </div>`;
      main.querySelectorAll('[data-coach]').forEach(button => button.onclick = () => { state.coachSession = createCoach(button.dataset.coach); saveState(); render(); });
      return;
    }
    renderCoachActive(session);
  }

  function renderCoachActive(session) {
    const coach = session.coach;
    const step = coach.steps[session.index];
    if (!step) return renderCoachSummary(session);
    const stepSession = { input: session.input, selected: session.selected, confidence: session.confidence || 3, hints: session.hints, answered: session.answered, result: session.result, diagnosis: session.diagnosis };
    const progressValue = 100 * session.index / coach.steps.length;
    main.innerHTML = `<div class="page focus-page">
      ${pageHead('STEP COACH', coach.title, coach.intro, `<button class="btn" id="coach-exit">Mission verlassen</button>`)}
      <div class="coach-progress"><div><span>Schritt ${session.index + 1} von ${coach.steps.length}</span><strong>${step.title}</strong></div>${progress(progressValue)}</div>
      <div class="card coach-context"><div class="eyebrow">AUSGANGSPROBLEM</div><h2>${coach.context}</h2></div>
      ${step.type === 'explain' ? renderExplainStep(step, session) : taskCardHTML(step, stepSession, 'coachstep', step.title)}
      ${session.answered ? `<div class="actions end-actions"><button class="btn primary" id="coach-next">${session.index + 1 < coach.steps.length ? 'Nächster kontrollierter Schritt' : 'Mission auswerten'}</button></div>` : ''}
    </div>`;

    if (step.type === 'explain') bindExplainStep(step, session);
    else bindCoachTask(step, session, stepSession);
    document.getElementById('coach-next')?.addEventListener('click', () => {
      session.index++;
      session.input = ''; session.selected = ''; session.hints = 0; session.attempts = 0; session.answered = false; session.result = null; session.diagnosis = null;
      saveState(); render();
    });
    document.getElementById('coach-exit').onclick = () => { state.coachSession = null; saveState(); render(); };
  }

  function bindCoachTask(step, session, stepSession) {
    main.querySelectorAll('[data-coachstep-option]').forEach(button => button.onclick = () => { session.selected = button.dataset.coachstepOption; saveState(); render(); });
    main.querySelectorAll('[data-coachstep-confidence]').forEach(button => {
      button.onclick = () => { session.confidence = Number(button.dataset.coachstepConfidence); saveState(); render(); };
    });
    const input = document.getElementById('coachstep-input');
    if (input) input.oninput = event => { session.input = event.target.value; };
    document.getElementById('coachstep-hint').onclick = () => { session.hints = Math.min((step.hints || []).length, session.hints + 1); saveState(); render(); };
    document.getElementById('coachstep-check').onclick = () => {
      if (input) session.input = input.value;
      const value = step.type === 'choice' ? session.selected : session.input;
      if (!String(value || '').trim()) return toast('Bearbeite zuerst diesen Schritt.');
      const result = ENGINE.checkCoachStep(step, value);
      session.attempts++;
      if (result.correct) {
        session.answered = true; session.result = result; session.score++;
        state.xp += 25; updateMastery(session.coach.lessonId, session.index === session.coach.steps.length - 1 ? 'understanding' : 'method', 5);
      } else if (session.attempts >= 2) {
        session.answered = true; session.result = result; session.diagnosis = ENGINE.classifyError({ ...step, lessonId: session.coach.lessonId }, value);
        state.errors.unshift({ id: Date.now(), lessonId: session.coach.lessonId, taskId: `${session.coach.id}-${step.id}`, prompt: step.prompt, user: value, answer: step.answer, explanation: step.explanation, solutionSteps: step.solutionSteps || [], diagnosis: session.diagnosis, created: Date.now(), resolved: false, repairAttempts: 0 });
        updateMastery(session.coach.lessonId, 'method', -1);
      } else {
        session.result = result;
        toast('Noch nicht. Du bekommst einen zweiten Versuch, bevor die Lösung erscheint.');
      }
      saveState(); render();
    };
  }

  function renderExplainStep(step, session) {
    return `<div class="card explain-task coach-explain"><h2>${step.prompt}</h2><textarea class="reflection-area large" id="coach-explain-input" placeholder="Erkläre Bedeutung und Ursache …">${esc(session.input)}</textarea><div class="question-actions"><span>Mindestens ${step.minLength || 35} Zeichen und zentrale Fachbegriffe</span><button class="btn primary" id="coach-explain-check" ${session.answered ? 'disabled' : ''}>Erklärung prüfen</button></div>${session.answered ? `<div class="feedback ${session.result?.correct ? 'correct' : 'wrong'}"><strong>${session.result?.correct ? '✓ Tragfähige Erklärung' : '✕ Erklärung noch zu oberflächlich'}</strong><p>${step.explanation}</p></div>` : ''}</div>`;
  }

  function bindExplainStep(step, session) {
    const input = document.getElementById('coach-explain-input');
    input.oninput = event => { session.input = event.target.value; };
    document.getElementById('coach-explain-check').onclick = () => {
      session.input = input.value;
      const result = ENGINE.checkCoachStep(step, session.input);
      session.result = result;
      session.attempts++;
      if (result.correct || session.attempts >= 2) {
        session.answered = true;
        if (result.correct) { session.score++; updateMastery(session.coach.lessonId, 'understanding', 6); state.xp += 28; }
      } else toast('Ergänze eine Begründung und mindestens zwei zentrale Fachbegriffe.');
      saveState(); render();
    };
  }

  function renderCoachSummary(session) {
    const coach = session.coach;
    const percent = Math.round(100 * session.score / coach.steps.length);
    main.innerHTML = `<div class="page result-page">
      <div class="card result-hero"><div class="result-orb">${percent}%</div><div><div class="eyebrow">MISSION ABGESCHLOSSEN</div><h1>${coach.title}</h1><p>${session.score} von ${coach.steps.length} Schritten selbstständig korrekt. Entscheidend ist nicht nur der Endwert, sondern wo im Denkprozess Unsicherheit entstand.</p></div></div>
      <div class="grid grid-3"><div class="card stat-card"><div class="label">Strategie</div><div class="value">${session.score ? 'aktiv' : 'prüfen'}</div></div><div class="card stat-card"><div class="label">Schrittgenauigkeit</div><div class="value">${percent}%</div></div><div class="card stat-card"><div class="label">Offene Fehler</div><div class="value">${state.errors.filter(e => !e.resolved && e.lessonId === coach.lessonId).length}</div></div></div>
      <div class="actions center"><button class="btn primary" id="coach-again">Neue Mission</button><button class="btn" id="coach-errors">Fehler reparieren</button><button class="btn" id="coach-library">Zur Masterclass</button></div>
    </div>`;
    document.getElementById('coach-again').onclick = () => { state.coachSession = createCoach(coach.type); saveState(); render(); };
    document.getElementById('coach-errors').onclick = () => route('errors');
    document.getElementById('coach-library').onclick = () => openLesson(coach.lessonId, 'overview');
  }

  function createPractice(preferredLessons = [], count = 10) {
    return { active: true, tasks: ENGINE.generateMixed(count, preferredLessons), index: 0, input: '', selected: '', confidence: 2, hints: 0, answered: false, result: null, score: 0, started: Date.now() };
  }

  function renderPractice() {
    if (!state.practice?.active) {
      const weakest = [...DATA.lessons].sort((a,b)=>lessonMastery(a.id)-lessonMastery(b.id)).slice(0,5);
      main.innerHTML = `<div class="page">
        ${pageHead('SMART PRACTICE', 'Gemischtes Training ohne Themenhinweis', 'Interleaving trainiert nicht nur die Rechnung, sondern die Auswahl des passenden Verfahrens. Die Aufgaben stammen bevorzugt aus deinen schwächsten Bereichen.')}
        <div class="card practice-launch"><div><h2>10 adaptive Aufgaben</h2><p>Aus deinen fünf schwächsten Modulen, mit gestuften Hinweisen, Confidence-Messung und Fehlerdiagnose.</p><div class="micro-tags large">${weakest.map(l=>`<span>${l.title}</span>`).join('')}</div></div><button class="btn primary large-button" id="start-practice">Run starten</button></div>
      </div>`;
      document.getElementById('start-practice').onclick = () => { state.practice = createPractice(weakest.map(l=>l.id),10); saveState(); render(); };
      return;
    }
    const session = state.practice;
    if (session.index >= session.tasks.length) return renderPracticeResult(session);
    const task = session.tasks[session.index];
    main.innerHTML = `<div class="page focus-page">
      ${pageHead('SMART PRACTICE', `Aufgabe ${session.index + 1} von ${session.tasks.length}`, 'Kein Themenname vor der Aufgabe: Du musst zuerst die mathematische Struktur erkennen.', `<button class="btn" id="end-practice">Run beenden</button>`)}
      <div class="practice-progress">${progress(100 * session.index / session.tasks.length)}<span>${session.score} richtig</span></div>
      ${taskCardHTML(task, session, 'practice', 'Gemischte Aufgabe')}
      ${session.answered ? `<div class="actions end-actions"><button class="btn primary" id="practice-next">Weiter</button></div>` : ''}
    </div>`;
    bindTaskCard(task, session, 'practice', 'smart-practice', result => { if(result.correct) session.score++; });
    document.getElementById('practice-next')?.addEventListener('click', () => {
      session.index++; session.input=''; session.selected=''; session.confidence=2; session.hints=0; session.answered=false; session.result=null; session.diagnosis=null; saveState(); render();
    });
    document.getElementById('end-practice').onclick = () => { state.practice = null; saveState(); render(); };
  }

  function renderPracticeResult(session) {
    const percent = Math.round(100 * session.score / session.tasks.length);
    const byLesson = {};
    session.tasks.forEach(task => { if (!byLesson[task.lessonId]) byLesson[task.lessonId] = { total:0 }; byLesson[task.lessonId].total++; });
    main.innerHTML = `<div class="page result-page">
      <div class="card result-hero"><div class="result-orb">${percent}%</div><div><div class="eyebrow">SMART RUN ABGESCHLOSSEN</div><h1>${session.score} von ${session.tasks.length} korrekt</h1><p>${percent >= 80 ? 'Stark. Jetzt ist zeitversetzter Abruf wichtiger als sofort noch zehn ähnliche Aufgaben.' : 'Die Fehler werden nach Ursache sortiert. Repariere zuerst den frühesten falschen Denk- oder Rechenschritt.'}</p></div></div>
      <div class="actions center"><button class="btn primary" id="practice-again">Neu mischen</button><button class="btn" id="practice-errors">Fehlerlabor</button></div>
    </div>`;
    document.getElementById('practice-again').onclick = () => { state.practice=createPractice([],10); saveState(); render(); };
    document.getElementById('practice-errors').onclick = () => { state.practice=null; route('errors'); };
  }


  function pathwayTotals(session) {
    const steps = session?.mission?.steps || [];
    const max = steps.reduce((sum, step) => sum + Number(step.points || 0), 0);
    const earned = Object.values(session?.answers || {}).reduce((sum, item) => sum + Number(item.score?.points || 0), 0);
    return { earned, max, percent: max ? Math.round(100 * earned / max) : 0 };
  }

  function startPathway(type = 'derivative') {
    const mission = ENGINE.createPathway(type);
    mission.steps.forEach(step => {
      step.lessonId = step.lessonId || mission.lessonId;
      step.skill = step.skill || getLesson(mission.lessonId)?.competencies?.[0] || 'EF';
      step.masteryDimension = step.masteryDimension || 'Verfahren';
    });
    state.pathwaySession = { active: true, completed: false, mission, index: 0, answers: {}, started: Date.now() };
    saveState(); route('pathway');
  }

  function renderPathway() {
    const session = state.pathwaySession;
    if (!session?.active && !session?.completed) {
      main.innerHTML = `<div class="page">
        ${pageHead('RECHENWEG-INTELLIGENZ', 'Nicht nur das Ergebnis zählt', 'Jede Mission bewertet Strategie, mathematische Zwischenschritte, Regelbegründung, Ergebnis und unabhängige Kontrolle getrennt.')}
        <div class="card rubric-manifest"><div><div class="eyebrow">NEUE V0.3-RUBRIK</div><h2>Eine falsche Endzahl kann trotzdem richtige Mathematik enthalten</h2><p>Die Engine vergibt Teilpunkte für korrekt erkannte Strukturen und Begründungen. Gleichzeitig zeigt sie den ersten Schritt, an dem dein Lösungsweg mathematisch abweicht.</p></div><div class="rubric-wheel"><span>Strategie</span><span>Rechnung</span><span>Warum</span><span>Kontrolle</span></div></div>
        <div class="pathway-grid">${V3.pathwayCatalog.map(([id,title,domain,lessonId]) => `<button class="card pathway-choice" data-pathway="${id}"><span>${domain}</span><h2>${title}</h2><p>${getLesson(lessonId)?.summary || 'Mehrstufige Mission mit Teilpunkten und Fehlerdiagnose.'}</p><strong>${id === 'curve' ? '7' : id === 'line' ? '5' : '4–5'} bewertete Schritte →</strong></button>`).join('')}</div>
      </div>`;
      main.querySelectorAll('[data-pathway]').forEach(button => button.onclick = () => startPathway(button.dataset.pathway));
      return;
    }
    if (session.completed) return renderPathwaySummary(session);
    renderPathwayActive(session);
  }

  function renderPathwayActive(session) {
    const mission = session.mission;
    const step = mission.steps[session.index];
    const answer = session.answers[step.id] || { input:'', selected:'', reasoning:'', confidence:3, hints:0, answered:false, score:null };
    session.answers[step.id] = answer;
    const totals = pathwayTotals(session);
    main.innerHTML = `<div class="page pathway-page">
      ${pageHead('RECHENWEG-ENGINE', mission.title, mission.context, `<div class="path-score"><strong>${totals.earned}/${totals.max}</strong><span>Punkte</span></div><button class="btn" id="pathway-exit">Missionen</button>`)}
      <div class="path-progress">${mission.steps.map((item,index)=>`<button class="${index===session.index?'active':''} ${session.answers[item.id]?.answered?'done':''}" data-path-index="${index}"><b>${index+1}</b><span>${item.title.replace(/^\d+\s*·\s*/, '')}</span></button>`).join('')}</div>
      <div class="path-layout">
        <div class="card path-task">
          <div class="lesson-meta">${pill(`Schritt ${session.index+1}/${mission.steps.length}`,'cyan')}${pill(`${step.points} Punkte`)}${pill('Teilpunkte aktiv','green')}</div>
          <h2>${step.title}</h2><p class="path-prompt">${step.prompt}</p>
          ${taskInputHTML(step, answer, 'path')}
          ${step.type !== 'explain' ? `<label class="reasoning-field"><span>Begründe deinen Schritt</span><textarea id="path-reasoning" ${answer.answered?'disabled':''} placeholder="Welche Regel nutzt du, warum ist sie hier zulässig und wie kontrollierst du sie?">${esc(answer.reasoning || '')}</textarea></label>` : ''}
          ${confidenceHTML(answer,'path')}
          <div class="question-actions"><button class="btn" id="path-hint" ${answer.answered||answer.hints>=(step.hints||[]).length?'disabled':''}>Gestuften Hinweis</button><button class="btn primary" id="path-check" ${answer.answered?'disabled':''}>Schritt bewerten</button></div>
          ${answer.hints ? `<div class="hint-stack">${(step.hints||[]).slice(0,answer.hints).map((hint,i)=>`<div class="hint"><strong>Hinweis ${i+1}</strong>${hint}</div>`).join('')}</div>`:''}
          ${answer.answered ? pathwayStepFeedback(step,answer) : ''}
          ${answer.answered ? `<div class="actions end-actions"><button class="btn primary" id="path-next">${session.index+1<mission.steps.length?'Nächster Schritt':'Mission auswerten'}</button></div>`:''}
        </div>
        <aside class="card rubric-side sticky"><h3>Bewertungsrubrik</h3><div class="rubric-line"><span>Mathematische Antwort</span><strong>${Math.max(0,step.points-(step.reasoningPoints||1))} P</strong></div><div class="rubric-line"><span>Begründung</span><strong>${step.type==='explain'?step.points:(step.reasoningPoints||1)} P</strong></div><hr><p>Eine Begründung nennt nicht nur eine Formel, sondern verbindet <strong>Voraussetzung → Regel → Wirkung → Kontrolle</strong>.</p><div class="first-error-rule"><strong>First Divergence</strong><span>Die App sucht den ersten mathematisch abweichenden Schritt, statt nur „falsch“ anzuzeigen.</span></div></aside>
      </div>
    </div>`;
    main.querySelectorAll('[data-path-option]').forEach(button=>button.onclick=()=>{answer.selected=button.dataset.pathOption;saveState();render();});
    main.querySelectorAll('[data-path-confidence]').forEach(button=>button.onclick=()=>{answer.confidence=Number(button.dataset.pathConfidence);saveState();render();});
    const input=document.getElementById('path-input'); if(input) input.oninput=e=>answer.input=e.target.value;
    const reasoning=document.getElementById('path-reasoning'); if(reasoning) reasoning.oninput=e=>answer.reasoning=e.target.value;
    document.getElementById('path-hint').onclick=()=>{answer.hints=Math.min((step.hints||[]).length,answer.hints+1);saveState();render();};
    document.getElementById('path-check').onclick=()=>{
      if(input)answer.input=input.value;if(reasoning)answer.reasoning=reasoning.value;
      const value=step.type==='choice'?answer.selected:answer.input;
      if(!String(value||'').trim())return toast('Trage zuerst deine Antwort ein.');
      answer.score=ENGINE.scorePathwayStep(step,value,answer.reasoning);answer.answered=true;
      recordAttempt(step,value,{correct:answer.score.correct},'pathway',answer.confidence||3);
      state.xp+=Math.round(answer.score.points*4);saveState();render();
    };
    document.getElementById('path-next')?.addEventListener('click',()=>{if(session.index+1<mission.steps.length){session.index++;saveState();render();}else{session.active=false;session.completed=true;session.finished=Date.now();saveState();render();}});
    document.getElementById('pathway-exit').onclick=()=>{state.pathwaySession=null;saveState();render();};
    main.querySelectorAll('[data-path-index]').forEach(button=>button.onclick=()=>{const idx=Number(button.dataset.pathIndex);if(idx<=session.index||session.answers[mission.steps[idx-1]?.id]?.answered){session.index=idx;saveState();render();}});
  }

  function pathwayStepFeedback(step,answer){
    const score=answer.score||{};const diagnosis=score.diagnosis;
    return `<div class="path-feedback ${score.correct?'correct':score.points?'partial':'wrong'}"><div class="path-feedback-head"><strong>${score.points}/${score.maxPoints} Punkte</strong><span>${score.correct?'vollständig':score.points?'teilweise tragfähig':'noch nicht tragfähig'}</span></div><div class="rubric-breakdown"><span>Antwort: ${score.answerPoints||0} P</span><span>Begründung: ${score.reasoningPoints||0} P</span></div><p>${esc(score.feedback||'')}</p>${diagnosis?`<div class="diagnosis-box"><strong>${esc(diagnosis.title)}</strong><p>${esc(diagnosis.repair)}</p></div>`:''}</div>${solutionHTML(step)}`;
  }

  function renderPathwaySummary(session){
    const totals=pathwayTotals(session);const mission=session.mission;
    main.innerHTML=`<div class="page">${pageHead('MISSION ABGESCHLOSSEN',mission.title,'Die Auswertung trennt Ergebniswissen von erklärbarem Rechenweg.')}
      <div class="card result-hero"><div class="result-orb">${totals.percent}%</div><div><div class="eyebrow">RUBRIK-ERGEBNIS</div><h1>${totals.earned}/${totals.max} Punkte</h1><p>${totals.percent>=85?'Der Lösungsweg ist stabil und erklärbar.':totals.percent>=60?'Das Verfahren sitzt teilweise; repariere die schwächsten Schritte.':'Arbeite die Mission erneut mit den Warum-Erklärungen durch.'}</p></div></div>
      <div class="card"><h3>Schrittanalyse</h3>${mission.steps.map((step,index)=>{const a=session.answers[step.id];return`<div class="exam-result-row ${a?.score?.correct?'correct':a?.score?.points?'partial':'wrong'}"><b>${index+1}</b><span>${step.title}</span><strong>${a?.score?.points||0}/${step.points}</strong></div>`}).join('')}</div>
      <div class="actions center"><button class="btn primary" id="path-repeat">Neue Variante</button><button class="btn" id="path-repair">Fehlerlabor</button><button class="btn" id="path-home">Alle Missionen</button></div></div>`;
    document.getElementById('path-repeat').onclick=()=>startPathway(mission.type);
    document.getElementById('path-repair').onclick=()=>route('errors');
    document.getElementById('path-home').onclick=()=>{state.pathwaySession=null;saveState();render();};
  }

  function renderCurveLab(){
    if(!state.curveSession){state.curveSession={mission:ENGINE.createCurveInvestigation(),index:0,answers:{},show:{f:true,fp:true,fpp:false,points:false}};saveState();}
    const session=state.curveSession,mission=session.mission,step=mission.steps[session.index];
    const answer=session.answers[step.id]||{input:'',selected:'',reasoning:'',confidence:3,hints:0,answered:false,score:null};session.answers[step.id]=answer;
    const totals=pathwayTotals({mission,answers:session.answers});
    main.innerHTML=`<div class="page curve-lab-page">${pageHead('KURVENDISKUSSIONS-SIMULATOR','Ein Graph – sieben miteinander verbundene Untersuchungen',`Gegeben: \\(f(x)=${mission.functionText}\\). Jede Rechnung verändert dein sichtbares Gesamtmodell.`,`<button class="btn" id="new-curve">Neue Funktion</button>`)}
      <div class="curve-simulator-layout"><div class="card curve-stage"><canvas id="curve-lab-canvas" width="1100" height="680"></canvas><div class="curve-toggles"><button data-curve-layer="f" class="${session.show.f?'active':''}">f</button><button data-curve-layer="fp" class="${session.show.fp?'active':''}">f′</button><button data-curve-layer="fpp" class="${session.show.fpp?'active':''}">f″</button><button data-curve-layer="points" class="${session.show.points?'active':''}">Punkte</button></div><div class="curve-insights"><span>f beantwortet: Lage</span><span>f′ beantwortet: Steigung</span><span>f″ beantwortet: Krümmung</span></div></div>
      <div class="card curve-work"><div class="step-counter"><span>Phase ${session.index+1}/${mission.steps.length}</span><strong>${totals.earned}/${totals.max} P</strong></div><h2>${step.title}</h2><p>${step.prompt}</p>${taskInputHTML(step,answer,'curve')} ${step.type!=='explain'?`<textarea id="curve-reasoning" class="reasoning-area" placeholder="Warum passt dieser Schritt?">${esc(answer.reasoning||'')}</textarea>`:''}<div class="actions"><button class="btn" id="curve-hint" ${answer.answered?'disabled':''}>Hinweis</button><button class="btn primary" id="curve-check" ${answer.answered?'disabled':''}>Prüfen</button></div>${answer.hints?`<div class="hint-stack">${(step.hints||[]).slice(0,answer.hints).map((h,i)=>`<div class="hint"><strong>Hinweis ${i+1}</strong>${h}</div>`).join('')}</div>`:''}${answer.answered?pathwayStepFeedback(step,answer):''}${answer.answered?`<button class="btn primary full" id="curve-next">${session.index+1<mission.steps.length?'Nächste Untersuchungsphase':'Gesamtbild anzeigen'}</button>`:''}</div></div>
      <div class="curve-map">${mission.steps.map((item,index)=>`<button class="${index===session.index?'active':''} ${session.answers[item.id]?.answered?'done':''}" data-curve-step="${index}"><b>${index+1}</b><span>${item.title.replace(/^\d+\s*·\s*/,'')}</span></button>`).join('')}</div></div>`;
    main.querySelectorAll('[data-curve-option]').forEach(button=>button.onclick=()=>{answer.selected=button.dataset.curveOption;saveState();render();});
    const input=document.getElementById('curve-input');if(input)input.oninput=e=>answer.input=e.target.value;const reason=document.getElementById('curve-reasoning');if(reason)reason.oninput=e=>answer.reasoning=e.target.value;
    document.getElementById('curve-hint').onclick=()=>{answer.hints=Math.min((step.hints||[]).length,answer.hints+1);saveState();render();};
    document.getElementById('curve-check').onclick=()=>{if(input)answer.input=input.value;if(reason)answer.reasoning=reason.value;const value=step.type==='choice'?answer.selected:answer.input;if(!String(value||'').trim())return toast('Antwort fehlt.');answer.score=ENGINE.scorePathwayStep(step,value,answer.reasoning);answer.answered=true;recordAttempt({...step,lessonId:'A13',skill:'A19'},value,{correct:answer.score.correct},'curve-lab',3);saveState();render();};
    document.getElementById('curve-next')?.addEventListener('click',()=>{if(session.index+1<mission.steps.length){session.index++;}else{session.show={f:true,fp:true,fpp:true,points:true};state.xp+=35;updateMastery('A13','transfer',6);toast('Kurvendiskussion abgeschlossen · +35 XP');}saveState();render();});
    document.getElementById('new-curve').onclick=()=>{state.curveSession=null;saveState();render();};
    main.querySelectorAll('[data-curve-layer]').forEach(button=>button.onclick=()=>{session.show[button.dataset.curveLayer]=!session.show[button.dataset.curveLayer];saveState();render();});
    main.querySelectorAll('[data-curve-step]').forEach(button=>button.onclick=()=>{const idx=Number(button.dataset.curveStep);if(idx<=session.index||session.answers[mission.steps[idx-1]?.id]?.answered){session.index=idx;saveState();render();}});
    drawCurveLab(session);
  }

  function drawCurveLab(session){
    const canvas=document.getElementById('curve-lab-canvas');if(!canvas)return;const ctx=canvas.getContext('2d'),m=session.mission,c=m.coefficients;const W=canvas.width,H=canvas.height,xmin=-6,xmax=6,ymin=-18,ymax=18;const X=x=>(x-xmin)/(xmax-xmin)*W,Y=y=>H-(y-ymin)/(ymax-ymin)*H;
    ctx.clearRect(0,0,W,H);ctx.fillStyle=document.documentElement.classList.contains('light')?'#f8fbff':'#071321';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(130,165,205,.14)';ctx.lineWidth=1;for(let i=-18;i<=18;i++){ctx.beginPath();ctx.moveTo(0,Y(i));ctx.lineTo(W,Y(i));ctx.stroke();}for(let i=-6;i<=6;i++){ctx.beginPath();ctx.moveTo(X(i),0);ctx.lineTo(X(i),H);ctx.stroke();}ctx.strokeStyle='rgba(230,244,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(0),0);ctx.lineTo(X(0),H);ctx.moveTo(0,Y(0));ctx.lineTo(W,Y(0));ctx.stroke();
    const f=x=>c.a*x**3+c.b*x+c.d,fp=x=>3*c.a*x*x+c.b,fpp=x=>6*c.a*x;
    if(session.show.f)plot(ctx,f,'#46d7ff',X,Y,xmin,xmax);if(session.show.fp)plot(ctx,fp,'#ffb45e',X,Y,xmin,xmax);if(session.show.fpp)plot(ctx,fpp,'#8bffb2',X,Y,xmin,xmax);
    if(session.show.points){ctx.fillStyle='#ffffff';[...m.extremaX.map((x,i)=>[x,m.extremaY[i]]),m.inflection].forEach(([x,y])=>{ctx.beginPath();ctx.arc(X(x),Y(y),7,0,Math.PI*2);ctx.fill();});}
  }

  function renderSpaceLab(){
    if(!state.spaceSession)state.spaceSession={scene:ENGINE.createSpaceScene('random'),yaw:-35,pitch:24,zoom:38,selected:'',pointInput:'',checked:false,result:null};
    const s=state.spaceSession,scene=s.scene;const choices=['schneidend','parallel','identisch','windschief'];
    main.innerHTML=`<div class="page">${pageHead('3D-VEKTORRAUM','Geraden wirklich räumlich sehen','Drehe das Koordinatensystem, vergleiche Richtungen und entscheide erst danach algebraisch.',`<button class="btn" id="new-space">Neue Szene</button>`)}
      <div class="space-layout"><div class="card space-canvas-wrap"><canvas id="space-canvas" width="1000" height="720"></canvas><div class="space-controls"><label>Drehung <input id="space-yaw" type="range" min="-180" max="180" value="${s.yaw}"></label><label>Neigung <input id="space-pitch" type="range" min="-75" max="75" value="${s.pitch}"></label><label>Zoom <input id="space-zoom" type="range" min="22" max="60" value="${s.zoom}"></label></div><div class="space-legend"><span><i class="gline"></i>g</span><span><i class="hline"></i>h</span></div></div>
      <div class="card space-task"><div class="eyebrow">RAUMSZENE</div><h2>Lagebeziehung analysieren</h2><div class="space-equations"><div>\\(g:\\vec x=${vectorHTML(scene.g.a)}+r${vectorHTML(scene.g.u)}\\)</div><div>\\(h:\\vec x=${vectorHTML(scene.h.a)}+s${vectorHTML(scene.h.u)}\\)</div></div><p>Arbeite in dieser Reihenfolge: Richtungsvektoren vergleichen → gegebenenfalls Punktprobe oder Parameter-LGS → dritte Koordinate kontrollieren.</p><div class="options compact-options">${choices.map((item,index)=>{const letter=String.fromCharCode(65+index);return`<button class="option ${s.selected===item?'selected':''}" data-space-choice="${item}" ${s.checked?'disabled':''}><strong>${letter}.</strong><span>${item}</span></button>`}).join('')}</div>${scene.intersection?`<label><span>Möglicher Schnittpunkt</span><input class="answer-input" id="space-point" value="${esc(s.pointInput)}" placeholder="(x|y|z)" ${s.checked?'disabled':''}></label>`:''}<button class="btn primary full" id="space-check" ${s.checked?'disabled':''}>Räumliche Analyse prüfen</button>${s.checked?spaceFeedback(s):''}</div></div></div>`;
    main.querySelectorAll('[data-space-choice]').forEach(button=>button.onclick=()=>{s.selected=button.dataset.spaceChoice;saveState();render();});
    ['yaw','pitch','zoom'].forEach(key=>document.getElementById(`space-${key}`).oninput=e=>{s[key]=Number(e.target.value);saveState();drawSpace(s);});
    document.getElementById('space-check').onclick=()=>{const point=document.getElementById('space-point');if(point)s.pointInput=point.value;s.checked=true;const classCorrect=s.selected===scene.classification;let pointCorrect=true;if(scene.intersection)pointCorrect=ENGINE.checkAnswer({type:'text',answerKind:'point',answer:scene.intersection},s.pointInput).correct;s.result={classCorrect,pointCorrect,correct:classCorrect&&pointCorrect};if(s.result.correct){state.xp+=28;updateMastery('G5','understanding',4);updateMastery('G5','transfer',4);}else{state.errors.unshift({id:Date.now()+Math.random(),lessonId:'G5',taskId:scene.id,prompt:'3D-Lagebeziehung',user:`${s.selected} ${s.pointInput}`,answer:scene.classification,explanation:scene.explanation,solutionSteps:scene.reasoning,diagnosis:{type:'Koordinaten',title:'Räumliche Lage falsch eingeordnet',repair:'Vergleiche zuerst die Richtungsvektoren und prüfe danach alle drei Koordinaten.'},created:Date.now(),resolved:false});}saveState();render();};
    document.getElementById('new-space').onclick=()=>{state.spaceSession=null;saveState();render();};drawSpace(s);
  }

  function vectorHTML(v){return `\\begin{pmatrix}${v.join('\\\\')}\\end{pmatrix}`;}
  function spaceFeedback(s){const scene=s.scene;return`<div class="feedback ${s.result.correct?'correct':'wrong'}"><strong>${s.result.correct?'✓ Vollständige Raumanalyse korrekt':'✕ Analyse noch nicht vollständig'}</strong><p>${scene.explanation}</p></div><div class="solution-panel"><div class="solution-title">Entscheidungsweg</div><ol class="solution-steps">${scene.reasoning.map(x=>`<li>${x}</li>`).join('')}</ol></div>`;}
  function drawSpace(s){const canvas=document.getElementById('space-canvas');if(!canvas)return;const ctx=canvas.getContext('2d'),W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);ctx.fillStyle=document.documentElement.classList.contains('light')?'#f8fbff':'#071321';ctx.fillRect(0,0,W,H);const yaw=s.yaw*Math.PI/180,pitch=s.pitch*Math.PI/180,scale=s.zoom;const project=p=>{const x1=p[0]*Math.cos(yaw)-p[2]*Math.sin(yaw),z1=p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw),y1=p[1]*Math.cos(pitch)-z1*Math.sin(pitch);return[W/2+x1*scale,H/2-y1*scale]};const line=(a,u,color)=>{ctx.strokeStyle=color;ctx.lineWidth=5;ctx.beginPath();for(let i=0;i<=160;i++){const t=-8+16*i/160,p=a.map((x,k)=>x+t*u[k]),q=project(p);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);}ctx.stroke();};const axes=[[[0,0,0],[1,0,0],'#ff6b7a'],[[0,0,0],[0,1,0],'#7dff9d'],[[0,0,0],[0,0,1],'#5ebdff']];ctx.lineWidth=2;axes.forEach(([a,u,color])=>{ctx.strokeStyle=color;ctx.beginPath();const p1=project(u.map(x=>-7*x)),p2=project(u.map(x=>7*x));ctx.moveTo(...p1);ctx.lineTo(...p2);ctx.stroke();});line(s.scene.g.a,s.scene.g.u,'#46d7ff');line(s.scene.h.a,s.scene.h.u,'#ffb45e');if(s.scene.intersection){const q=project(s.scene.intersection);ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(q[0],q[1],8,0,Math.PI*2);ctx.fill();}}

  function buildWeeklyPlan(){const stats=DATA.lessons.map(l=>({id:l.id,title:l.title,mastery:lessonMastery(l.id)}));const due=DATA.lessons.filter(l=>(state.review[l.id]?.due||Infinity)<=Date.now()).map(l=>l.id);const errors=state.errors.filter(e=>!e.resolved).map(e=>e.lessonId);state.weeklyPlan=ENGINE.createWeeklyPlan(stats,due,errors);saveState();}
  function renderPlanner(){if(!state.weeklyPlan)buildWeeklyPlan();const plan=state.weeklyPlan;const all=plan.days.flatMap(d=>d.blocks),done=all.filter(b=>b.completed).length,minutes=all.filter(b=>!b.completed).reduce((s,b)=>s+b.minutes,0);main.innerHTML=`<div class="page">${pageHead('ADAPTIVER WOCHENPLAN','Sieben Tage, die Erinnern statt Vergessen organisieren','Der Plan kombiniert fälligen Abruf, schwächste Mastery, offene Fehler und gemischten Transfer.',`<button class="btn" id="regenerate-plan">Neu berechnen</button>`)}<div class="grid grid-3"><div class="card stat-card"><div class="label">Fortschritt</div><div class="value">${done}/${all.length}</div></div><div class="card stat-card"><div class="label">Offene Lernzeit</div><div class="value">${minutes}</div><div class="delta">Minuten</div></div><div class="card stat-card"><div class="label">Prinzip</div><div class="value small-value">Abruf</div><div class="delta">vor erneutem Lesen</div></div></div><div class="plan-principles">${plan.principles.map(p=>`<span>${p}</span>`).join('')}</div><div class="week-grid">${plan.days.map(day=>`<section class="card day-card"><div class="day-head"><div><span>TAG ${day.day+1}</span><h2>${day.label}</h2></div><strong>${day.blocks.reduce((s,b)=>s+b.minutes,0)} Min.</strong></div>${day.blocks.map(block=>`<div class="plan-block ${block.completed?'done':''}"><button data-plan-toggle="${block.id}">${block.completed?'✓':'○'}</button><div><span>${block.kind} · ${block.minutes} Min.</span><strong>${esc(block.title)}</strong></div><button class="plan-start" data-plan-start="${block.id}">Start</button></div>`).join('')}</section>`).join('')}</div></div>`;document.getElementById('regenerate-plan').onclick=()=>{buildWeeklyPlan();render();};main.querySelectorAll('[data-plan-toggle]').forEach(button=>button.onclick=()=>{const block=all.find(b=>b.id===button.dataset.planToggle);block.completed=!block.completed;if(block.completed){state.xp+=5;state.totalMinutes+=block.minutes;}saveState();render();});main.querySelectorAll('[data-plan-start]').forEach(button=>button.onclick=()=>{const block=all.find(b=>b.id===button.dataset.planStart);if(block.kind==='Mix')return route('practice');if(block.kind==='Kontrolle'&&state.errors.some(e=>!e.resolved&&e.lessonId===block.lessonId))return route('errors');openLesson(block.lessonId||todayRecommendation().id,block.kind==='Abruf'?'retain':'overview');});}

  function renderDiagnostic() {
    if (!state.diagnostic?.active) {
      main.innerHTML = `<div class="page">
        ${pageHead('EINGANGSDIAGNOSE', 'Finde die echte Ursache', 'Zwölf kurze Aufgaben unterscheiden Algebra-, Funktions-, Analysis- und Geometrielücken. Eine falsche Ableitung kann beispielsweise eigentlich ein Potenz- oder Vorzeichenproblem sein.')}
        <div class="card diagnostic-intro"><div><h2>12 Aufgaben · etwa 15 Minuten</h2><p>Keine Note. Das Ergebnis erzeugt eine priorisierte Reparaturroute.</p></div><button class="btn primary" id="start-diagnostic">Diagnose starten</button></div>
        ${state.diagnostic?.result ? diagnosticResultHTML(state.diagnostic.result) : ''}
      </div>`;
      document.getElementById('start-diagnostic').onclick = () => {
        state.diagnostic = { active:true,index:0,score:0,answers:[],input:'',selected:'',confidence:2,hints:0,answered:false,result:null };
        saveState(); render();
      };
      main.querySelectorAll('[data-repair-lesson]').forEach(button => {
        button.onclick = () => route(`lesson/${button.dataset.repairLesson}`);
      });
      return;
    }
    const session = state.diagnostic;
    if (session.index >= DATA.diagnostic.length) return finishDiagnostic(session);
    const raw = DATA.diagnostic[session.index];
    const task = { ...raw, lessonId: lessonForSkill(raw.skill), masteryDimension:'Verständnis', hints: raw.hints || [raw.hint || 'Bestimme zuerst die zugrunde liegende Regel.'], solutionSteps: raw.solutionSteps || [raw.explanation], answerKind: raw.answerKind || (raw.type==='numeric'?'numeric':raw.type==='choice'?'choice':'text') };
    main.innerHTML = `<div class="page focus-page">${pageHead('DIAGNOSE', `Aufgabe ${session.index+1} von ${DATA.diagnostic.length}`, 'Arbeite ohne Hilfen, damit die Reparaturroute zuverlässig wird.')} ${progress(100*session.index/DATA.diagnostic.length)} ${taskCardHTML(task,session,'diagnostic','Diagnoseaufgabe')} ${session.answered?`<div class="actions end-actions"><button class="btn primary" id="diagnostic-next">Weiter</button></div>`:''}</div>`;
    bindTaskCard(task,session,'diagnostic','diagnostic',result=>{session.answers.push({skill:task.skill,correct:result.correct,lessonId:task.lessonId});if(result.correct)session.score++;});
    document.getElementById('diagnostic-next')?.addEventListener('click',()=>{session.index++;session.input='';session.selected='';session.confidence=2;session.hints=0;session.answered=false;session.result=null;session.diagnosis=null;saveState();render();});
  }

  function lessonForSkill(skill) {
    return DATA.compToLessons[skill]?.[0] || 'F0';
  }

  function finishDiagnostic(session) {
    const groups = { Grundlagen:[], Analysis:[], Geometrie:[] };
    session.answers.forEach(item => {
      const domain = getLesson(item.lessonId)?.domain || 'Grundlagen';
      groups[domain].push(item.correct);
    });
    const result = Object.fromEntries(Object.entries(groups).map(([key,values])=>[key,values.length?Math.round(100*values.filter(Boolean).length/values.length):0]));
    const weakestLessons = session.answers.filter(a=>!a.correct).map(a=>a.lessonId).filter((id,i,arr)=>arr.indexOf(id)===i).slice(0,5);
    state.diagnostic = { active:false,result:{score:session.score,total:DATA.diagnostic.length,groups,percentages:result,weakestLessons,created:Date.now()} };
    saveState(); render();
  }

  function diagnosticResultHTML(result) {
    return `<div class="card diagnostic-result"><div class="result-band"><strong>${result.score}/${result.total}</strong><span>Diagnosepunkte</span></div><div class="grid grid-3">${Object.entries(result.percentages).map(([name,p])=>`<div class="dimension-card"><span>${name}</span><strong>${p}%</strong>${progress(p)}</div>`).join('')}</div><h3>Priorisierte Reparaturroute</h3><div class="repair-route">${(result.weakestLessons||[]).map((id,i)=>`<button data-repair-lesson="${id}"><b>${i+1}</b><span>${getLesson(id)?.title||id}</span></button>`).join('')||'<p>Keine eindeutige Grundlücke erkannt. Nutze gemischtes Training.</p>'}</div></div>`;
  }

  function renderExam() {
    const session = state.examSession;
    if (!session?.active && !session?.submitted) {
      const cards = [
        ['basis','60 Minuten','Grundlagen-Check','Algebra, Funktionen, Steigung, erste Analysis und Vektorbasics.','10 Aufgaben'],
        ['analysis','90 Minuten','Analysis-Klausur EF','Funktionen, Änderungsraten, Ableitungen, Tangenten, Extrema, Wendepunkte und Begründungen.','11 Aufgaben'],
        ['geometry','90 Minuten','Vektorgeometrie-Klausur','Vektoroperationen, Figurennachweise, Geraden, Punktproben, Lagebeziehungen und LGS.','9 Aufgaben'],
        ['full','120 Minuten','Große EF-NRW-Simulation','Gemischte Analysis und Vektorgeometrie mit Rechenweg-Rubrik und automatisierten Teilpunkten.','13 Aufgaben']
      ];
      main.innerHTML = `<div class="page">
        ${pageHead('KLAUSURZENTRUM 3.0', 'NRW-EF mit Teilpunkten und Erwartungshorizont', 'Neben dem Ergebnis werden Rechenweg und Begründung bewertet. Die Teilpunkte sind eine transparente automatisierte Näherung – kein Ersatz für die endgültige Lehrkraftbewertung.')}
        <div class="exam-blueprint-note"><strong>V0.3 neu:</strong><span>Ergebnis-Punkte + Begründungs-Punkte + Teilkomponenten + thematische Reparaturroute</span></div>
        <div class="grid grid-2 exam-choice-grid">${cards.map(([id,time,title,desc,count])=>`<button class="card exam-choice" data-exam="${id}"><span>${time}</span><h2>${title}</h2><p>${desc}</p><strong>${count}</strong></button>`).join('')}</div>
        ${state.examHistory?.length ? `<div class="card"><h3>Letzte Simulationen</h3>${state.examHistory.slice(0,5).map(item=>`<div class="history-row"><span>${formatDate(item.created,true)}</span><strong>${item.title}</strong><b>${item.percent}% · ${item.grade}</b></div>`).join('')}</div>`:''}
      </div>`;
      main.querySelectorAll('[data-exam]').forEach(button=>button.onclick=()=>startExam(button.dataset.exam));
      return;
    }
    if (session.submitted) {
      main.innerHTML=`<div class="page">${pageHead('KLAUSURAUSWERTUNG',session.exam.title,'Teilpunkte, Erwartungshorizont, Zeitnutzung und priorisierte Reparaturroute.')}${examResultHTML(session)}</div>`;
      bindExamResult(session); return;
    }
    renderExamActive(session);
  }

  function startExam(level) {
    const exam = ENGINE.createExamV3 ? ENGINE.createExamV3(level) : ENGINE.createExam(level);
    state.examSession = {active:true,submitted:false,exam,index:0,answers:{},started:Date.now(),finished:null};
    saveState(); route('exam');
  }

  function renderExamActive(session) {
    const exam=session.exam, task=exam.tasks[session.index];
    const answer=session.answers[task.id]||{input:'',selected:'',work:'',confidence:3,hints:0,answered:false,result:null,score:null};
    session.answers[task.id]=answer;
    const elapsed=(Date.now()-session.started)/1000;
    const remaining=exam.minutes*60-elapsed;
    main.innerHTML=`<div class="page exam-page">${pageHead('KLAUSURMODUS',exam.title,'Keine Hinweise und keine Lösungen. Zeige deinen Rechenweg, damit Teilpunkte bewertet werden können.',`<div class="exam-timer" id="exam-timer">${formatDuration(remaining)}</div><button class="btn danger" id="submit-exam">Abgeben</button>`)}
      <div class="exam-progress-line">${progress(100*(session.index+1)/exam.tasks.length)}<span>Aufgabe ${session.index+1}/${exam.tasks.length}</span></div>
      <div class="exam-nav">${exam.tasks.map((t,i)=>`<button class="${i===session.index?'active':''} ${session.answers[t.id]?.input||session.answers[t.id]?.selected?'filled':''}" data-exam-index="${i}">${i+1}</button>`).join('')}</div>
      <div class="card exam-task"><div class="lesson-meta">${pill(`Aufgabe ${task.examNumber}`,'cyan')}${pill(`${task.points} Punkte`)}${pill(`NRW ${task.skill}`,'green')}</div><h2>${task.prompt}</h2>${taskInputHTML(task,answer,'examanswer')}
      ${task.type!=='choice'?`<label class="exam-work"><span>Rechenweg / Begründung <b>${task.reasoningPoints||1} Punkt</b></span><textarea id="exam-work" placeholder="Notiere Formelwahl, Zwischenschritte, Regeln und Kontrolle …">${esc(answer.work||'')}</textarea></label>`:''}
      <div class="rubric-preview">${(task.rubric||[]).map(item=>`<span>${item.label}: <strong>${item.points} P</strong></span>`).join('')}</div>
      <div class="exam-actions"><button class="btn" id="exam-prev" ${session.index===0?'disabled':''}>← Zurück</button><button class="btn primary" id="exam-next">${session.index+1<exam.tasks.length?'Speichern & weiter →':'Zur Abgabe'}</button></div></div>
    </div>`;
    main.querySelectorAll('[data-examanswer-option]').forEach(button=>button.onclick=()=>{answer.selected=button.dataset.examanswerOption;saveState();render();});
    const input=document.getElementById('examanswer-input');if(input)input.oninput=e=>{answer.input=e.target.value;saveState();};
    const work=document.getElementById('exam-work');if(work)work.oninput=e=>{answer.work=e.target.value;saveState();};
    const persist=()=>{if(input)answer.input=input.value;if(work)answer.work=work.value;saveState();};
    main.querySelectorAll('[data-exam-index]').forEach(button=>button.onclick=()=>{persist();session.index=Number(button.dataset.examIndex);saveState();render();});
    document.getElementById('exam-prev').onclick=()=>{persist();session.index--;saveState();render();};
    document.getElementById('exam-next').onclick=()=>{persist();if(session.index+1<exam.tasks.length){session.index++;saveState();render();}else confirmSubmitExam(session);};
    document.getElementById('submit-exam').onclick=()=>{persist();confirmSubmitExam(session);};
    clearInterval(timerHandle);timerHandle=setInterval(()=>{const el=document.getElementById('exam-timer');if(!el)return;const rem=exam.minutes*60-(Date.now()-session.started)/1000;el.textContent=formatDuration(rem);if(rem<=0){clearInterval(timerHandle);submitExam(session);}},1000);
  }

  function confirmSubmitExam(session){
    const unanswered=session.exam.tasks.filter(t=>{const a=session.answers[t.id];return !String(t.type==='choice'?a?.selected:a?.input||'').trim();}).length;
    if(unanswered&& !confirm(`${unanswered} Aufgaben sind noch leer. Trotzdem abgeben?`))return;
    submitExam(session);
  }

  function submitExam(session){
    clearInterval(timerHandle);let points=0;
    session.exam.tasks.forEach(task=>{
      const a=session.answers[task.id]||{};const value=task.type==='choice'?a.selected:a.input;
      const score=ENGINE.scoreExamTask ? ENGINE.scoreExamTask(task,value,a.work||'') : {...ENGINE.checkAnswer(task,value),points:ENGINE.checkAnswer(task,value).correct?task.points:0,maxPoints:task.points};
      a.score=score;a.result={correct:score.correct};a.answered=true;points+=score.points;
      recordAttempt(task,value,{correct:score.correct},'exam-v3',3);
    });
    session.points=Math.round(points*2)/2;session.finished=Date.now();session.active=false;session.submitted=true;
    const percent=Math.round(100*session.points/session.exam.totalPoints),grade=gradeForPercent(percent);
    state.examHistory.unshift({id:session.exam.id,title:session.exam.title,points:session.points,total:session.exam.totalPoints,percent,grade,created:session.finished,duration:session.finished-session.started});
    state.examHistory=state.examHistory.slice(0,20);saveState();render();
  }

  function gradeForPercent(p){if(p>=95)return'1+';if(p>=90)return'1';if(p>=85)return'1−';if(p>=80)return'2+';if(p>=75)return'2';if(p>=70)return'2−';if(p>=65)return'3+';if(p>=60)return'3';if(p>=55)return'3−';if(p>=50)return'4+';if(p>=45)return'4';if(p>=39)return'4−';if(p>=30)return'5';return'6';}

  function examResultHTML(session){
    const exam=session.exam,p=Math.round(100*(session.points||0)/exam.totalPoints);const weak=exam.tasks.filter(t=>(session.answers[t.id]?.score?.points||0)<t.points*0.6);
    const domainScores={};exam.tasks.forEach(t=>{const d=getLesson(t.lessonId)?.domain||'Grundlagen';if(!domainScores[d])domainScores[d]={got:0,max:0};domainScores[d].got+=session.answers[t.id]?.score?.points||0;domainScores[d].max+=t.points;});
    const duration=Math.round((session.finished-session.started)/60000);
    return `<div class="exam-result"><div class="card result-hero"><div class="result-orb">${p}%</div><div><div class="eyebrow">ERGEBNIS MIT TEILPUNKTEN</div><h1>${session.points||0} / ${exam.totalPoints} Punkte · Note ca. ${gradeForPercent(p)}</h1><p>Bearbeitungszeit: ${duration} Min. Die automatische Note und Teilpunktvergabe sind eine Lern-Näherung; der detaillierte Erwartungshorizont zeigt, wie sie zustande kommt.</p></div></div>
      <div class="grid grid-3">${Object.entries(domainScores).map(([name,v])=>`<div class="card dimension-card"><span>${name}</span><strong>${Math.round(100*v.got/v.max)}%</strong>${progress(100*v.got/v.max)}<small>${Math.round(v.got*2)/2}/${v.max} P</small></div>`).join('')}</div>
      <div class="card"><h3>Erwartungshorizont pro Aufgabe</h3>${exam.tasks.map(t=>{const a=session.answers[t.id]||{},score=a.score||{};return`<details class="exam-detail ${score.correct?'correct':score.points?'partial':'wrong'}"><summary><b>${t.examNumber}</b><span>${t.title}</span><strong>${score.points||0}/${t.points}</strong></summary><div class="exam-rubric-detail"><div><span>Ergebnis / Objekt</span><strong>${score.answerPoints||0}/${t.answerPoints||Math.max(1,t.points-1)}</strong></div><div><span>Rechenweg / Begründung</span><strong>${score.reasoningPoints||0}/${t.reasoningPoints||1}</strong></div></div><p><strong>Antwort:</strong> ${esc(t.type==='choice'?a.selected:a.input||'–')}</p><p><strong>Rechenweg:</strong> ${esc(a.work||'–')}</p><div class="diagnosis-box"><strong>${esc(score.diagnosis?.title||score.answerNote||'Auswertung')}</strong><p>${esc(score.diagnosis?.repair||score.reasoningNote||'')}</p></div>${solutionHTML(t)}</details>`}).join('')}</div>
      <div class="card repair-priority"><h3>Priorisierte Reparaturroute</h3>${weak.length?weak.map((t,i)=>`<button data-exam-lesson="${t.lessonId}"><b>${i+1}</b><span>${getLesson(t.lessonId)?.title||t.title}</span><strong>${session.answers[t.id]?.score?.points||0}/${t.points} P</strong></button>`).join(''):'<p>Alle Aufgaben liegen mindestens im tragfähigen Bereich. Nutze jetzt zeitversetzten Abruf.</p>'}</div>
      <div class="actions center"><button class="btn primary" id="new-exam">Neue Klausur</button><button class="btn" id="exam-repair">${weak.length} Bereiche reparieren</button></div></div>`;
  }

  function bindExamResult(session){document.getElementById('new-exam').onclick=()=>{state.examSession=null;saveState();render();};document.getElementById('exam-repair').onclick=()=>route('errors');main.querySelectorAll('[data-exam-lesson]').forEach(button=>button.onclick=()=>openLesson(button.dataset.examLesson,'deep'));}

  function pathwayTypeForLesson(lessonId) {
    if (lessonId === 'F0') return 'linear';
    if (lessonId === 'F2' || lessonId === 'A3') return 'quadratic';
    if (lessonId === 'A6' || lessonId === 'A7') return 'rate';
    if (lessonId === 'A10' || lessonId === 'A8' || lessonId === 'A9') return 'derivative';
    if (lessonId === 'A11') return 'extrema';
    if (lessonId === 'A12') return 'inflection';
    if (lessonId === 'A13' || lessonId === 'A14') return 'curve';
    if (lessonId?.startsWith('G')) return 'line';
    return null;
  }

  function repairPhasesFor(error) {
    const raw = `${error.diagnosis?.type || ''} ${error.diagnosis?.title || ''}`.toLowerCase();
    let key = 'Verfahren';
    if (raw.includes('konzept')) key = 'Konzept';
    else if (raw.includes('algebra')) key = 'Algebra';
    else if (raw.includes('vorzeichen')) key = 'Vorzeichen';
    else if (raw.includes('vollständig') || raw.includes('lösung')) key = 'Vollständigkeit';
    else if (raw.includes('koordinat')) key = 'Koordinaten';
    else if (raw.includes('interpret')) key = 'Interpretation';
    else if (raw.includes('flücht') || raw.includes('auslass')) key = 'Flüchtigkeit';
    return { key, phases: V3.diagnosisPaths[key] || V3.diagnosisPaths.Verfahren };
  }

  function renderErrors() {
    const unresolved=state.errors.filter(error=>!error.resolved);
    const groups={};unresolved.forEach(error=>{const key=error.diagnosis?.type||'Unklassifiziert';(groups[key]||(groups[key]=[])).push(error);});
    main.innerHTML=`<div class="page">${pageHead('FEHLERLABOR','Fehler werden zerlegt und repariert','Nicht „falsch“ ist die Diagnose. Entscheidend ist, ob der Fehler aus Konzept, Verfahren, Algebra, Koordinaten, Vollständigkeit oder Flüchtigkeit entstand.',`<button class="btn danger" id="clear-resolved">Erledigte löschen</button>`)}
      <div class="grid grid-4">${Object.entries(groups).slice(0,4).map(([type,items])=>`<div class="card stat-card"><div class="label">${esc(type)}</div><div class="value">${items.length}</div><div class="delta">offene Fehler</div></div>`).join('')||'<div class="card empty"><h3>Keine offenen Fehler</h3></div>'}</div>
      <div class="error-lab-list">${unresolved.map(error=>`<article class="card error-lab-card"><div class="error-head"><div>${pill(error.diagnosis?.type||'Fehler','danger')}<small>${formatDate(error.created,true)} · ${getLesson(error.lessonId)?.title||error.lessonId}</small></div><button class="btn small" data-resolve-error="${error.id}">Als repariert prüfen</button></div><h3>${error.prompt}</h3><div class="error-comparison"><div><span>Deine Antwort</span><strong>${esc(error.user)}</strong></div><div><span>Erwartet</span><strong>${esc(Array.isArray(error.answer)?error.answer.join(', '):error.answer)}</strong></div></div><div class="diagnosis-box"><strong>${esc(error.diagnosis?.title||'Fehlerursache')}</strong><p>${esc(error.diagnosis?.repair||'Vergleiche den ersten abweichenden Schritt.')}</p></div><details><summary>Vollständigen Lösungsweg öffnen</summary>${solutionHTML(error)}</details>${error.reflection?`<div class="saved-reflection"><strong>Deine Reflexion</strong><p>${esc(error.reflection)}</p></div>`:''}${(()=>{const repair=repairPhasesFor(error);return `<div class="repair-protocol"><strong>${repair.key}-Reparatur in drei Stufen</strong><ol>${repair.phases.map(p=>`<li>${esc(p)}</li>`).join('')}</ol></div>`})()}<div class="actions"><button class="btn primary" data-repair-task="${error.id}">Parallelaufgabe</button><button class="btn" data-repair-path="${error.id}">Rechenweg-Mission</button></div></article>`).join('')}</div>
    </div>`;
    main.querySelectorAll('[data-resolve-error]').forEach(button=>button.onclick=()=>{const error=state.errors.find(e=>String(e.id)===button.dataset.resolveError);if(error){error.resolved=true;state.xp+=10;saveState();render();}});
    main.querySelectorAll('[data-repair-task]').forEach(button=>button.onclick=()=>{const error=state.errors.find(e=>String(e.id)===button.dataset.repairTask);if(!error)return;const gen=generatorForLesson(error.lessonId);startGenerator(gen);});
    main.querySelectorAll('[data-repair-path]').forEach(button=>button.onclick=()=>{const error=state.errors.find(e=>String(e.id)===button.dataset.repairPath);if(!error)return;const type=pathwayTypeForLesson(error.lessonId);if(type)startPathway(type);else openLesson(error.lessonId,'deep');});
    document.getElementById('clear-resolved').onclick=()=>{state.errors=state.errors.filter(e=>!e.resolved);saveState();render();};
  }

  function renderAnalytics() {
    const last30=state.attemptLog.filter(a=>a.created>Date.now()-30*86400e3);
    const errorTypes={};state.errors.forEach(e=>{const k=e.diagnosis?.type||'Unklassifiziert';errorTypes[k]=(errorTypes[k]||0)+1;});
    const weakest=[...DATA.lessons].sort((a,b)=>lessonMastery(a.id)-lessonMastery(b.id)).slice(0,8);
    main.innerHTML=`<div class="page">${pageHead('LERNANALYSE','Was wirklich besser wird','Die Analyse trennt Aktivität von Können. Viele bearbeitete Aufgaben sind nur dann Fortschritt, wenn Transfer und späterer Abruf ebenfalls steigen.')}
      <div class="grid grid-4"><div class="card stat-card"><div class="label">Versuche 30 Tage</div><div class="value">${last30.length}</div></div><div class="card stat-card"><div class="label">Trefferquote</div><div class="value">${last30.length?Math.round(100*last30.filter(a=>a.correct).length/last30.length):0}%</div></div><div class="card stat-card"><div class="label">Erklärungen</div><div class="value">${Object.values(state.reflections).flat().length}</div></div><div class="card stat-card"><div class="label">Reparierte Fehler</div><div class="value">${state.errors.filter(e=>e.resolved).length}</div></div></div>
      <div class="grid grid-2"><div class="card"><h3>Mastery-Dimensionen</h3>${DIMENSIONS.map(([key,label])=>`<div class="skill-row"><span>${label}</span>${progress(dimensionAverage(key))}<strong>${Math.round(dimensionAverage(key))}%</strong></div>`).join('')}</div><div class="card"><h3>Fehler-DNA</h3>${Object.entries(errorTypes).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([type,count])=>`<div class="error-type-row"><span>${esc(type)}</span><strong>${count}</strong></div>`).join('')||'<p>Noch zu wenig Daten.</p>'}</div></div>
      <div class="card"><h3>Schwächste Module</h3><div class="weak-table">${weakest.map((lesson,i)=>`<button data-analytics-lesson="${lesson.id}"><b>${i+1}</b><span>${lesson.title}</span>${progress(lessonMastery(lesson.id))}<strong>${Math.round(lessonMastery(lesson.id))}%</strong></button>`).join('')}</div></div>
      <div class="card"><h3>Letzte Lernereignisse</h3><div class="timeline">${state.attemptLog.slice(0,12).map(item=>`<div class="timeline-item ${item.correct?'correct':'wrong'}"><i></i><div><strong>${getLesson(item.lessonId)?.title||item.lessonId}</strong><span>${item.context} · Sicherheit ${item.confidence}/4 · ${formatDate(item.created,true)}</span></div></div>`).join('')||'<p>Noch keine Versuche.</p>'}</div></div>
    </div>`;
    main.querySelectorAll('[data-analytics-lesson]').forEach(button=>button.onclick=()=>openLesson(button.dataset.analyticsLesson,'overview'));
  }

  function renderFormulas() {
    main.innerHTML=`<div class="page">${pageHead('FORMELWERK','Formeln mit Bedeutung und Einsatzbedingung','Eine Formel ist erst nützlich, wenn du weißt, was ihre Größen bedeuten, wann sie gilt und wie du das Ergebnis kontrollierst.',`<input class="search" id="formula-search" placeholder="Formel oder Thema suchen …">`)}<div id="formula-results">${formulaHTML('')}</div></div>`;
    document.getElementById('formula-search').oninput=e=>{document.getElementById('formula-results').innerHTML=formulaHTML(e.target.value);typeset();};
  }

  function formulaHTML(term){const t=term.toLowerCase();return DATA.formulaGroups.map(group=>{const items=group.items.filter(item=>item[0].toLowerCase().includes(t)||item[1].toLowerCase().includes(t));if(!items.length)return'';return`<section class="formula-group"><div class="section-title"><h2>${group.title}</h2></div><div class="formula-grid">${items.map(([name,formula])=>`<div class="card formula-card"><h4>${name}</h4><div class="formula-render">${formula}</div><p>${formulaMeaning(name)}</p></div>`).join('')}</div></section>`;}).join('');}
  function formulaMeaning(name){
    const n=name.toLowerCase();
    if(n.includes('symmetrie'))return'Prüfe die Gleichung für alle zulässigen x-Werte; einzelne Beispielwerte reichen nicht als Beweis.';
    if(n.includes('faktorsatz'))return'Eine Nullstelle r entspricht einem linearen Faktor (x−r) und umgekehrt.';
    if(n.includes('transformation'))return'Außen verändert y, innen verändert x mit umgekehrter Verschiebungsrichtung.';
    if(n.includes('summenregel'))return'Jeder Summand wird getrennt abgeleitet; anschließend werden die Ergebnisse wieder addiert.';
    if(n.includes('faktorregel'))return'Ein konstanter Faktor bleibt beim Ableiten vor der Funktion stehen.';
    if(n.includes('normal'))return'Gilt für senkrechte Geraden mit endlichen, von null verschiedenen Steigungen.';
    if(n.includes('monotonie'))return'Das Vorzeichen von f′ übersetzt sich in Steigen oder Fallen auf ganzen Intervallen.';
    if(n.includes('gekrümmt'))return'Das Vorzeichen von f″ beschreibt, in welche Richtung sich die Tangentensteigung verändert.';
    if(n.includes('wendekriterium'))return'Nur f″=0 reicht nicht; ein tatsächlicher Krümmungswechsel muss nachgewiesen werden.';
    if(n.includes('kollinear'))return'Ein einziger gemeinsamer Faktor muss alle Komponenten gleichzeitig verbinden.';
    if(n.includes('schnittpunkt'))return'Am gemeinsamen Punkt müssen alle Koordinaten beider Parameterdarstellungen gleichzeitig übereinstimmen.';
    if(n.includes('punktprobe'))return'Der Verbindungsvektor vom Stützpunkt zum Prüfpunkt muss ein Vielfaches des Richtungsvektors sein.';
    if(n.includes('ableit'))return'Beschreibt lokale Änderung oder Tangentensteigung.';
    if(n.includes('mittel')||n.includes('differenz'))return'Vergleicht die Gesamtänderung mit der Intervalllänge.';
    if(n.includes('gerade'))return'Verbindet einen festen Punkt mit einer Richtung.';
    if(n.includes('länge')||n.includes('abstand'))return'Überträgt den Satz des Pythagoras auf Koordinaten.';
    return'Nutze die Formel erst nach Klärung ihrer Voraussetzungen, Größen und Kontrollmöglichkeiten.';
  }

  function renderGraph() {
    main.innerHTML=`<div class="page">${pageHead('GRAPHEN-LABOR','Parameter sehen und begründen','Verändere Funktionen dynamisch. Beschreibe vor jeder Änderung deine Vorhersage und kontrolliere sie anschließend am Graphen.')}
      <div class="graph-layout"><div class="card controls"><label>Funktionstyp</label><select id="gtype"><option value="poly">Polynom ax³+bx²+cx+d</option><option value="quad">Parabel a(x−c)²+d</option><option value="sin">Sinus a·sin(b(x−c))+d</option></select>${['a','b','c','d'].map(k=>`<label>Parameter ${k}</label><div class="range-row"><input id="${k}" type="range" min="-5" max="5" step="0.25" value="${k==='a'?1:0}"><output id="${k}o">${k==='a'?1:0}</output></div>`).join('')}<label class="check-label"><input id="show-der" type="checkbox" checked> Ableitung anzeigen</label><label>Vorhersage vor Änderung</label><textarea id="graph-prediction" placeholder="Wenn ich … ändere, dann …"></textarea><button class="btn" id="save-graph-insight">Vorhersage speichern</button><div class="insight" id="graph-info"></div></div><div class="card graph-wrap"><canvas id="graph-canvas" width="1000" height="600"></canvas><div class="legend"><span><i></i> f(x)</span><span><i class="derivative"></i> f′(x)</span></div></div></div>
    </div>`;
    ['a','b','c','d'].forEach(k=>document.getElementById(k).oninput=()=>{document.getElementById(`${k}o`).value=document.getElementById(k).value;drawGraph();});
    document.getElementById('gtype').onchange=drawGraph;document.getElementById('show-der').onchange=drawGraph;document.getElementById('save-graph-insight').onclick=()=>{const text=document.getElementById('graph-prediction').value.trim();if(text.length<15)return toast('Formuliere eine echte Vorhersage.');state.xp+=5;saveState();toast('Vorhersage gespeichert · +5 XP');};drawGraph();
  }

  function drawGraph(){const canvas=document.getElementById('graph-canvas');if(!canvas)return;const ctx=canvas.getContext('2d'),type=document.getElementById('gtype').value;const a=+document.getElementById('a').value,b=+document.getElementById('b').value,c=+document.getElementById('c').value,d=+document.getElementById('d').value;const W=canvas.width,H=canvas.height,xmin=-10,xmax=10,ymin=-10,ymax=10;const X=x=>(x-xmin)/(xmax-xmin)*W,Y=y=>H-(y-ymin)/(ymax-ymin)*H;ctx.clearRect(0,0,W,H);ctx.fillStyle=document.documentElement.classList.contains('light')?'#f8fbff':'#071321';ctx.fillRect(0,0,W,H);ctx.strokeStyle='rgba(130,165,205,.13)';ctx.lineWidth=1;for(let i=-10;i<=10;i++){ctx.beginPath();ctx.moveTo(X(i),0);ctx.lineTo(X(i),H);ctx.stroke();ctx.beginPath();ctx.moveTo(0,Y(i));ctx.lineTo(W,Y(i));ctx.stroke();}ctx.strokeStyle='rgba(230,244,255,.55)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(X(0),0);ctx.lineTo(X(0),H);ctx.moveTo(0,Y(0));ctx.lineTo(W,Y(0));ctx.stroke();let f,fp,info;if(type==='poly'){f=x=>a*x**3+b*x**2+c*x+d;fp=x=>3*a*x**2+2*b*x+c;info=`f(x) = ${a}x³ + ${b}x² + ${c}x + ${d}. Die Ableitung ist quadratisch.`;}else if(type==='quad'){f=x=>a*(x-c)**2+d;fp=x=>2*a*(x-c);info=`Scheitel S(${c}|${d}), Öffnungsfaktor a=${a}. Nullstelle der Ableitung bei x=${c}.`;}else{f=x=>a*Math.sin(b*(x-c))+d;fp=x=>a*b*Math.cos(b*(x-c));info=`Amplitude ${Math.abs(a)}, Periode ${b?(2*Math.PI/Math.abs(b)).toFixed(2):'nicht periodisch'}, Mittellinie y=${d}.`;}plot(ctx,f,'#46d7ff',X,Y,xmin,xmax);if(document.getElementById('show-der').checked)plot(ctx,fp,'#ffb45e',X,Y,xmin,xmax);document.getElementById('graph-info').textContent=info;}
  function plot(ctx,fn,color,X,Y,xmin,xmax){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();let started=false;for(let px=0;px<=1000;px++){const x=xmin+(xmax-xmin)*px/1000,y=fn(x);if(!Number.isFinite(y)||Math.abs(y)>100){started=false;continue;}const xx=X(x),yy=Y(y);if(!started){ctx.moveTo(xx,yy);started=true;}else ctx.lineTo(xx,yy);}ctx.stroke();}

  function renderSettings() {
    main.innerHTML=`<div class="page">${pageHead('SYSTEM','Einstellungen','Alle Daten bleiben lokal in diesem Browser. Keine Anmeldung, Cloud oder Konten.')}
      <div class="card"><div class="settings-row"><div><strong>Helles Design</strong><p class="subtitle">Für helle Umgebung.</p></div><div class="toggle ${state.theme==='light'?'on':''}" id="theme-toggle"><i></i></div></div><div class="settings-row"><div><strong>Bewegungen reduzieren</strong><p class="subtitle">Weniger Scroll- und Übergangsanimation.</p></div><div class="toggle ${state.settings.reducedMotion?'on':''}" id="motion-toggle"><i></i></div></div><div class="settings-row"><div><strong>Lernstand zurücksetzen</strong><p class="subtitle">Entfernt Mastery, Fehler, XP und Klausuren dauerhaft auf diesem Gerät.</p></div><button class="btn danger" id="reset-all">Alles löschen</button></div><div class="settings-row"><div><strong>Technischer Status</strong><p class="subtitle">GitHub Flat · kein npm · lokale Speicherung · MathJax · Rechenweg-Rubrik · Teilpunkte · 3D-Canvas · Generator- und Äquivalenz-Engine</p></div><span class="pill green">V0.4 UX</span></div></div>
    </div>`;
    document.getElementById('theme-toggle').onclick=()=>{state.theme=state.theme==='light'?'dark':'light';saveState();applyTheme();render();};
    document.getElementById('motion-toggle').onclick=()=>{state.settings.reducedMotion=!state.settings.reducedMotion;saveState();render();};
    document.getElementById('reset-all').onclick=()=>{if(confirm('Wirklich den gesamten lokalen Lernstand löschen?')){try{localStorage.removeItem(STORAGE_KEY);localStorage.removeItem(LEGACY_KEY);localStorage.removeItem(LEGACY_KEY_V2);}catch(error){console.warn('Lokaler Speicher ist in diesem Kontext nicht zugänglich:',error);}state=structuredClone(defaultState);applyTheme();render();}};
  }

  function render() {
    applyTheme();
    navRender();
    clearInterval(timerHandle);
    switch (state.route) {
      case 'curriculum': renderCurriculum(); break;
      case 'learn': renderLearn(); break;
      case 'practiceHub': renderPracticeHub(); break;
      case 'progressHub': renderProgressHub(); break;
      case 'lesson': renderLesson(); break;
      case 'generators': renderGenerators(); break;
      case 'coach': renderCoach(); break;
      case 'pathway': renderPathway(); break;
      case 'diagnostic': renderDiagnostic(); break;
      case 'practice': renderPractice(); break;
      case 'exam': renderExam(); break;
      case 'graph': renderGraph(); break;
      case 'curveLab': renderCurveLab(); break;
      case 'space': renderSpaceLab(); break;
      case 'planner': renderPlanner(); break;
      case 'formulas': renderFormulas(); break;
      case 'errors': renderErrors(); break;
      case 'analytics': renderAnalytics(); break;
      case 'settings': renderSettings(); break;
      default: renderDashboard();
    }
    updateSidebar();
    setTimeout(typeset, 20);
  }

  document.getElementById('menu-btn').onclick = () => document.querySelector('.sidebar').classList.toggle('open');
  document.getElementById('quick-btn').onclick = () => {
    const weakest = [...DATA.lessons].sort((a,b)=>lessonMastery(a.id)-lessonMastery(b.id)).slice(0,4).map(l=>l.id);
    state.practice = createPractice(weakest, 8); route('practice');
  };
  document.addEventListener('click', event => {
    if (innerWidth < 760 && !event.target.closest('.sidebar') && !event.target.closest('#menu-btn')) document.querySelector('.sidebar')?.classList.remove('open');
  });

  render();
  window.addEventListener('load', () => setTimeout(typeset, 250));
})();
