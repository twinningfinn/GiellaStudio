// Puhdas harjoituslogiikka. Ei verkkoa, henkilötietoja tai pysyvää tietokantaa.
export function normalize(value) {
  return String(value).normalize('NFC').trim().toLocaleLowerCase('es').replace(/\s+/g, ' ').replace(/[.!?]+$/u, '');
}
export function questions(pack) { return pack.sections.flatMap(section => section.questions); }
export function createRun(pack, now = new Date().toISOString()) {
  return { version: pack.version, started: now, finished: null, cursor: 0, view: 'intro', extra: '', records: {} };
}
export function getRecord(run, id) {
  return run.records[id] ||= { attempts: [], hint: false, model: false, done: false, correct: false };
}
export function submit(run, question, value) {
  const record = getRecord(run, question.id);
  if (record.done) return 'locked';
  const clean = String(value).trim().slice(0, 500);
  if (!clean) return 'empty';
  record.attempts.push(clean);
  record.correct = question.answers.some(answer => normalize(answer) === normalize(clean));
  record.model = !record.correct && record.attempts.length >= 3;
  record.done = record.correct || record.model;
  return record.correct ? 'correct' : record.model ? 'model' : 'retry';
}
export function summary(run, pack) {
  const all = questions(pack);
  const records = all.map(q => getRecord(run, q.id));
  const score = records.filter(r => r.correct && !r.model).length;
  return { total: all.length, completed: records.filter(r => r.done).length, score,
    percent: all.length ? Math.round(score / all.length * 100) : 0,
    first: records.filter(r => r.correct && r.attempts.length === 1).length,
    models: records.filter(r => r.model).length, hints: records.filter(r => r.hint).length };
}
export function finish(run, pack, now = new Date().toISOString()) {
  const result = summary(run, pack);
  if (result.completed !== result.total) return false;
  run.finished ||= now;
  run.view = 'results';
  return true;
}
export function restoreRun(raw, pack) {
  try {
    const saved = JSON.parse(raw);
    if (saved.version !== pack.version || !Number.isFinite(Date.parse(saved.started))) return null;
    const run = createRun(pack, saved.started);
    const all = questions(pack);
    for (const question of all) {
      const entry = saved.records?.[question.id];
      if (!entry) continue;
      if (!Array.isArray(entry.attempts) || entry.attempts.length > 3) return null;
      getRecord(run, question.id).hint = entry.hint === true;
      for (const attempt of entry.attempts) {
        if (typeof attempt !== 'string') return null;
        submit(run, question, attempt);
      }
    }
    const firstOpen = all.findIndex(q => !getRecord(run, q.id).done);
    const maxCursor = firstOpen === -1 ? all.length - 1 : firstOpen;
    run.cursor = Number.isInteger(saved.cursor) ? Math.max(0, Math.min(saved.cursor, maxCursor)) : 0;
    run.extra = typeof saved.extra === 'string' ? saved.extra.slice(0, pack.extra?.maxLength || 500) : '';
    run.view = saved.view === 'intro' ? 'intro' : 'exercise';
    if (firstOpen === -1 && ['extra', 'results'].includes(saved.view)) run.view = saved.view;
    if (run.view === 'results') {
      if (!Number.isFinite(Date.parse(saved.finished))) return null;
      finish(run, pack, saved.finished);
    }
    return run;
  } catch { return null; }
}
