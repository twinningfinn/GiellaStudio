import test from 'node:test';
import assert from 'node:assert/strict';
import week1 from '../data/espanol-semana-1.js';
import week2 from '../data/espanol-semana-2.js';
import { createRun, getRecord, questions, submit, finish, summary } from '../js/core.js';

test('two Spanish weeks offer three short sessions and complete answerable paths', () => {
  const ids = new Set();
  for (const pack of [week1, week2]) {
    assert.equal(pack.sections.length, 3);
    assert.equal(pack.persistent, true);
    assert.match(pack.worksheet, /^output\/pdf\/espanol-semana-[12]\.pdf$/);
    const run = createRun(pack);
    for (const section of pack.sections) {
      assert.ok(section.lessonText.se && section.lessonText.nb);
      assert.ok(section.studyWords.length);
      assert.ok(section.questions.length >= 12 && section.questions.length <= 20);
      for (const q of section.questions) {
        assert.ok(!ids.has(q.id), `duplicate id ${q.id}`);
        ids.add(q.id);
        assert.ok(q.hint.se && q.hint.nb && q.explanation.se && q.explanation.nb);
        if (q.type === 'choice') {
          assert.equal(new Set(q.options).size, q.options.length);
          assert.equal(q.options.filter(a => q.answers.includes(a)).length, 1);
        }
        assert.equal(submit(run, q, q.answers[0]), 'correct', q.id);
      }
    }
    assert.ok(finish(run, pack));
    assert.equal(summary(run, pack).score, questions(pack).length);
  }
});

test('week one uses the latest greetings and exercises every number 1–15', () => {
  const text = JSON.stringify([week1, week2]);
  assert.match(text, /Estoy OK/);
  assert.doesNotMatch(text, /más o menos/i);
  const answers = questions(week1).flatMap(q => q.answers);
  for (const word of ['uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince']) assert.ok(answers.includes(word), word);
  for (const phrase of ['¡Hola!', '¿Cómo estás?', '¿Cómo te llamas?', 'Me llamo…', 'Buenos días', 'Buenas tardes', 'Buenas noches', 'Estoy MUY bien', 'Estoy bien', 'Estoy OK', 'No estoy bien', '¡Estoy triste!']) assert.ok(answers.includes(phrase), phrase);
  for (const word of ['hablar', 'Noruega', 'estudiar', 'mucho', 'un libro', 'lo siento', 'pero', 'no', '¿qué?', 'vivir', 'escuchar']) assert.ok(answers.includes(word), word);
  const tired = questions(week1).find(q => q.id === 's1-saludo-write-cansado');
  for (const answer of ['Estoy cansada', 'Estoy cansado']) assert.equal(submit(createRun(week1), tired, answer), 'correct');
});

test('all six person groups have the correct regular conjugations for six workbook verbs', () => {
  const expected = {
    hablar: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
    cantar: ['canto', 'cantas', 'canta', 'cantamos', 'cantáis', 'cantan'],
    comer: ['como', 'comes', 'come', 'comemos', 'coméis', 'comen'],
    aprender: ['aprendo', 'aprendes', 'aprende', 'aprendemos', 'aprendéis', 'aprenden'],
    vivir: ['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven'],
    escribir: ['escribo', 'escribes', 'escribe', 'escribimos', 'escribís', 'escriben']
  };
  for (const [verb, answers] of Object.entries(expected)) {
    const qs = questions(week2).filter(q => q.verb === verb);
    assert.equal(qs.length, 6, verb);
    assert.equal(new Set(qs.map(q => q.person)).size, 6);
    assert.deepEqual(qs.map(q => q.answers[0].replace(' + ', '')), answers, verb);
    for (const q of qs) {
      assert.equal(q.regularity, 'Regular');
      assert.equal(q.verbGroup, '-' + verb.slice(-2).toUpperCase());
      assert.equal(q.studyForms.length, 6);
      if (q.type === 'pieces') {
        const [stem, ending] = q.answers[0].split(' + ');
        assert.equal(q.pieces.fixedStem, stem);
        assert.ok(q.pieces.endings.includes(ending));
      }
    }
  }
});

test('feedback distinguishes an accented verb form and allows correction', () => {
  const q = questions(week2).find(q => q.answers.includes('cantáis'));
  const run = createRun(week2);
  assert.equal(submit(run, q, 'cantais'), 'retry');
  assert.equal(submit(run, q, 'cantáis'), 'correct');
  assert.deepEqual(getRecord(run, q.id).attempts, ['cantais', 'cantáis']);
  assert.match(q.hint.nb, /-áis/);
});
