import test from 'node:test';
import assert from 'node:assert/strict';
import { topics, topicById } from '../data/espanol-topics.js';
import { greetings, numberWords, pronouns, wordList } from '../data/espanol-campo-content.js';
import { createRun, questions, submit, summary, finish } from '../js/core.js';

test('seven topics have the requested order and independently answerable quizzes', () => {
  assert.deepEqual(topics.map(t => t.title), ['AR-verbos', 'IR-verbos', 'ER-verbos', 'Saludos y frases', 'Números 1–15', 'Pronombres', 'Palabras']);
  assert.deepEqual(topics.map(t => questions(t).length), [12, 12, 12, 19, 21, 11, 14]);
  assert.equal(topics.flatMap(questions).length, 101);
  assert.equal(new Set(topics.map(t => t.id)).size, 7);
  assert.equal(new Set(topics.map(t => t.slug)).size, 7);
  for (const topic of topics) {
    assert.equal(topicById(topic.id), topic);
    assert.equal(topic.version, 1);
    assert.equal(topic.persistent, true);
    assert.equal(topic.worksheet, 'output/pdf/espanol-temas.pdf');
    assert.ok(!('plan' in topic) && !('extra' in topic));
    const run = createRun(topic);
    for (const section of topic.sections) {
      assert.ok(section.instruction.es);
      assert.ok(section.studyWords.length);
      assert.doesNotMatch(section.title + section.instruction.es + section.lessonText.es, /semana|week|uke|minutos|15[–-]20/i);
      for (const q of section.questions) {
        if (q.type === 'choice') {
          assert.equal(new Set(q.options).size, q.options.length);
          assert.equal(q.options.filter(option => q.answers.includes(option)).length, 1);
        }
        assert.equal(submit(run, q, q.answers[0]), 'correct', q.id);
      }
    }
    assert.ok(finish(run, topic));
    assert.equal(summary(run, topic).score, questions(topic).length);
  }
});

test('all 101 saved question IDs survive the reorganisation exactly once', () => {
  const numbered = (prefix, count, start = 1) => Array.from({ length: count }, (_, i) => prefix + (i + start));
  const expected = [
    ...numbered('s1-saludo-', 13), 's1-saludo-write-ok', 's1-saludo-write-dia', 's1-saludo-write-cansado',
    ...numbered('s1-numero-', 15), ...[2, 7, 10].map(n => `s1-numero-repaso-${n}`),
    ...numbered('s1-pronombre-', 8), ...numbered('s1-palabra-', 11),
    ...['ar', 'er', 'ir'].flatMap(group => [
      ...numbered(`s2-${group}-build-`, 6, 0), ...numbered(`s2-${group}-write-`, 6, 0),
      ...['numero', 'saludo', 'pronombre', 'palabra'].map(kind => `s2-${group}-repaso-${kind}`)
    ])
  ];
  assert.deepEqual(topics.flatMap(questions).map(q => q.id).sort(), expected.sort());
});

test('cards cover every source item and game pairs are unambiguous', () => {
  for (const [id, words] of [['espanol-saludos', greetings], ['espanol-numeros', numberWords], ['espanol-pronombres', pronouns], ['espanol-palabras', wordList]]) {
    const topic = topicById(id);
    assert.deepEqual(topic.cards.map(c => c.front), words.map(w => w.es));
    assert.deepEqual(topic.cards.map(c => c.back), words.map(w => w.nb));
  }
  assert.deepEqual(new Set(topics.map(t => t.game)), new Set(['match', 'memory']));
  for (const topic of topics) {
    assert.ok(topic.pairs.length > 0 && topic.pairs.length <= 6);
    assert.equal(new Set(topic.pairs.map(p => p.left)).size, topic.pairs.length, topic.id);
    assert.equal(new Set(topic.pairs.map(p => p.right)).size, topic.pairs.length, topic.id);
    for (const pair of topic.pairs) assert.ok(topic.cards.some(c => c.front === pair.left && c.back === pair.right), `${topic.id}: ${pair.left}`);
  }
  assert.ok(topicById('espanol-saludos').cards.some(c => c.front === 'Estoy OK'));
  assert.doesNotMatch(JSON.stringify(topics), /más o menos/i);
});

test('all six verb paradigms keep correct spelling, accents, and regularity labels', () => {
  const expected = {
    hablar: ['hablo', 'hablas', 'habla', 'hablamos', 'habláis', 'hablan'],
    cantar: ['canto', 'cantas', 'canta', 'cantamos', 'cantáis', 'cantan'],
    vivir: ['vivo', 'vives', 'vive', 'vivimos', 'vivís', 'viven'],
    escribir: ['escribo', 'escribes', 'escribe', 'escribimos', 'escribís', 'escriben'],
    comer: ['como', 'comes', 'come', 'comemos', 'coméis', 'comen'],
    aprender: ['aprendo', 'aprendes', 'aprende', 'aprendemos', 'aprendéis', 'aprenden']
  };
  for (const [verb, answers] of Object.entries(expected)) {
    const topic = topicById(`espanol-${verb.slice(-2)}`);
    const qs = questions(topic).filter(q => q.verb === verb);
    assert.equal(qs.length, 6);
    assert.equal(topic.regularity, 'Regular');
    assert.deepEqual(qs.map(q => q.answers[0].replace(' + ', '')), answers, verb);
    for (const [i, q] of qs.entries()) {
      assert.equal(q.regularity, 'Regular');
      assert.equal(q.verbGroup, '-' + verb.slice(-2).toUpperCase());
      assert.ok(topic.cards.some(c => c.front === `${q.person} · ${verb}` && c.back === answers[i]));
      if (q.type === 'pieces') {
        const [stem, ending] = q.answers[0].split(' + ');
        assert.equal(q.pieces.fixedStem, stem);
        assert.ok(q.pieces.endings.includes(ending));
      }
    }
  }
  const qs = topics.flatMap(questions);
  assert.deepEqual(qs.find(q => q.id === 's1-palabra-9').answers, ['qué', '¿qué?']);
  assert.deepEqual(qs.find(q => q.id === 's1-saludo-write-cansado').answers,
    ['Estoy cansada', 'Estoy cansado', '¡Estoy cansada!', '¡Estoy cansado!']);
});
